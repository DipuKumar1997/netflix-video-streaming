package com.comm.netflix.service.impl;

import com.comm.netflix.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
@RequiredArgsConstructor
public class S3StorageServiceImpl implements StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.cloudfront.domain}")
    private String cdnDomain;

    @Override
    public Resource loadLocalResource(String videoId, String filePath) {
        throw new UnsupportedOperationException("Production streaming uses direct CDN redirection.");
    }

    @Override
    public String generatePlaybackUrl(String videoId, String filePath) {
        // Generates direct CloudFront CDN URL for low-latency edge delivery
        // 1. Remove surrounding quotes and trailing slashes from domain
        String cleanDomain = cdnDomain.replaceAll("^\"|\"$", "").replaceAll("/+$", "");

        // 2. Remove leading slashes and fix double slashes in path
        String cleanFilePath = filePath.replaceAll("^/+", "").replaceAll("//+", "/");

        // 3. Construct clean CDN URL
        return String.format("%s/%s/%s", cleanDomain, videoId, cleanFilePath);
    }

    @Override
    public boolean exists(String videoId, String filePath) {
        try {
            //  String objectKey = String.format("%s/%s", videoId, filePath);
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(videoId + "/" + filePath)
                    .build());
            return true;
        } catch (Exception e) {
            log.warn("S3 Object not found: {}/{}", videoId, filePath);
            return false;
        }
    }


   @Override
    public void uploadHlsFolder(String videoId, Path hlsFolderPath) {
        log.info("Uploading HLS folder for videoId={} to bucket={}",videoId, bucketName);
        if (!Files.isDirectory(hlsFolderPath)) {
            throw new IllegalArgumentException("HLS directory does not exist: " + hlsFolderPath);
        }
        try {
            // Validate every expected rendition before uploading.
            for (String quality : new String[]{"360p", "720p", "1080p"}) {
                Path playlist = hlsFolderPath.resolve(quality).resolve("index.m3u8");
                if (!Files.isRegularFile(playlist) || Files.size(playlist) == 0) {
                    throw new IllegalStateException( "Missing or empty playlist for " + quality + ": " + playlist);
                }
            }
            Path masterPlaylist = hlsFolderPath.resolve("master.m3u8");
            if (!Files.isRegularFile(masterPlaylist) || Files.size(masterPlaylist) == 0) {
                throw new IllegalStateException("Missing or empty master playlist: " + masterPlaylist);
            }
            // Upload every file recursively.
            try (Stream<Path> paths = Files.walk(hlsFolderPath)) {
                paths.filter(Files::isRegularFile).forEach(file -> {
                    try {
                        String relativePath = hlsFolderPath .relativize(file) .toString() .replace(File.separatorChar, '/');
                        String s3Key = videoId + "/" + relativePath;
                        String contentType;
                        if (relativePath.endsWith(".m3u8")) {
                            contentType = "application/vnd.apple.mpegurl";
                        } else if (relativePath.endsWith(".ts")) {
                            contentType = "video/mp2t";
                        } else {
                            contentType = "application/octet-stream";
                        }
                        long size = Files.size(file);
                        log.info("Uploading local file={} size={} bytes to s3://{}/{}", file, size, bucketName, s3Key);

                        s3Client.putObject(  PutObjectRequest.builder() .bucket(bucketName) .key(s3Key) .contentType(contentType) .build(), RequestBody.fromFile(file) );
                        // Verify that S3 has the uploaded object.
                        s3Client.headObject(  HeadObjectRequest.builder() .bucket(bucketName) .key(s3Key) .build());
                        log.info("Verified S3 object: s3://{}/{}", bucketName, s3Key);
                    } catch (Exception e) {
                        throw new RuntimeException(  "Failed to upload or verify file: " + file, e);
                    }
                });
            }
            log.info("All HLS files uploaded and verified for videoId={}", videoId);
            // Clean up only after every upload has succeeded.
            FileUtils.deleteDirectory(hlsFolderPath.toFile());
            log.info("Cleaned up local HLS directory: {}", hlsFolderPath);

        } catch (Exception e) {
            log.error("HLS upload failed for videoId={}", videoId, e);
            throw new RuntimeException("S3 HLS upload failed for " + videoId, e);
        }
    }
    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) deleteDirectory(f);
        }
        dir.delete();
    }

}
package com.comm.netflix.controller;

import com.comm.netflix.service.StorageService;
import com.comm.netflix.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.example.commonmodel.entity.Video;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@Slf4j
@RestController
@RequestMapping("/stream")
public class VideoController {

    private final VideoService videoService;
    private final StorageService storageService;

    @Value("${storage.type:local}")
    private String storageType;

    @Value("${hsl.folder:hsl-videos}")
    private String hslFolder;

    public VideoController(VideoService videoService, StorageService storageService) {
        this.videoService = videoService;
        this.storageService = storageService;
    }
     private boolean canAccessVideo(Video video, Authentication authentication) {
        // Free videos are accessible by everyone.
        if (!video.isPremium()) {
            return true;
        }

        // Premium videos require authentication and ROLE_PREMIUM.
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(granted ->
                        "ROLE_PREMIUM".equals(granted.getAuthority()));
    }

    /**
     * Single Whole Video Stream Endpoint
     */
    @GetMapping("/{videoId}")
    public ResponseEntity<?> stream(@PathVariable String videoId, Authentication authentication) {
        Video video = videoService.getVideo(videoId);
        if (!canAccessVideo(video, authentication)) {
            log.warn("Access denied for videoId: {}. Premium subscription required.", videoId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN) .body("Premium subscription required to access this video.");
        }
        log.info("Streaming whole video metadata: {}, Path: {}", video.getTitle(), video.getVideoPath());
        FileSystemResource fileSystemResource = new FileSystemResource(video.getVideoPath());
        String contentType = video.getContentType() != null ? video.getContentType() : "video/mp4";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileSystemResource);
    }

    /**
     * HLS Adaptive Bitrate Playlist (.m3u8) & Segment (.ts) Delivery Endpoint
     * - Production ("s3"): Redirects player directly to AWS CloudFront CDN (302 Found)
     * - Local ("local"): Streams local HLS files directly from disk
     */
    @GetMapping("/{videoId}/{*filePath}")
    public ResponseEntity<?> serveHlsFiles(
            @PathVariable String videoId,
            @PathVariable String filePath,
            Authentication authentication) {
        Video video = videoService.getVideo(videoId);
        // Enforce Premium Access Gate
        if (!canAccessVideo(video, authentication)) {
            log.warn("HLS streaming forbidden for videoId: {}. User lack ROLE_PREMIUM.", videoId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Premium subscription required to stream this content.");
        }

        // PRODUCTION: Offload byte distribution to CDN
        if ("s3".equalsIgnoreCase(storageType)) {
            String rawUrl = storageService.generatePlaybackUrl(videoId, filePath);
            String cleanUrl = rawUrl.trim().replaceAll("^\"|\"$", "");

            log.info("Redirecting client player to CDN: {}", cleanUrl);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(cleanUrl))
                    .build();
        }

        // LOCAL DEV: Stream directly from host filesystem
        if (!storageService.exists(videoId, filePath)) {
            log.warn("HLS asset missing for videoId: {}, path: {}", videoId, filePath);
            return ResponseEntity.notFound().build();
        }

        Resource resource = storageService.loadLocalResource(videoId, filePath);
        String contentType = filePath.endsWith(".m3u8")
                ? "application/vnd.apple.mpegurl"
                : "video/mp2t";

//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_TYPE, contentType)
//                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
//                .body(resource);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, contentType)
            .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
            .body(resource);
    }

    /*
     * ===================================================================================
     *                        HISTORICAL & REFERENCE IMPLEMENTATIONS
     * ===================================================================================
     * The code below documents alternative streaming strategies developed during iteration.
     * Retained for reference and manual chunk testing.
     * ===================================================================================
     */

    /*
    // REFERENCE 1: Explicit Master Playlist (.m3u8) Serving with Dynamic Parent Pathing
    @GetMapping("/{videoId}/master.m3u8")
    public ResponseEntity<Resource> serveMasterFileLegacy(@PathVariable String videoId) {
        Path baseDir = Paths.get(hslFolder).toAbsolutePath();
        Path path = baseDir.resolve(videoId).resolve("master.m3u8");

        log.info("Resolving legacy master playlist path: {}", path);

        if (!Files.exists(path)) {
            log.warn("File not found: {}", path);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl")
                .body(resource);
    }
    */

    /*
    // REFERENCE 2: Direct Segment (.ts) Serving Endpoint
    @GetMapping("/{videoId}/{segment}.ts")
    public ResponseEntity<Resource> serveSegmentsLegacy(@PathVariable String videoId, @PathVariable String segment) {
        Path path = Paths.get(hslFolder, videoId, segment + ".ts");
        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "video/mp2t")
                .body(resource);
    }
    */

    /*
    // REFERENCE 3: HTTP 206 Partial Content Streaming via Byte Skipping (InputStream)
    @GetMapping("/range/stream-inputstream/{videoId}")
    public ResponseEntity<Resource> streamRangeInputStream(
            @PathVariable String videoId,
            @RequestHeader(value = "Range", required = false) String range) throws IOException {

        log.info("Range Header Received: {}", range);
        Video video = videoService.getVideo(videoId);
        Path path = Paths.get(video.getVideoPath());
        Resource resource = new FileSystemResource(path);
        String contentType = video.getContentType() != null ? video.getContentType() : "application/octet-stream";

        long fileLength = Files.size(path);
        if (range == null) {
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
        }

        String[] ranges = range.replace("bytes=", "").split("-");
        long rangeStart = Long.parseLong(ranges[0]);
        long rangeEnd = (ranges.length > 1) ? Long.parseLong(ranges[1]) : fileLength - 1;

        if (rangeEnd > fileLength - 1) {
            rangeEnd = fileLength - 1;
        }

        InputStream inputStream;
        try {
            inputStream = Files.newInputStream(path);
            inputStream.skip(rangeStart);
        } catch (IOException e) {
            log.error("Error creating stream for videoId: {}", videoId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resource);
        }

        long contentLength = rangeEnd - rangeStart + 1;
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength);
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.setContentLength(contentLength);

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .headers(headers)
                .contentType(MediaType.parseMediaType(contentType))
                .body(new org.springframework.core.io.InputStreamResource(inputStream));
    }
    */

    /*
    // REFERENCE 4: HTTP 206 Fixed-Chunk Streaming via ByteArrayResource
    @GetMapping("/range/{videoId}")
    public ResponseEntity<Resource> streamVideoRange(
            @PathVariable String videoId,
            @RequestHeader(value = "Range", required = false) String range) {

        log.info("Range header: {}", range);
        Video video = videoService.getVideo(videoId);
        Path path = Paths.get(video.getVideoPath());
        Resource resource = new FileSystemResource(path);
        String contentType = video.getContentType() != null ? video.getContentType() : "application/octet-stream";

        long fileLength = path.toFile().length();
        if (range == null) {
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
        }

        String[] ranges = range.replace("bytes=", "").split("-");
        long rangeStart = Long.parseLong(ranges[0]);
        long rangeEnd = rangeStart + com.comm.netflix.AppConstants.CHUNK_SIZE - 1;

        if (rangeEnd > fileLength - 1) {
            rangeEnd = fileLength - 1;
        }

        try (InputStream inputStream = Files.newInputStream(path)) {
            inputStream.skip(rangeStart);
            long contentLength = rangeEnd - rangeStart + 1;
            byte[] data = new byte[(int) contentLength];
            int readBytes = inputStream.read(data, 0, data.length);
            log.info("Bytes read: {}", readBytes);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength);
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("X-Content-Type-Options", "nosniff");
            headers.setContentLength(contentLength);

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new ByteArrayResource(data));
        } catch (IOException ex) {
            log.error("Failed to stream video chunk for id: {}", videoId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    */
}
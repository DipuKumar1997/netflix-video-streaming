package com.comm.netflix.service.impl;

import com.comm.netflix.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import lombok.extern.slf4j.XSlf4j;
import org.apache.kafka.shaded.io.opentelemetry.proto.trace.v1.StatusOrBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageServiceImpl implements StorageService {

     @Value ("${hsl.folder:/var/media/hsl-videos}")
    private String hslDir;


    @Override
    public Resource loadLocalResource(String videoId, String filePath) {
        Path path = Paths.get ( hslDir, videoId, filePath );
        System.out.println ("path from loadLocalResource ==========================");
        System.out.println (path.toString ());
        System.out.println ("path from loadLocalResource end ==========================");
        return new FileSystemResource ( path );
    }

    @Override
    public String generatePlaybackUrl(String videoId, String filePath) {
        return "/stream/" + videoId + "/" + filePath;
    }

    @Override
    public boolean exists(String videoId, String filePath) {
        return Files.exists(Paths.get(hslDir, videoId, filePath));
    }

    @Override
    public void uploadHlsFolder(String videoId, Path hlsFolderPath) {
        log.info("Local storage active. HLS files stored at: {}", hlsFolderPath.toAbsolutePath());
    }
}

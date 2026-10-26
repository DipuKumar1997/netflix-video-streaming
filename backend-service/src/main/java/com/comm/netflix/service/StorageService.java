package com.comm.netflix.service;

import org.springframework.core.io.Resource;

import java.nio.file.Path;

public interface StorageService {
    Resource loadLocalResource(String videoId, String filePath);
    String generatePlaybackUrl(String videoId, String filePath);
    boolean exists(String videoId, String filePath);
    void uploadHlsFolder(String videoId, Path hlsFolderPath);
}
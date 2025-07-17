package com.comm.netflix.service.impl;

//import com.comm.netflix.entity.Video;
import com.comm.netflix.repos.VideoRepos;
import com.comm.netflix.service.VideoService;
import jakarta.annotation.PostConstruct;
import org.example.commonmodel.entity.Video;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public  class VideoServiceImpl implements VideoService {
//    @Autowired
    private final VideoRepos videoRepos;
    @Value("${files.video}")
    String DIR;
//
    public VideoServiceImpl(VideoRepos videoRepos) {
        this.videoRepos = videoRepos;
    }

    @PostConstruct
    public void init() {
        File dir = new File(DIR);
        if (!dir.exists()) {
            dir.mkdir();
            System.out.println("Directory created: " + dir.getAbsolutePath());
        }else {
            System.out.println("Directory already exists: " + dir.getAbsolutePath());
        }
    }
    @Override
    public Video saveVideo(Video video, MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();//png or jpg or mp4
            //read stream from input stream
            InputStream inputStream = file.getInputStream();
            //folder path
            //clean file and folder path
            String cleanFileName = StringUtils.cleanPath(fileName);
            String cleanFOlder = StringUtils.cleanPath(DIR);

            //print or get full path
            Path path = Paths.get(cleanFOlder, cleanFileName);
            System.out.println(path);
            //folder path with filename

            //copy file using Files class
            Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);

            // Set metadata
            video.setVideoId(UUID.randomUUID().toString()); // or leave null for MongoDB to autogenerate
            video.setTitle(fileName);
            video.setDescription("Video file uploaded");
            video.setContentType(contentType);
            video.setVideoPath(path.toString());//getAbsolutePath()

            // OPTIONAL: Save file path in video entity
            // video.setPath(filePath.toString());

            // Save video document to MongoDB
            return videoRepos.save(video);

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        //abc.png --->>> abc
        //copy file to the folder
        //video metadata save in database
    }
    @Override
    public Video getVideo(String videoId) {
        System.out.println("Looking for videoId: " + videoId);
//        return videoRepos.findByVideoId()
//        VideoRepos videoRepos = VideoServiceImpl.findById();
        return videoRepos.findByVideoId(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
    }
    @Override
    public Video getByTitle(String title) {
        return null;
    }
}

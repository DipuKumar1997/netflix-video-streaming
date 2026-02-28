package com.comm.netflix.service.impl;

import com.comm.netflix.repos.VideoRepos;
import com.comm.netflix.service.VideoService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.commonmodel.entity.Video;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
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

@Slf4j
@Service
public  class VideoServiceImpl implements VideoService {
    //    @Autowired
    private final VideoRepos videoRepos;
    @Value("${files.video}")
    String DIR;

    @Value("${hsl.folder}")
    String HSL_DIR;

    public VideoServiceImpl(VideoRepos videoRepos) {
        this.videoRepos = videoRepos;
    }

    @PostConstruct
    public void init() {
        File dir = new File(DIR);
        File dir2 = new File(HSL_DIR);
        if (!dir.exists()) {
            dir.mkdir();
            System.out.println("Directory created: " + dir.getAbsolutePath());
        }else {
            System.out.println("Directory already exists: " + dir.getAbsolutePath());
        }
        if (!dir2.exists()) {
            dir2.mkdir();
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
            Video save = videoRepos.save ( video );
            processVideo(save.getVideoPath (), file,video.getVideoId ());
            return save;

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        //abc.png --->>> abc
        //copy file to the folder
        //video metadata save in database
    }

    @Async
    private void processVideo(String videoPath, MultipartFile file, String videoId) {
        String output360P = HSL_DIR+videoId+"/360p";
        String output720P = HSL_DIR+videoId+"/720";
        String output1080P = HSL_DIR+videoId+"/1080";
        //      run in server or pass in the message queue forui processing
        //        StringBuilder ffmpegCommand = new StringBuilder ();
        //        ffmpegCommand.append (  )

        try {
//            Files.createDirectories ( Paths.get ( output720P ) );
//            Files.createDirectories ( Paths.get ( output360P ) );
//            Files.createDirectories ( Paths.get ( output1080P ) );

//            Path basePath = Paths.get(HSL_DIR, videoId);
//            Path p360 = basePath.resolve("360p");
//            Path p720 = basePath.resolve("720p");
//            Path p1080 = basePath.resolve("1080p");
//            Files.createDirectories(p360);
//            Files.createDirectories(p720);
//            Files.createDirectories(p1080);
            final String HSL_DIR =
                    Paths.get("..", "hsl-videos")
                            .toAbsolutePath()
                            .normalize()
                            .toString();

            Path basePath = Paths.get(HSL_DIR, videoId);
            Files.createDirectories(basePath.resolve("360p"));
            Files.createDirectories(basePath.resolve("720p"));
            Files.createDirectories(basePath.resolve("1080p"));

            Path outputPath = Paths.get(HSL_DIR, videoId);
            /*
                String ffmpegCmd = String.format(
                        "ffmpeg -i \"%s\" -c:v libx264 -c:a aac -strict -2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename \"%s/segment_%%3d.ts\"  \"%s/master.m3u8\" ",
                        videoPath, outputPath, outputPath
                );
            */
            String ffmpegCmd = String.format("""
                    ffmpeg -i "%s" \
                    -filter_complex "[0:v]split=3[v1][v2][v3]; \
                    [v1]scale=w=640:h=360[v1out]; \
                    [v2]scale=w=1280:h=720[v2out]; \
                    [v3]scale=w=1920:h=1080[v3out]" \
                    -map [v1out] -map 0:a -c:v:0 libx264 -b:v:0 800k  -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "%s/360p/segment_%%03d.ts"  "%s/360p/index.m3u8" \
                    -map [v2out] -map 0:a -c:v:1 libx264 -b:v:1 1400k -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "%s/720p/segment_%%03d.ts"  "%s/720p/index.m3u8" \
                    -map [v3out] -map 0:a -c:v:2 libx264 -b:v:2 2800k -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "%s/1080p/segment_%%03d.ts" "%s/1080p/index.m3u8"
                    """,
                                        videoPath,
                                        outputPath, outputPath,
                                        outputPath, outputPath,
                                        outputPath, outputPath
                                );
            System.out.println(ffmpegCmd);
            //file this command
            ProcessBuilder processBuilder = new ProcessBuilder("/bin/bash", "-c", ffmpegCmd);
            processBuilder.inheritIO();
            Process process = processBuilder.start();
            int exit = process.waitFor();
            if (exit != 0) {
                throw new RuntimeException("video processing failed!!");
            }
            String masterPlaylist = """
                #EXTM3U
                #EXT-X-VERSION:3
                
                #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
                360p/index.m3u8
                
                #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720
                720p/index.m3u8
                
                #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1920x1080
                1080p/index.m3u8
                """;

                Files.writeString(
                        Paths.get(HSL_DIR, videoId, "master.m3u8"),
                        masterPlaylist
                );
        } catch (IOException e) {
            log.error ( "error occurrence in the process video function during video folder creation" );
            throw new RuntimeException ( e );
        }catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public Video getVideo(String videoId) {
        System.out.println("Looking for videoId: " + videoId);
        //    return videoRepos.findByVideoId()
        //    VideoRepos videoRepos = VideoServiceImpl.findById();
        return videoRepos.findByVideoId(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
    }
    @Override
    public Video getByTitle(String title) {
        return null;
    }
}

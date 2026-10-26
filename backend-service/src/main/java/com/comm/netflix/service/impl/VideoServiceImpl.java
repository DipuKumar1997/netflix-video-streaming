package com.comm.netflix.service.impl;

import com.comm.netflix.repos.VideoRepos;
import com.comm.netflix.service.StorageService;
import com.comm.netflix.service.VideoService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.commonmodel.entity.Video;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Service
public  class VideoServiceImpl implements VideoService {

    private final VideoRepos videoRepos;
    private final StorageService storageService;

    @Value("${files.video:videos}")
    String DIR;

    @Value("${hsl.folder:hsl-videos}")
    String HSL_DIR;

    public VideoServiceImpl(VideoRepos videoRepos, StorageService storageService) {
        this.videoRepos = videoRepos;
        this.storageService = storageService;
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
    public Video saveVideo(Video video, MultipartFile file,boolean isPremium) {
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
            video.setPremium(isPremium);

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

//    @Async
//    private void processVideo(String videoPath, MultipartFile file, String videoId) {
//        String output360P = HSL_DIR+videoId+"/360p";
//        String output720P = HSL_DIR+videoId+"/720";
//        String output1080P = HSL_DIR+videoId+"/1080";
//        //      run in server or pass in the message queue forui processing
//        //        StringBuilder ffmpegCommand = new StringBuilder ();
//        //        ffmpegCommand.append (  )
//
//        try {
////            Files.createDirectories ( Paths.get ( output720P ) );
////            Files.createDirectories ( Paths.get ( output360P ) );
////            Files.createDirectories ( Paths.get ( output1080P ) );
//
////            Path basePath = Paths.get(HSL_DIR, videoId);
////            Path p360 = basePath.resolve("360p");
////            Path p720 = basePath.resolve("720p");
////            Path p1080 = basePath.resolve("1080p");
////            Files.createDirectories(p360);
////            Files.createDirectories(p720);
////            Files.createDirectories(p1080);
//            final String HSL_DIR =
//                    Paths.get("..", "hsl-videos")
//                            .toAbsolutePath()
//                            .normalize()
//                            .toString();
//
//            Path basePath = Paths.get(HSL_DIR, videoId);
//            Files.createDirectories(basePath.resolve("360p"));
//            Files.createDirectories(basePath.resolve("720p"));
//            Files.createDirectories(basePath.resolve("1080p"));
//
//            Path outputPath = Paths.get(HSL_DIR, videoId);
//            /*
//                String ffmpegCmd = String.format(
//                        "ffmpeg -i \"%s\" -c:v libx264 -c:a aac -strict -2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename \"%s/segment_%%3d.ts\"  \"%s/master.m3u8\" ",
//                        videoPath, outputPath, outputPath
//                );
//            */
//            String ffmpegCmd = String.format("""
//                    ffmpeg -i "%s" \
//                    -filter_complex "[0:v]split=3[v1][v2][v3]; \
//                    [v1]scale=w=640:h=360[v1out]; \
//                    [v2]scale=w=1280:h=720[v2out]; \
//                    [v3]scale=w=1920:h=1080[v3out]" \
//                    -map [v1out] -map 0:a -c:v:0 libx264 -b:v:0 800k  -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "%s/360p/segment_%%03d.ts"  "%s/360p/index.m3u8" \
//                    -map [v2out] -map 0:a -c:v:1 libx264 -b:v:1 1400k -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "%s/720p/segment_%%03d.ts"  "%s/720p/index.m3u8" \
//                    -map [v3out] -map 0:a -c:v:2 libx264 -b:v:2 2800k -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "%s/1080p/segment_%%03d.ts" "%s/1080p/index.m3u8"
//                    """,
//                                        videoPath,
//                                        outputPath, outputPath,
//                                        outputPath, outputPath,
//                                        outputPath, outputPath
//                                );
//            System.out.println(ffmpegCmd);
//            //file this command
//            ProcessBuilder processBuilder = new ProcessBuilder("/bin/bash", "-c", ffmpegCmd);
//            processBuilder.inheritIO();
//            Process process = processBuilder.start();
//            int exit = process.waitFor();
//            if (exit != 0) {
//                throw new RuntimeException("video processing failed!!");
//            }
//            String masterPlaylist = """
//                #EXTM3U
//                #EXT-X-VERSION:3
//
//                #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
//                360p/index.m3u8
//
//                #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720
//                720p/index.m3u8
//
//                #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1920x1080
//                1080p/index.m3u8
//                """;
//
//                Files.writeString(
//                        Paths.get(HSL_DIR, videoId, "master.m3u8"),
//                        masterPlaylist
//                );
//        } catch (IOException e) {
//            log.error ( "error occurrence in the process video function during video folder creation" );
//            throw new RuntimeException ( e );
//        }catch (InterruptedException e) {
//            throw new RuntimeException(e);
//        }
//
//    }

    //@Async
    //private void processVideo(String videoPath, MultipartFile file, String videoId) {
    //    try {
    //        // Base directory
    //        final String HSL_DIR = Paths.get("..", "hsl-videos")
    //                .toAbsolutePath().normalize().toString();
    //        Path basePath = Paths.get(HSL_DIR, videoId);
    //
    //        // Create output directories
    //        Files.createDirectories(basePath.resolve("360p"));
    //        Files.createDirectories(basePath.resolve("720p"));
    //         Files.createDirectories(basePath.resolve("1080p"));
    //
    //        // Save uploaded file to disk
    //        Path inputFile = basePath.resolve("input.mp4");
    //        file.transferTo(inputFile.toFile());
    //
    //        // FFmpeg resolutions and bitrates
    //        String[][] resolutions = {
    //                {"360p", "640:360", "800k"},
    //                {"720p", "1280:720", "1400k"},
    //                 {"1080p", "1920:1080", "2800k"}
    //        };
    //        //{"1080p", "1920:1080", "2800k"}
    //        for (String[] res : resolutions) {
    //            String folder = res[0];
    //            String scale = res[1];
    //            String bitrate = res[2];
    //
    //            String ffmpegCmd = String.format(
    //                    "ffmpeg -i \"%s\" -vf scale=%s -c:v libx264 -b:v %s -c:a aac " +
    //                            "-f hls -hls_time 10 -hls_playlist_type vod " +
    //                            "-hls_segment_filename \"%s/segment_%%03d.ts\" \"%s/index.m3u8\"",
    //                    inputFile.toString(),
    //                    scale,
    //                    bitrate,
    //                    basePath.resolve(folder).toString(),
    //                    basePath.resolve(folder).toString()
    //            );
    //
    //            System.out.println("Running FFmpeg: " + ffmpegCmd);
    //
    //            ProcessBuilder pb = new ProcessBuilder("/bin/bash", "-c", ffmpegCmd);
    //            pb.redirectErrorStream(true);
    //            Process process = pb.start();
    //
    //            // Log FFmpeg output
    //            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
    //                reader.lines().forEach(System.out::println);
    //            }
    //
    //            int exitCode = process.waitFor();
    //            if (exitCode != 0) {
    //                throw new RuntimeException("FFmpeg failed for " + folder + " with exit code: " + exitCode);
    //            }
    //        }
    //
    //        // Master playlist
    //        String masterPlaylist = """
    //            #EXTM3U
    //            #EXT-X-VERSION:3
    //
    //            #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
    //            360p/index.m3u8
    //
    //            #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720
    //            720p/index.m3u8
    //
    //            #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1920x1080
    //            1080p/index.m3u8
    //            """;
    //
    //        Files.writeString(basePath.resolve("master.m3u8"), masterPlaylist);
    //
    //        System.out.println("Video processing completed successfully for videoId: " + videoId);
    //
    //        // Clean up temporary raw input file
    //        Files.deleteIfExists(inputFile);
    //        log.info("Triggering storage service sync for videoId: {}", videoId);
    //
    //        // Validate all rendition playlists before uploading.
    //        for (String[] res : resolutions) {
    //            Path playlist = basePath.resolve(res[0]).resolve("index.m3u8");
    //            if (!Files.exists(playlist) || Files.size(playlist) == 0) {
    //                throw new IOException(  "Missing or empty HLS playlist for " + res[0] + ": " + playlist );
    //            }
    //            System.out.println(  "Verified " + res[0] + " playlist: " + playlist  );
    //        }
    //        Path masterPlaylistPath = basePath.resolve("master.m3u8");
    //        if (!Files.exists(masterPlaylistPath) || Files.size(masterPlaylistPath) == 0) {
    //            throw new IOException("Master playlist missing: " + masterPlaylistPath);
    //        }
    //        System.out.println("Uploading HLS folder: " + basePath);
    //        storageService.uploadHlsFolder(videoId, basePath);
    //    } catch (IOException e) {
    //        throw new RuntimeException("Error during video folder creation or file I/O", e);
    //    } catch (InterruptedException e) {
    //        Thread.currentThread().interrupt();
    //        throw new RuntimeException("Video processing interrupted", e);
    //    }
    //}


    @Async
    private void processVideo(String videoPath, MultipartFile file, String videoId) {
        try {
            // Base directory
            final String HSL_DIR = Paths.get("..", "hsl-videos") .toAbsolutePath().normalize().toString();
            Path basePath = Paths.get(HSL_DIR, videoId);

            // Create output directories
            Files.createDirectories(basePath.resolve("360p"));
            Files.createDirectories(basePath.resolve("720p"));
            Files.createDirectories(basePath.resolve("1080p"));
            // Save uploaded file to disk
            Path inputFile = basePath.resolve("input.mp4");
            file.transferTo(inputFile.toFile());
            // FFmpeg resolutions and bitrates
            String[][] resolutions = {
                    {"360p", "640:360", "800k"},
                    {"720p", "1280:720", "1400k"},
                    {"1080p", "1920:1080", "2800k"}
            };
            //{"1080p", "1920:1080", "2800k"}
            for (String[] res : resolutions) {
                String folder = res[0];
                String scale = res[1];
                String bitrate = res[2];

                Path renditionPath = basePath.resolve(folder);
                Path playlistPath = renditionPath.resolve("index.m3u8");
                Path segmentPattern = renditionPath.resolve("segment_%03d.ts");

                // Remove stale output files before generating a new rendition.
                Files.deleteIfExists(playlistPath);

                try (Stream<Path> existingFiles = Files.list(renditionPath)) {
                    existingFiles
                            .filter(path -> path.getFileName().toString().endsWith(".ts"))
                            .forEach(path -> {
                                try {
                                    Files.deleteIfExists(path);
                                } catch (IOException e) {
                                    throw new UncheckedIOException(e);
                                }
                            });
                } catch (UncheckedIOException e) {
                    throw e.getCause();
                }
               List<String> ffmpegCommand = List.of(
                        "ffmpeg",
                        "-y",
                        "-i", inputFile.toString(),
                        "-vf", "scale=" + scale,
                        "-c:v", "libx264",
                        "-preset", "veryfast",
                        "-threads", "2",
                        "-b:v", bitrate,
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac",
                        "-b:a", "128k",
                        "-f", "hls",
                        "-hls_time", "10",
                        "-hls_playlist_type", "vod",
                        "-hls_segment_filename", segmentPattern.toString(),
                        playlistPath.toString()
                );


               log.info("Running FFmpeg for {}: {}", folder, String.join(" ", ffmpegCommand));

                ProcessBuilder pb = new ProcessBuilder(ffmpegCommand);
                pb.redirectErrorStream(true);
                Process process = pb.start();

                // Log FFmpeg output
                try (BufferedReader reader = new BufferedReader( new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[FFmpeg " + folder + "] " + line);
                    }
                }

                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new IOException(   "FFmpeg failed for " + folder + " with exit code: " + exitCode);
                }
                // Verify that FFmpeg generated the playlist and media segments.
                if (!Files.isRegularFile(playlistPath) || Files.size(playlistPath) == 0) {
                    throw new IOException( "FFmpeg did not create a valid playlist for "    + folder + ": " + playlistPath);
                }
//                long segmentCount;
//                try (Stream<Path> generatedFiles = Files.list(renditionPath)) {
//                    segmentCount = generatedFiles
//                            .filter(Files::isRegularFile)
//                            .filter(path -> path.getFileName().toString().endsWith(".ts"))
//                            .count();
//                }
//                if (segmentCount == 0) {
//                    throw new IOException( "FFmpeg did not create any TS segments for " + folder);
//                }
//                log.info("Verified rendition {}: playlist={}, segments={}", folder, playlistPath, segmentCount);
            }

            // Master playlist
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

            Files.writeString(basePath.resolve("master.m3u8"), masterPlaylist);
            log.info("Uploading HLS folder to storage: {}", basePath);
            System.out.println("Video processing completed successfully for videoId: " + videoId);

            // Clean up temporary raw input file
            // Keep the input until all rendition playlists and segments have been validated.
            // Files.deleteIfExists(inputFile);

            log.info("Triggering storage service sync for videoId: {}", videoId);

            // Validate all rendition playlists before uploading.
//            for (String[] res : resolutions) {
//                Path renditionPath = basePath.resolve(res[0]);
//                Path playlist = renditionPath.resolve("index.m3u8");
//
//                if (!Files.isRegularFile(playlist) || Files.size(playlist) == 0) {
//                    throw new IOException("Missing or empty HLS playlist for " + res[0] + ": " + playlist);
//                }
//
//                boolean hasSegments;
//                try (Stream<Path> generatedFiles = Files.list(renditionPath)) {
//                    hasSegments = generatedFiles
//                            .anyMatch(path -> Files.isRegularFile(path)
//                                    && path.getFileName().toString().endsWith(".ts"));
//                }
//
//                if (!hasSegments) {
//                    throw new IOException( "No HLS segments found for " + res[0] + " in " + renditionPath);
//                }
//                System.out.println("Verified " + res[0] + " playlist: " + playlist);
//            }

//            Path masterPlaylistPath = basePath.resolve("master.m3u8");
//            if (!Files.isRegularFile(masterPlaylistPath)
//                    || Files.size(masterPlaylistPath) == 0) {
//                throw new IOException("Master playlist missing: " + masterPlaylistPath);
//            }

            System.out.println("Uploading HLS folder: " + basePath);
            storageService.uploadHlsFolder(videoId, basePath);

            // Clean up temporary raw input file
            // The storage service removes the HLS directory after successful upload.
            Files.deleteIfExists(inputFile);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Error during video folder creation, FFmpeg processing, or file I/O", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Video processing interrupted", e);
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

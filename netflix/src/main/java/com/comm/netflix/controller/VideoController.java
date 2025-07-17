package com.comm.netflix.controller;

import com.comm.netflix.AppConstants;
//import com.comm.netflix.entity.Video;
import com.comm.netflix.service.VideoService;
import org.example.commonmodel.entity.Video;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class VideoController {
    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping("/stream/{videoId}")
    public ResponseEntity<Resource> stream(@PathVariable String videoId){
        Video video = videoService.getVideo(videoId);
        System.out.println(video);
        String contentType = video.getContentType();
        String filPath = video.getVideoPath();
        System.out.println(filPath);
        System.out.println(contentType);
        FileSystemResource fileSystemResource = new FileSystemResource(filPath);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .body(fileSystemResource);
    }
/*
    //stream in chunks
    @GetMapping("/stream/range/{videoId}")
    public ResponseEntity<Resource> streamRange(@PathVariable String videoId, @RequestHeader(value = "Range", required = false) String range) throws IOException {
        System.out.println ("range header we are getting is :- "+range);
        Video video = videoService.getVideo ( videoId );
        Path path = Paths.get(video.getVideoPath());
        Resource resource = new FileSystemResource ( path);
        String contentType = video.getContentType();
        // Fallback content type if not specified
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        long fileLength = Files.size(path); //method figure
        if (range == null) {
            System.out.println("No Range header, serving full content.");

            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
        }
        String[] ranges = range.replace ( "bytes=", "" ).split ( "-" );
        long rangeStart = Long.parseLong(ranges[0]);long rangeEnd;
        if(ranges.length > 1){
          rangeEnd = Long.parseLong(ranges[1]);
        }else {
            rangeEnd=fileLength-1;
        }
        if(rangeEnd>fileLength-1){
            rangeEnd =fileLength-1;
        }
        InputStream inputStream ;
        System.out.println ("rangeStart is "+rangeStart);
        System.out.println ("rangeEnd is " +  rangeEnd);
        try{
            inputStream = Files.newInputStream ( path );
            inputStream.skip ( rangeStart );

        }catch (IOException e){
            System.out.println ("Error getting file stream in class VideoController.java");
            return ResponseEntity.status ( HttpStatus.NOT_FOUND ).body(resource);
        }
        long contentLength = rangeEnd - rangeStart + 1;
        HttpHeaders headers = new HttpHeaders();
        headers.add ( "Content-Range", "bytes " + rangeStart + "-" + rangeEnd +"/"+ contentLength );
        headers.add ( "Cache-Control", "no-cache, no-store, must-revalidate" );
        headers.add ( "Pragma", "no-cache" );
        headers.add ( "Expires", "0" );
        headers.add ( "X-Content-Type-Options", "nosniff" );
        headers.setContentLength ( contentLength );
        return ResponseEntity
                .status ( HttpStatus.PARTIAL_CONTENT )
                .headers( headers )
                .contentType( MediaType.parseMediaType( contentType ) )
                .body(new InputStreamResource(inputStream));
    }*/
// stream video in chunks
@GetMapping("/stream/range/{videoId}")
public ResponseEntity<Resource> streamVideoRange(@PathVariable String videoId, @RequestHeader(value = "Range", required = false) String range) {
    System.out.println ( range );
    Video video = videoService.getVideo ( videoId );
    Path path = Paths.get ( video.getVideoPath () );
    Resource resource = new FileSystemResource ( path );
    String contentType = video.getContentType ();
    if (contentType == null) {contentType = "application/octet-stream";}
    //file ki length
    long fileLength = path.toFile().length ();
    //pahle jaisa hi code hai kyuki range header null
    if (range == null) {
        return ResponseEntity.ok ().contentType ( MediaType.parseMediaType ( contentType ) ).body ( resource );
    }
    //calculating start and end range
    long rangeStart;long rangeEnd;
    String[] ranges = range.replace ( "bytes=", "" ).split ( "-" );
    rangeStart = Long.parseLong ( ranges[ 0 ] );
//    if (ranges.length > 1) {
//            rangeEnd = Long.parseLong(ranges[1]);
//    } else {
//        rangeEnd = fileLength - 1;
//    }
    rangeEnd = rangeStart + AppConstants.CHUNK_SIZE - 1;
    if (rangeEnd > fileLength - 1) {
        rangeEnd = fileLength - 1;
    }
    System.out.println ( "range start : " + rangeStart );
    System.out.println ( "range end : " + rangeEnd );
    InputStream inputStream;
    try {
        inputStream = Files.newInputStream ( path );
        inputStream.skip ( rangeStart );
        long contentLength = rangeEnd - rangeStart + 1;
        byte[] data = new byte[ (int) contentLength ];
        int read = inputStream.read ( data, 0, data.length );
        System.out.println ( "read(number of bytes) : " + read );
        HttpHeaders headers = new HttpHeaders ();
        headers.add ( "Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength );
        headers.add ( "Cache-Control", "no-cache, no-store, must-revalidate" );
        headers.add ( "Pragma", "no-cache" );
        headers.add ( "Expires", "0" );
        headers.add ( "X-Content-Type-Options", "nosniff" );
        headers.setContentLength ( contentLength );

        return ResponseEntity
                .status ( HttpStatus.PARTIAL_CONTENT )
                .headers ( headers )
                .contentType ( MediaType.parseMediaType ( contentType ) )
                .body ( new ByteArrayResource (  data ) );
    } catch (IOException ex) {
        return ResponseEntity.status ( HttpStatus.INTERNAL_SERVER_ERROR ).build ();
    }


}}

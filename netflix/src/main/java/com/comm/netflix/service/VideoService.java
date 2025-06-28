package com.comm.netflix.service;

import com.comm.netflix.entity.Video;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface VideoService {

    //save video
    Video saveVideo(Video video, MultipartFile file) ;
    //get video

    //get video by id
    Video getVideo(String videoId) ;

    //get video by title
    Video getByTitle(String title) ;


}

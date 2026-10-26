package com.comm.netflix.service;

import org.example.commonmodel.entity.Video;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface VideoService {

    //save video
    Video saveVideo(Video video, MultipartFile file,boolean isPremium) ;

    //get video by id
    Video getVideo(String videoId) ;

    //get video by title
    Video getByTitle(String title) ;


}

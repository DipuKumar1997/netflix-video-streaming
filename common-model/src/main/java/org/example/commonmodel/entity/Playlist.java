package org.example.commonmodel.entity;

//import org.springframework.data.annotation.Id;

import java.util.List;


public class Playlist {
//    @Id
    private String id;
    private String name;
    private String profileId;
    private List<String> movieIds;
}
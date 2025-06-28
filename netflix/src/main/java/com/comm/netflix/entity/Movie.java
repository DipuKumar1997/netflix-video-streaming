package com.comm.netflix.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    private String id;
    private String title;
    private String description;
    private String genre;
    private String language;
    private String releaseDate;
    private String posterUrl;
    private boolean isSeries;
    private String videoPath;
    private Video video;
    private String videoId;
}

package org.example.commonmodel.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "movies")
public class Movie {

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

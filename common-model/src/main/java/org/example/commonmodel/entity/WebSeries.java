package org.example.commonmodel.entity;

import jakarta.persistence.OneToMany;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "webseries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebSeries {

    @Id
    private String id;

    private String title;
    private String description;
    private String genre;
    private String language;
    private String releaseDate;
    private String posterUrl;

    //every webSeries has multiple videos
    @OneToMany(mappedBy = "WebSeries")
    private List<Video> webserberisList = new ArrayList<> () ;
    private int seasons;        // number of seasons
    private int episodes;       // total episodes
}

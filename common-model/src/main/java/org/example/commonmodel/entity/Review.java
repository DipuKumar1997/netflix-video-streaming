package org.example.commonmodel.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
//import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.mapping.Document;

//@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

//    @Id
    private String id;

    private String userId;

    // Either one of these should be present, depending on what is reviewed:
    private String movieId;     // nullable if reviewing a web series
    private String webSeriesId; // nullable if reviewing a movie

    private int rating;
    private String comment;
    private String reviewDate;
}

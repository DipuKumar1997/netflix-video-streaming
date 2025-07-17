package org.example.searchservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

@Data
@Document(indexName = "movies")
@AllArgsConstructor
@NoArgsConstructor
public class MovieDocument {
    @Id
    private String id;
    private String title;
    private String description;
}
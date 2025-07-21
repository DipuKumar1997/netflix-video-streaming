package org.example.searchservice;


import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

//import java.awt.print.Pageable;
import java.util.List;
import org.springframework.data.domain.Pageable; // ✅

@EnableElasticsearchRepositories(basePackages = "org.example.searchservice")
public interface MovieSearchRepository extends ElasticsearchRepository<MovieDocument, String> {
    List<MovieDocument> findByTitleStartingWith(String title, Pageable pageable);
}

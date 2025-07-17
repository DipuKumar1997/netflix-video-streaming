package org.example.searchservice;


import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@EnableElasticsearchRepositories(basePackages = "org.example.searchservice")
public interface MovieSearchRepository extends ElasticsearchRepository<MovieDocument, String> {

}

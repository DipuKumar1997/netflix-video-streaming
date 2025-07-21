package org.example.searchservice; // Adjust package as needed

import org.example.searchservice.MovieDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.elasticsearch.core.query.Query;

//import co.elastic.clients.elasticsearch._types.query_dsl.Query;

@Service
public class MovieSearchService {

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    // Ultra-fast n-gram based autocomplete
    // This uses the n-gram analyzed field for super fast matching
    public List<MovieDocument> autocompleteFast(String query) {
        System.out.println ("autocompleteFast n gram based ------------------------");
        long startTime = System.nanoTime();
        Criteria criteria = Criteria.where("titleAutocomplete").contains(query); //instead on matches use contains
        Query searchQuery = new CriteriaQuery (criteria).setPageable( PageRequest.of(0, 7));
        SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(  searchQuery, MovieDocument.class);
        long endTime = System.nanoTime();
        long durationMicroseconds = (endTime - startTime) / 1000; // microseconds
        System.out.println("Search took: n gram based ------------------------ " + durationMicroseconds + " µs");
        return searchHits.stream().map(SearchHit::getContent).collect(Collectors.toList());
    }

    // Exact prefix matching (also fast)
    public List<MovieDocument> autocompletePrefix(String query) {
        Criteria criteria = Criteria.where("title.keyword").startsWith(query);
        Query searchQuery = new CriteriaQuery(criteria).setPageable(PageRequest.of(0, 7));
        SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(  searchQuery, MovieDocument.class);
        return searchHits.stream().map(SearchHit::getContent).collect(Collectors.toList());
    }
}

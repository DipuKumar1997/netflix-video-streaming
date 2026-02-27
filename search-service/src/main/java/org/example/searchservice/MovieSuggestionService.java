//package org.example.searchservice; // Your package for this class
//
//import org.example.springai.model.MovieDocument; // Import your MovieDocument class
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Profile;
//import org.springframework.data.elasticsearch.client.elc.NativeQuery;
//import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
//import org.springframework.data.elasticsearch.core.SearchHits;
//import org.springframework.data.elasticsearch.core.suggest.CompletionSuggestion; // <--- ADD/CORRECT THIS
//import org.springframework.data.elasticsearch.core.suggest.CompletionSuggestion.Entry.Option;
//import org.springframework.data.elasticsearch.core.suggest.Suggest; // <--- ADD/CORRECT THIS
//import org.springframework.stereotype.Service;
//
//import java.util.Collections;
//import java.util.List;
//import java.util.stream.Collectors;
//import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
//
//@Service
//@Profile ( value = "testing-phase")
//public class MovieSuggestionService {
//
//    private static final Logger log = LoggerFactory.getLogger(MovieSuggestionService.class);
//
//    @Autowired
//    private ElasticsearchOperations elasticsearchOperations;
//
//    public List<String> getSuggestions(String prefix) {
//        if (prefix == null || prefix.trim().isEmpty()) {
//            return Collections.emptyList();
//        }
//
//        // 1. Build the NativeQuery for the suggester
//        NativeQuery query = NativeQuery.builder()
//                .withQuery(QueryBuilders.matchAll().build()._toQuery()) // A simple query is needed, but suggester doesn't use it directly for suggestions
//                .withSuggester(suggesterBuilder -> suggesterBuilder
//                        .addCompletionSuggestion("movie-title-suggestions", csb -> csb
//                                .field("suggest")       // The name of your @CompletionField in MovieDocument
//                                .prefix(prefix)         // The input prefix from the user
//                                .skipDuplicates(true)   // Avoid duplicate suggestions
//                                .size(5)                // Max number of suggestions to return
//                        )
//                )
//                .build();
//
//        // 2. Execute the search operation
//        SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(query, MovieDocument.class);
//
//        // 3. Extract suggestions from the response
//        Suggest suggest = searchHits.getSuggest();
//        if (suggest != null) {
//            CompletionSuggestion completionSuggestion = suggest.getSuggestion("movie-title-suggestions");
//            if (completionSuggestion != null) {
//                return completionSuggestion.getEntries().stream()
//                        .flatMap(entry -> entry.getOptions().stream())
//                        .map(Option::getText)
//                        .collect(Collectors.toList());
//            }
//        }
//        log.warn("No suggestions found for prefix: {}", prefix);
//        return Collections.emptyList();
//    }
//}
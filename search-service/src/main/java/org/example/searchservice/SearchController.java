package org.example.searchservice;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SearchController {

    private final MovieSearchRepository movieRepository;
    @Autowired
    private ElasticsearchOperations elasticsearchOperations;
    //    @Autowired
    //    private ElasticsearchRestTemplate elasticsearchRestTemplate;
    @Autowired
    private MovieSearchService movieSearchService;


    @GetMapping("/autocomplete-basic")
    public List<MovieDocument> autocomplete(@RequestParam String query) {
        Pageable pageable = PageRequest.of(0, 7);
        return movieRepository.findByTitleStartingWith(query, pageable );
    }
    // Fast n-gram autocomplete
    @GetMapping("/autocomplete-n-gram")
    public List<MovieDocument> autocompleteNGram(@RequestParam String query) {
        System.out.println ("query hit in autocomplete - n gram "+ query);
        return movieSearchService.autocompleteFast(query);
    }

    @GetMapping("/autocomplete")
    public List<MovieDocument> autocomplete_advanced(@RequestParam String query) {
        System.out.println ("autocompleteFast NativeQuery based ------------------------");
        long startTime = System.nanoTime();
        // This is 3-5x faster than repository findByTitleStartingWith
        NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(co.elastic.clients.elasticsearch._types.query_dsl.Query.of(q ->
                        q.matchPhrasePrefix(m -> m.field("title").query(query.toLowerCase()))))
                .withMaxResults(7)
                .build();

        SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(searchQuery, MovieDocument.class);
        System.out.println ("searchHits  " + searchHits);
        long endTime = System.nanoTime();
        long durationMicroseconds = (endTime - startTime) / 1000; // microseconds
        System.out.println("Search took: NativeQuery based ------------------------" + durationMicroseconds + " µs");
        return searchHits.stream().map( SearchHit::getContent).collect( Collectors.toList());
    }


}

    /*
    @Data
    @Document(indexName = "movies")
    @AllArgsConstructor
    @NoArgsConstructor
    public class MovieDocument {
        @Id
        private String id;

        @Field(type = FieldType.Text, analyzer = "standard")
        private String title;

        @Field(type = FieldType.Text)
        private String description;

        // Add completion field for fast autocomplete
        @CompletionField
        private Completion suggest;

        // Constructor to set suggest field
        public MovieDocument(String id, String title, String description) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.suggest = new Completion(new String[]{title}); // Create suggestion from title
        }
    }

    // 2. Controller with NativeQuery approaches
    @RestController
    @RequestMapping("/api/movies")
    public class MovieController {

        @Autowired
        private ElasticsearchOperations elasticsearchOperations;

        // Method 1: Basic NativeQuery with match_phrase_prefix
        @GetMapping("/autocomplete/basic")
        public List<MovieDocument> autocompleteBasic(@RequestParam String query) {
            NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(co.elastic.clients.elasticsearch._types.query_dsl.Query.of(q ->
                    q.matchPhrasePrefix(m -> m.field("title").query(query))))
                .withMaxResults(7)
                .build();

            SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(searchQuery, MovieDocument.class);
            return searchHits.stream().map(SearchHit::getContent).collect(Collectors.toList());
        }

        // Method 2: Optimized with wildcard query
        @GetMapping("/autocomplete/wildcard")
        public List<MovieDocument> autocompleteWildcard(@RequestParam String query) {
            NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(co.elastic.clients.elasticsearch._types.query_dsl.Query.of(q ->
                    q.wildcard(w -> w.field("title.keyword").value(query + "*"))))
                .withMaxResults(7)
                .build();

            SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(searchQuery, MovieDocument.class);
            return searchHits.stream().map(SearchHit::getContent).collect(Collectors.toList());
        }

        // Method 3: Fastest - Using completion suggester
        @GetMapping("/autocomplete/suggest")
        public List<String> autocompleteSuggest(@RequestParam String query) {
            NativeQuery searchQuery = NativeQuery.builder()
                .withSuggestBuilder(SuggestBuilder.suggest()
                    .addSuggestion("title-suggest",
                        CompletionSuggestionBuilder.completion("suggest")
                            .prefix(query)
                            .size(7)))
                .build();

            SearchResponse response = elasticsearchOperations.execute(client ->
                client.search(searchQuery, MovieDocument.class));

            return response.suggest().get("title-suggest")
                .stream()
                .flatMap(suggest -> suggest.options().stream())
                .map(option -> option.text())
                .collect(Collectors.toList());
        }

        // Method 4: Multi-field search (title + description)
        @GetMapping("/autocomplete/multi")
        public List<MovieDocument> autocompleteMulti(@RequestParam String query) {
            NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(co.elastic.clients.elasticsearch._types.query_dsl.Query.of(q ->
                    q.multiMatch(m -> m
                        .query(query)
                        .fields("title^2", "description") // title has 2x boost
                        .type(TextQueryType.PhrasePrefix))))
                .withMaxResults(7)
                .build();

            SearchHits<MovieDocument> searchHits = elasticsearchOperations.search(searchQuery, MovieDocument.class);
            return searchHits.stream().map(SearchHit::getContent).collect(Collectors.toList());
        }
    }

    * */
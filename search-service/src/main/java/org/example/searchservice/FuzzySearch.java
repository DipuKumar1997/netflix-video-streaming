//package org.example.searchservice;
//
//import co.elastic.clients.elasticsearch._types.query_dsl.MatchQuery;
//import lombok.val;
//import org.elasticsearch.index.query.QueryBuilders;
//import org.elasticsearch.common.unit.Fuzziness;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Profile;
//import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
//import org.springframework.data.elasticsearch.core.SearchHit;
//import org.springframework.data.elasticsearch.core.SearchHits;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@Profile ( value = "testing-phase")
//public class FuzzySearch {
//
//    @Autowired
//    private ElasticsearchOperations elasticsearchOperations;
//
//    public List<MovieDocument> searchFuzzy(String keyword) {
//
//        val searchQuery = new NativeSearchQueryBuilder()
//                .withQuery(QueryBuilders
//                        .matchQuery("title", keyword)
//                        .fuzziness(Fuzziness.AUTO)
//                ).build();
//
//        SearchHits<MovieDocument> hits = elasticsearchOperations.search(searchQuery, MovieDocument.class);
//        return hits.stream()
//                .map(SearchHit::getContent)
//                .collect(Collectors.toList());
//    }
//}
////    val autoSearchQuery = new MatchQuery.Builder ();
////        autoSearchQuery.
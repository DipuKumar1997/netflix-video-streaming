package org.example.searchservice;



import org.example.commonmodel.entity.Movie;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.suggest.Completion;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class Consumer {
    private static final Logger log = LoggerFactory.getLogger(Consumer.class);
    @Autowired
    private  MovieSearchRepository movieSearchRepository;
    @KafkaListener(topics = "save-movie-in-es-ds-preparing-for-the-search", groupId = "search-service-v2" , containerFactory = "kafkaListenerContainerFactory")
    public void consume(Movie movie) {
        log.info("Received message from Kafka: {}", movie);
        try {
            MovieDocument movieDocument = new MovieDocument ();
            movieDocument.setId(movie.getId());     
            movieDocument.setTitle(movie.getTitle());
            movieDocument.setDescription ( movie.getDescription() );
            movieDocument.setTitleAutocomplete(movie.getTitle()); // Add this line
            movieSearchRepository.save(movieDocument);
//            movieDocument.setSuggest(new Completion (new String[]{movie.getTitle()}));
            log.info("Successfully saved movie to Elasticsearch: {}", movieDocument.getId());
        } catch (Exception e) {
            log.error("Error saving movie to Elasticsearch: {}", movie.getId(), e);
        }
    }
}


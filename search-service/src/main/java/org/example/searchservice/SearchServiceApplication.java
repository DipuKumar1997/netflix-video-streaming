package org.example.searchservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class SearchServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(SearchServiceApplication.class);

    public static void main(String[] args) {
        log.info("==================================================");
        log.info("STARTING SEARCH SERVICE");
        log.info("ENV SPRING_ELASTICSEARCH_URIS: {}", System.getenv("SPRING_ELASTICSEARCH_URIS"));
        log.info("ENV SPRING_KAFKA_BOOTSTRAP_SERVERS: {}", System.getenv("SPRING_KAFKA_BOOTSTRAP_SERVERS"));
        log.info("PROP spring.elasticsearch.uris: {}", System.getProperty("spring.elasticsearch.uris"));
        log.info("==================================================");

        try {
            SpringApplication.run(SearchServiceApplication.class, args);
        } catch (Exception e) {
            log.error("=== APPLICATION FAILED TO BOOT ===", e);
            throw e;
        }
    }
}
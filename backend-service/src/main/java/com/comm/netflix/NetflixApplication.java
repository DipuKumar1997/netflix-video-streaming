package com.comm.netflix;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Set;

@Slf4j
@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
@EnableScheduling
public class NetflixApplication {
	@Autowired
	private MongoTemplate mongoTemplate;

	public static void main(String[] args) {
		SpringApplication.run(NetflixApplication.class, args);
	}
    @Value ("${spring.data.mongodb.uri:Not Specified}")
    private String rawMongoUri;
	/**
     * Prints MongoDB connection details immediately when the app finishes booting
     */
    @Bean
    public CommandLineRunner logMongoDetailsOnStartup() {
        return args -> {
            String dbName = mongoTemplate.getDb().getName();
            log.info("==================================================");
            log.info(">>> MONGODB CONNECTED TO DATABASE: [{}]", dbName);
             log.info (rawMongoUri);
            log.info("==================================================");
        };
    }
	/**
     * Logs the active MongoDB database and collections every 10 seconds
     */
    @Scheduled(fixedRate = 10000)
    public void logMongoDbStatusPeriodically() {
        try {
            String dbName = mongoTemplate.getDb().getName();
            Set<String> collections = mongoTemplate.getCollectionNames();
            log.info(">>> [EVERY 10s MONGO CHECK] Connected Database: [{}] | Existing Collections: {}", dbName, collections);
        } catch (Exception e) {
            log.error(">>> [EVERY 10s MONGO CHECK] Error checking MongoDB: {}", e.getMessage());
        }
    }
}
package com.comm.netflix.config;

//import com.comm.netflix.entity.Movie;
//import org.example.commonmodel.entity.Movie;
import org.example.commonmodel.entity.Movie;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class kafkaConfig { // Note: Class name 'kafkaConfig' should ideally be 'KafkaConfig' for Java conventions

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value ("${save-movie-in-es-ds-preparing-for-the-search}")
    private String topicName;

    @Bean
    public KafkaAdmin.NewTopics newTopic() {
        return new KafkaAdmin.NewTopics (
                new NewTopic(topicName, 1, (short) 1),
                new NewTopic("topic2", 3, (short) 1));
    }

    @Bean
    public ProducerFactory<String, Movie> movieProducerFactory() {
        Map<String, Object> config = new HashMap<> ();
//        config.put( ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,"localhost:9092");
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put( ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put( ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // Optional: If your producer uses a custom JsonSerializer to control type info
        // props.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false); // If you don't want __TypeId__ headers at all (requires consumer to use default type)
        // props.put(JsonSerializer.TYPE_MAPPINGS, "movie:org.example.commonmodel.entity.Movie"); // For alias mapping

        return new DefaultKafkaProducerFactory <> (config);
    }

    @Bean(name = "sending-the-movie-to-es-database-for-indexing")
    public KafkaTemplate<String,Movie> kafkaTemplate() {
        // The Movie type here will now refer to org.example.commonmodel.entity.Movie
        return  new KafkaTemplate<> ( movieProducerFactory ());
    }
}
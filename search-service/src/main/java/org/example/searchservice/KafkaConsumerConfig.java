package org.example.searchservice;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.example.commonmodel.entity.Movie; // Correct import for Movie
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    @Bean
    public ConsumerFactory<String, Movie> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);

        // Configure ErrorHandlingDeserializer for KEY
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);

        // Configure ErrorHandlingDeserializer for VALUE
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

        // Configuration specific to JsonDeserializer
        // IMPORTANT: Value Default Type specifies the class for deserialization
        // if no '__TypeId__' header is present in the Kafka message.
        // It's crucial for fallback and generally a good practice.
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, Movie.class.getName());

        // IMPORTANT: Trusted Packages for security. '*' is for development only.
        // In production, specify exact packages: e.g., "org.example.commonmodel.*"
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");

        // Instantiate actual deserializers for the DefaultKafkaConsumerFactory
        // The DefaultKafkaConsumerFactory's constructor needs actual instances,
        // not just classes when ErrorHandlingDeserializer is used like this.
        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(), // Key Deserializer
                new JsonDeserializer<>(Movie.class) // Value Deserializer (configured for Movie.class)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Movie> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Movie> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        // You might want to add error handling for the listener container itself:
        // factory.setErrorHandler(new CommonLoggingErrorHandler());
        return factory;
    }
}
//package org.example.searchservice;// In SearchServiceApplication or a dedicated @Configuration class
//import org.modelmapper.ModelMapper;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration // If it's a separate config class
//public class AppConfig { // Or add to SearchServiceApplication directly
//
//    @Bean
//    public ModelMapper modelMapper() {
//        ModelMapper modelMapper = new ModelMapper();
//        // Optional: Configure ModelMapper if field names don't match exactly
//        // modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
//        return modelMapper;
//    }
//}
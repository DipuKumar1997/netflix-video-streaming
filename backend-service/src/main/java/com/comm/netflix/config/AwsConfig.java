package com.comm.netflix.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfig {

   @Value("${aws.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.access-key-id:}")
    private String accessKeyId;

    @Value("${aws.secret-access-key:}")
    private String secretAccessKey;

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "s3")
    public S3Client s3Client() {
        if (StringUtils.hasText(accessKeyId) && StringUtils.hasText(secretAccessKey)) {
            return S3Client.builder()
                    .region(Region.of(awsRegion))
                    .credentialsProvider( StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                    .build();
        }
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider( DefaultCredentialsProvider.create())
                .build();
    }
}
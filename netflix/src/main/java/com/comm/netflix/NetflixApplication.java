package com.comm.netflix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class NetflixApplication {
	public static void main(String[] args) {
		SpringApplication.run(NetflixApplication.class, args);
	}
}

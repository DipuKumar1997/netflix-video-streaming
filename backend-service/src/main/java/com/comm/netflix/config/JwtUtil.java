package com.comm.netflix.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
@Component
public class JwtUtil {

    private final SecretKey key;

    // Constructor injection from a String secret (from properties)
    @Autowired
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        try {
            System.out.println("JWT Secret: " + secret);
            System.out.println("Secret byte size: " + secret.getBytes().length);
            this.key = Keys.hmacShaKeyFor(secret.getBytes());
        } catch (Exception e) {
            throw new RuntimeException("JWT Key Init Failed: " + e.getMessage(), e);
        }
    }

    // Optional second constructor if you ever want to inject SecretKey directly (not required usually)
    public JwtUtil(SecretKey key) {
        this.key = key;
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours expiry
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
}

//    public JwtUtil(@Value("${jwt.secret}") String secret) {
//        // Decode Base64 encoded secret and create SecretKey
//        byte[] decodedKey = Base64.getDecoder().decode(secret);
//        this.key = Keys.hmacShaKeyFor(decodedKey);
//    }
//    public JwtUtil(@Value("${jwt.secret}") String secret) {
//        this.key = Keys.hmacShaKeyFor(secret.getBytes());
//    }
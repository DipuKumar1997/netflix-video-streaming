package com.comm.netflix.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.example.commonmodel.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey key;

    public Boolean extractIsPremium(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("isPremium", Boolean.class);
        } catch (Exception e) {
            return false;
        }
    }
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

    public String generateToken(User user) {
//        User user = userRepository.findByEmail(jwtUtil.extractEmail(token))
//        .orElseThrow(() -> new UsernameNotFoundException ("User not found"));
//        return Jwts.builder()
//                .setSubject(email)
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours expiry
//                .signWith(key, SignatureAlgorithm.HS256)
//                .compact();
            Map<String, Object> claims = new HashMap<> ();
            claims.put("userId", user.getId());
            claims.put("isAdmin", user.isAdmin());
            claims.put("isPremium", user.isPremiumActive());

            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
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
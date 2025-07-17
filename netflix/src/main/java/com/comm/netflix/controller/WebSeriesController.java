package com.comm.netflix.controller;

import com.comm.netflix.config.JwtUtil;
//import com.comm.netflix.entity.User;
//import com.comm.netflix.entity.WebSeries;
import com.comm.netflix.repos.UserRepository;
import com.comm.netflix.service.WebSeriesService;
import io.jsonwebtoken.JwtException;
import org.example.commonmodel.entity.User;
import org.example.commonmodel.entity.WebSeries;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/webseries")
public class WebSeriesController {

    @Autowired
    private WebSeriesService webSeriesService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addWebSeries(@RequestHeader("Authorization") String token, @RequestBody WebSeries webSeries) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;

        try {
            String email = jwtUtil.extractEmail(jwt);

            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }

            User user = optionalUser.get();

            if (!"admin".equalsIgnoreCase(user.getIsAdmin() ? "admin" : "user")) {
                return ResponseEntity.status(403).body("Only admin can add web series");
            }

            WebSeries added = webSeriesService.addWebSeries(webSeries);
            return ResponseEntity.ok(added);

        } catch (JwtException e) {
            // This catches invalid signature, expired token, malformed token etc.
            return ResponseEntity.status(401).body("Invalid or unauthorized token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<WebSeries>> getAllWebSeries() {
        return ResponseEntity.ok(webSeriesService.getAllWebSeries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebSeries> getWebSeriesById(@PathVariable String id) {
        return webSeriesService.getWebSeriesById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

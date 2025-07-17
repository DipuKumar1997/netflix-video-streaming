package com.comm.netflix.controller;

import com.comm.netflix.config.JwtUtil;
//import com.comm.netflix.entity.Review;
//import com.comm.netflix.entity.User;
import com.comm.netflix.repos.UserRepository;
import com.comm.netflix.service.ReviewService;
import org.example.commonmodel.entity.Review;
import org.example.commonmodel.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/addOrUpdate")
    public ResponseEntity<?> addOrUpdateReview(@RequestHeader("Authorization") String token, @RequestBody Review review) {
        try {
            // Extract JWT token from "Bearer <token>"
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;

            // Extract user email from token
            String email = jwtUtil.extractEmail(jwt);

            // Find user by email
            Optional<org.example.commonmodel.entity.User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(401).body("Unauthorized: User not found");
            }

            // Set userId from the authenticated user in review object
            review.setUserId(optionalUser.get().getId());

            // Save or update the review via service
            Review savedReview = reviewService.addOrUpdateReview(review);

            return ResponseEntity.ok(savedReview);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unauthorized: Invalid token or error - " + e.getMessage());
        }
    }
}

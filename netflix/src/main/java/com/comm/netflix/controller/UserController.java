package com.comm.netflix.controller;

import com.comm.netflix.DTO.ApiResponse;
import com.comm.netflix.DTO.LoginRequest;
import com.comm.netflix.DTO.UserResponseToAdmin;
import com.comm.netflix.config.JwtUtil;
//import com.comm.netflix.entity.User;
import com.comm.netflix.repos.UserRepository;
import org.example.commonmodel.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/auth")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ApiResponse registerUser(@RequestBody User user) {
        try {
            System.out.println(user);
            User newUser =new User();
            newUser.setEmail(user.getEmail());
            newUser.setPassword(passwordEncoder.encode(user.getPassword()));
            newUser.setIsAdmin(false);  // Set admin flag before saving
            newUser.setName(user.getName());
            userRepository.save(newUser);

            String token = jwtUtil.generateToken(user.getEmail());
            return new ApiResponse(token, "User registered successfully", 201);
        } catch (Exception e) {
            return new ApiResponse(null, "Registration failed: " + e.getMessage(), 500);
        }
    }

    // Get all users only if admin
    //@PreAuthorize("hasRole('ADMIN')")
//    @PreA
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) token = token.substring(7);
            System.out.println("token get from frontend "   + token);
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }

            String email = jwtUtil.extractEmail(token);
            System.out.println(email);
            Optional<User> optionalUser = userRepository.findByEmail(email);
            System.out.println(optionalUser);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found.");
            }
            User user = optionalUser.get();
            if (!user.getIsAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Not an admin.");
            }

            var users = userRepository.findAll();
            System.out.println("users "+users);
            // Map to UserResponse with masked emails
            var userResponses = users.stream()
                    .filter(u -> u.getEmail() != null)
                    .map(u -> new UserResponseToAdmin(
                            u.getId(),
                            u.getName(),
                            maskEmail(u.getEmail())
                    ))
                    .toList();

            System.out.println("reached");
            System.out.println(userResponses);
            return ResponseEntity.ok(userResponses);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }
    }


    // Login user
    @PostMapping("/login")
    public ApiResponse loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());
        System.out.println(optionalUser);
        if (optionalUser.isEmpty()) {
            return new ApiResponse(null, "User not found", 404);
        }
        User user = optionalUser.get();
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (!passwordMatches) {
            return new ApiResponse(null, "Invalid credentials", 401);
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new ApiResponse(token, "Login successful", 200);
    }
//    private String maskEmail(String email) {
//        int index = email.indexOf("@");
//        if (index <= 2) return "***" + email.substring(index);  // too short to show much
//
//        String prefix = email.substring(0, 2);
//        String masked = "*".repeat(index - 2);
//        String domain = email.substring(index);
//        return prefix + masked + domain;
//    }
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "hidden@example.com";

        int index = email.indexOf("@");
        if (index <= 2) return "***" + email.substring(index); // too short to show much

        String prefix = email.substring(0, 2);
        String masked = "*".repeat(index - 2);
        String domain = email.substring(index);
        return prefix + masked + domain;
    }

}

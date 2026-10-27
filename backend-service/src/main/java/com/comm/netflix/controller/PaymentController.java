package com.comm.netflix.controller;

import com.comm.netflix.DTO.OrderRequestDto;
import com.comm.netflix.DTO.PaymentVerificationDto;
import com.comm.netflix.repos.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.commonmodel.entity.User;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
//import software.amazon.awssdk.core.sync.RequestBody;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.S3Client;
//import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${razorpay.key.id:rzp_test_key}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:rzp_test_secret}")
    private String razorpaySecret;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    private final S3Client s3Client;
    private final ObjectMapper objectMapper;

    private final UserRepository userRepository;

    @GetMapping("/razorpay-key")
    public ResponseEntity<Map<String, String>> getRazorpayKey() {
        return ResponseEntity.ok(Map.of("keyId", razorpayKeyId));
    }

    /**
     * Create Razorpay Order
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody(required = false) OrderRequestDto request) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpaySecret);
            JSONObject orderRequest = new JSONObject();

            int amount = (request != null && request.getAmount() > 0) ? request.getAmount() : 19900;
            String currency = (request != null && request.getCurrency() != null) ? request.getCurrency() : "INR";

            orderRequest.put("amount", amount);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);
            return ResponseEntity.ok(order.toString());
        } catch (Exception e) {
            log.error("Order creation failed", e);
            return ResponseEntity.badRequest().body("Order creation failed: " + e.getMessage());
        }
    }

    /**
     * Verify Payment & Sync Entitlement to S3
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationDto payload,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status( HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            // 1. Verify Razorpay HMAC Signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", payload.getRazorpay_order_id());
            options.put("razorpay_payment_id", payload.getRazorpay_payment_id());
            options.put("razorpay_signature", payload.getRazorpay_signature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);
            if (!isValid) {
                return ResponseEntity.badRequest().body("Invalid payment signature.");
            }

            // 2. Fetch User by Email from Spring Security Authentication
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException (HttpStatus.NOT_FOUND, "User not found"));

            // 3. Update User MongoDB Fields matching user.isPremiumActive()
            user.setSubscriptionStatus("ACTIVE");
            user.setSubscriptionPlan("PREMIUM_MONTHLY");
            user.setPremiumExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
            userRepository.save(user);

            log.info("User [{}] upgraded to ACTIVE premium status until {}", email, user.getPremiumExpiresAt());

            // 4. Save JSON entitlement record to S3
            Map<String, Object> subscriptionMeta = Map.of(
                    "userId", user.getId(),
                    "email", email,
                    "paymentId", payload.getRazorpay_payment_id(),
                    "orderId", payload.getRazorpay_order_id(),
                    "status", "ACTIVE",
                    "expiresAt", user.getPremiumExpiresAt().toString()
            );

            String s3Key = "subscriptions/" + user.getId() + ".json";
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .contentType("application/json")
                            .build(),
                    software.amazon.awssdk.core.sync.RequestBody.fromString(objectMapper.writeValueAsString(subscriptionMeta))
            );

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Subscription activated successfully!",
                    "premiumExpiresAt", user.getPremiumExpiresAt().toString()
            ));

        } catch (Exception e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.internalServerError().body("Verification failed: " + e.getMessage());
        }
    }
}
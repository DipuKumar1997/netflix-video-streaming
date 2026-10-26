package com.comm.netflix.DTO;

import lombok.Data;

@Data
public class PaymentVerificationDto {
    private String razorpay_order_id;
    private String razorpay_payment_id;
    private String razorpay_signature;
    private String userId;
}
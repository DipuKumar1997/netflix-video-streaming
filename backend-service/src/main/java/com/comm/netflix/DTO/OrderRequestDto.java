package com.comm.netflix.DTO;

import lombok.Data;

@Data
public class OrderRequestDto {
    private int amount = 19900; // Amount in paise (₹199)
    private String currency = "INR";
}
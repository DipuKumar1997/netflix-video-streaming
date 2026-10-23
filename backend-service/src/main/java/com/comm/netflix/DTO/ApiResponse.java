package com.comm.netflix.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
public class ApiResponse {
    private String token;
    private String message;
    private int statusCode;
//    public ApiResponse() {}

//    public ApiResponse(String jwtToken, String message, int statusCode) {
//        this.jwtToken = jwtToken;
//        this.message = message;
//        this.statusCode = statusCode;
//    }
}

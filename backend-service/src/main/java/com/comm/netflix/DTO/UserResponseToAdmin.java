package com.comm.netflix.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseToAdmin {
    private String id;
    private String name;
    private String email;  // masked email

//    public UserResponseToAdmin(String id, String name, String email) {
//        this.id = id;
//        this.name = name;
//        this.email = email;
//    }

    // Getters and setters
//    public String getId() { return id; }
//    public void setId(String id) { this.id = id; }
//
//    public String getName() { return name; }
//    public void setName(String name) { this.name = name; }
//
//    public String getEmail() { return email; }
//    public void setEmail(String email) { this.email = email; }
}

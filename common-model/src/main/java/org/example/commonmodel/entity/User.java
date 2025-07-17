package org.example.commonmodel.entity;

import lombok.Data;
import org.springframework.data.annotation.Id; // <-- Make sure this is imported for @Id
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed; // <-- Make sure this is imported for @Indexed

import jakarta.validation.constraints.Email;   // <-- For @Email
import jakarta.validation.constraints.NotNull; // <-- For @NotNull

import java.util.List;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;

    @NotNull // Jakarta Bean Validation
    @Email   // Jakarta Bean Validation
    @Indexed(unique = true) // Spring Data MongoDB
    private String email;

    private String password;
    private boolean IsAdmin; // Default false
    private List<Profile> profiles;

    public boolean getIsAdmin() {
        return IsAdmin;
    }

    // setter for isAdmin (optional but recommended)
    public void setIsAdmin(Boolean isAdmin) {
        this.IsAdmin = isAdmin;
    }
}
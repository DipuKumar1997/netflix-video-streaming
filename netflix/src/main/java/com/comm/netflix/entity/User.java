package com.comm.netflix.entity;

//import org.springframework.context.annotation.Profile;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import javax.persistence.Column;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
//import javax.persistence.Id;
//import javax.validation.constraints.Email;
//import javax.validation.constraints.NotNull;
import java.util.List;
@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;

    @NotNull
    @Email
//    @Column(unique=true)

    @Indexed(unique = true)
    private String email;


    private String password;
    private boolean IsAdmin ; //default false
    private List<Profile> profiles;
    public boolean getIsAdmin() {
        return IsAdmin;
    }

    // setter for isAdmin (optional but recommended)
    public void setIsAdmin(Boolean isAdmin) {
        this.IsAdmin = isAdmin;
    }
}

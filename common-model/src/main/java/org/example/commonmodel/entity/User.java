
package org.example.commonmodel.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Transient;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @NotBlank
    @Email
    @Indexed(unique = true)
    private String email;

    private String password;

    private boolean admin=false;

    private List<Profile> profiles;

    // Subscription information
    private String subscriptionStatus = "FREE";
    private String subscriptionPlan;
    private Instant premiumExpiresAt;


    @Transient
    public boolean isPremiumActive() {
        return "ACTIVE".equals(subscriptionStatus)
                && premiumExpiresAt != null
                && premiumExpiresAt.isAfter(Instant.now());
    }


}

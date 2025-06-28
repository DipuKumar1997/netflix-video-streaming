package com.comm.netflix.repos;

import com.comm.netflix.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    // custom query methods if needed
    Optional<User> findByEmail(String email);
}

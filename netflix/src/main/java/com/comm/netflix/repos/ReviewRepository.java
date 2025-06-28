package com.comm.netflix.repos;

import com.comm.netflix.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review , Long> {
    Optional<Review> findByUserIdAndMovieId(String userId, String movieId);
    Optional<Review> findByUserIdAndWebSeriesId(String userId, String webSeriesId);

}

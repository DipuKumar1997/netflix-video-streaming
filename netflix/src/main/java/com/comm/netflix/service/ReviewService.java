package com.comm.netflix.service;

import com.comm.netflix.entity.Review;
import com.comm.netflix.repos.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review addOrUpdateReview(Review review) {
        if (review.getMovieId() != null) {
            Optional<Review> existingReview = reviewRepository.findByUserIdAndMovieId(review.getUserId(), review.getMovieId());
            if (existingReview.isPresent()) {
                Review oldReview = existingReview.get();
                // Update fields
                oldReview.setRating(review.getRating());
                oldReview.setComment(review.getComment());
                oldReview.setReviewDate(review.getReviewDate());
                return reviewRepository.save(oldReview);
            }
        }

        if (review.getWebSeriesId() != null) {
            Optional<Review> existingReview = reviewRepository.findByUserIdAndWebSeriesId(review.getUserId(), review.getWebSeriesId());
            if (existingReview.isPresent()) {
                Review oldReview = existingReview.get();
                // Update fields
                oldReview.setRating(review.getRating());
                oldReview.setComment(review.getComment());
                oldReview.setReviewDate(review.getReviewDate());
                return reviewRepository.save(oldReview);
            }
        }

        // If no existing review found, save new one
        return reviewRepository.save(review);
    }

}

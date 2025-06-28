package com.comm.netflix.repos;

import com.comm.netflix.entity.Video;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepos extends MongoRepository<Video, String> {
    Optional<Video> findByTitle(String title);
    Optional<Video> findByVideoId(String videoId);

}

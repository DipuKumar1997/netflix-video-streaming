package com.comm.netflix.repos;

import com.comm.netflix.entity.WebSeries;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebSeriesRepository extends MongoRepository<WebSeries, String> {
    // You can add custom queries here later if needed
}

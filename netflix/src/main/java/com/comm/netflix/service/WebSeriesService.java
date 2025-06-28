package com.comm.netflix.service;

import com.comm.netflix.entity.WebSeries;
import com.comm.netflix.repos.WebSeriesRepository;
//import com.comm.netflix.repository.WebSeriesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WebSeriesService {

    @Autowired
    private WebSeriesRepository webSeriesRepository;

    public WebSeries addWebSeries(WebSeries webSeries) {
        return webSeriesRepository.save(webSeries);
    }

    public List<WebSeries> getAllWebSeries() {
        return webSeriesRepository.findAll();
    }

    public Optional<WebSeries> getWebSeriesById(String id) {
        return webSeriesRepository.findById(id);
    }

    // add more methods as required (update, delete, etc)
}

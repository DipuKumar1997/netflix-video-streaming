package com.comm.netflix.controller;

import com.comm.netflix.repos.VideoRepos;
import com.comm.netflix.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.example.commonmodel.entity.Movie;
import org.example.commonmodel.entity.User;
import org.example.commonmodel.entity.Video;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.web.multipart.MultipartFile;
import com.comm.netflix.config.JwtUtil;
import com.comm.netflix.repos.MovieRepository;
import com.comm.netflix.repos.UserRepository;
import com.comm.netflix.service.MovieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/movies")
public class MovieController {
    @Value("${save-movie-in-es-ds-preparing-for-the-search}")
    private String topicName;


    public MovieController( MovieService movieService, JwtUtil jwtUtil, UserRepository userRepository, MovieRepository movieRepository, VideoRepos videoRepos, VideoService videoService, KafkaTemplate<String, Movie> sendingTheMovieToEsDatabaseForIndexing) {
        this.movieService = movieService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.videoRepos = videoRepos;
        this.videoService = videoService;
        this.sendingTheMovieToEsDatabaseForIndexing = sendingTheMovieToEsDatabaseForIndexing;
    }

    private final JwtUtil jwtUtil;
    private final MovieService movieService;
    private final UserRepository userRepository;
    
    private final  MovieRepository movieRepository;
    
    private final VideoRepos videoRepos;
    
    private final VideoService videoService;

    @Qualifier("sending-the-movie-to-es-database-for-indexing")
    private final  KafkaTemplate<String, Movie> sendingTheMovieToEsDatabaseForIndexing;
    /*
    @Qualifier("sending-the-movie-to-es-database-for-indexing")
    private KafkaTemplate<String, Movie> sendingTheMovieToEsDatabaseForIndexing;
    */
    //    public MovieController(@Qualifier("sending-the-movie-to-es-database-for-indexing") KafkaTemplate<String, Movie> sendingTheMovieToEsDatabaseForIndexing){
    //        this.sendingTheMovieToEsDatabaseForIndexing = sendingTheMovieToEsDatabaseForIndexing;
    //    }
    //    @PostMapping("/add")
    //    public Movie addMovie(@RequestBody Movie movie) {
    //        return movieService.addMovie(movie);
    //    }

    @GetMapping("/all")
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }
    @GetMapping("/search")
    public List<Movie> search(@RequestParam String title) {
        return movieService.searchByTitle(title);
    }
    @PostMapping("/add")
    public ResponseEntity<?> addMovie(
            @RequestHeader("Authorization") String token,
            @RequestParam("title") String title,
            @RequestParam("genre") String genre,
            @RequestParam("language") String language,
            @RequestParam(value = "posterUrl", required = false) String posterUrl,
            @RequestParam("videoFile") MultipartFile videoFile
    ) {
        try {
            if (token.startsWith("Bearer ")) token = token.substring(7);
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }
            String email = jwtUtil.extractEmail(token);
            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found.");
            }
            User user = optionalUser.get();
            if (!user.getIsAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admin can add movies.");
            }
            // Create and save the video metadata + file
            Video video = new Video();
            //    video.setTitle(title);
            //    video.setDescription("Uploaded via /add");
            //    video.setContentType(videoFile.getContentType());
            Video savedVideo = videoService.saveVideo(video, videoFile);
            /*
            // Save video file locally
            String uploadDir = "./videos/";
            String filename = System.currentTimeMillis() + "_" + videoFile.getOriginalFilename();
            Path filepath = Paths.get(uploadDir, filename);

            // Make sure upload directory exists
            Files.createDirectories(filepath.getParent());

            // Save the file
            Files.write(filepath, videoFile.getBytes());
            */
            // Create movie entity with videoPath
            Movie movie = new Movie();
            movie.setTitle(title);
            movie.setGenre(genre);
            movie.setLanguage(language);
            movie.setPosterUrl(posterUrl);
            movie.setVideoId(savedVideo.getVideoId());
            movie.setDescription ( "a string so that not null" );
            //  movie.setVideoId(savedVideo.getVideoId());
            //   movie.setVideo(videoFile);
            //   movie.setVideoPath(filepath.toString());
             Movie savedMovie = movieRepository.save(movie);
              log.info ( "sending to es database  through kafka " );
            CompletableFuture<SendResult<String, Movie>> sendResultCompletableFuture = sendingTheMovieToEsDatabaseForIndexing.send ( topicName, movie );
            log.info ( "sending to es database  send successfull kafka " );
            log.info ( sendResultCompletableFuture.toString () );
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
        } catch (Exception e) {
            e.printStackTrace ();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}

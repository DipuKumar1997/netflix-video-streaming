package com.comm.netflix.controller;
import com.comm.netflix.entity.Video;
import com.comm.netflix.repos.VideoRepos;
import com.comm.netflix.service.VideoService;
import org.springframework.web.multipart.MultipartFile;
import com.comm.netflix.config.JwtUtil;
import com.comm.netflix.entity.Movie;
import com.comm.netflix.entity.User;
import com.comm.netflix.repos.MovieRepository;
import com.comm.netflix.repos.UserRepository;
import com.comm.netflix.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
//reuiredargsconstructor
@RequestMapping("/api/movies")
public class MovieController {
    @Autowired
    private MovieService movieService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private VideoRepos videoRepos;
    @Autowired
    private VideoService videoService;

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
//            video.setTitle(title); // Optional
//            video.setDescription("Uploaded via /add"); // Optional
//            video.setContentType(videoFile.getContentType());
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
//            movie.setVideoId(savedVideo.getVideoId());
//            movie.setVideo(videoFile);
//            movie.setVideoPath(filepath.toString());
            Movie savedMovie = movieRepository.save(movie);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}

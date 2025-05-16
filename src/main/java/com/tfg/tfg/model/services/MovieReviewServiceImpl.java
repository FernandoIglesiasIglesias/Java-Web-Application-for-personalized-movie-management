package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.MovieReviewDao;
import com.tfg.tfg.model.entities.ReviewVote;
import com.tfg.tfg.model.entities.ReviewVoteDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MovieReviewServiceImpl implements MovieReviewService {
    
    private final MovieReviewDao movieReviewDao;
    private final ReviewVoteDao reviewVoteDao;
    private final UsersDao usersDao;
    private final MovieDao movieDao;
    
    public MovieReviewServiceImpl(MovieReviewDao movieReviewDao,
                                ReviewVoteDao reviewVoteDao,
                                UsersDao usersDao,
                                MovieDao movieDao) {
        this.movieReviewDao = movieReviewDao;
        this.reviewVoteDao = reviewVoteDao;
        this.usersDao = usersDao;
        this.movieDao = movieDao;
    }
    
    @Override
    public MovieReview createReview(Long userId, String imdbId, String title, String content) 
            throws InstanceNotFoundException {
        
        // Find user
        Optional<Users> userOpt = usersDao.findById(userId);
        if (!userOpt.isPresent()) {
            throw new InstanceNotFoundException("user.notFound", userId);
        }
        Users user = userOpt.get();
        
        // Find movie by imdbId
        Optional<Movie> movieOpt = movieDao.findByImdbId(imdbId);
        if (!movieOpt.isPresent()) {
            throw new InstanceNotFoundException("movie.notFound", imdbId);
        }
        Movie movie = movieOpt.get();
        
        // Check if the user already reviewed this movie
        Optional<MovieReview> existingReview = movieReviewDao.findByUserIdAndMovieId(userId, movie.getId());
        if (existingReview.isPresent()) {
            // Update existing review instead of creating a new one
            MovieReview review = existingReview.get();
            review.setTitle(title);
            review.setContent(content);
            review.setCreatedAt(LocalDateTime.now());
            return movieReviewDao.save(review);
        }
        
        // Create new review
        MovieReview review = new MovieReview();
        review.setUser(user);
        review.setMovie(movie);
        review.setTitle(title);
        review.setContent(content);
        review.setCreatedAt(LocalDateTime.now());
        
        return movieReviewDao.save(review);
    }
    
    @Override
    public MovieReview updateReview(Long userId, Long reviewId, String title, String content) 
            throws InstanceNotFoundException, PermissionException {
        
        // Find review
        Optional<MovieReview> reviewOpt = movieReviewDao.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new InstanceNotFoundException("review.notFound", reviewId);
        }
        MovieReview review = reviewOpt.get();
        
        // Check if the user is the author of the review
        if (!review.getUser().getId().equals(userId)) {
            throw new PermissionException();
        }
        
        // Update review
        review.setTitle(title);
        review.setContent(content);
        
        return movieReviewDao.save(review);
    }
    
    @Override
    public void deleteReview(Long userId, Long reviewId) 
            throws InstanceNotFoundException, PermissionException {
        
        // Find review
        Optional<MovieReview> reviewOpt = movieReviewDao.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new InstanceNotFoundException("review.notFound", reviewId);
        }
        MovieReview review = reviewOpt.get();
        
        // Check if the user is the author of the review
        if (!review.getUser().getId().equals(userId)) {
            throw new PermissionException();
        }
        
        // Delete review
        movieReviewDao.delete(review);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MovieReview> getMovieReviews(String imdbId) throws InstanceNotFoundException {
        
        // Find movie by imdbId
        Optional<Movie> movieOpt = movieDao.findByImdbId(imdbId);
        if (!movieOpt.isPresent()) {
            throw new InstanceNotFoundException("movie.notFound", imdbId);
        }
        Movie movie = movieOpt.get();
        
        return movieReviewDao.findByMovieIdOrderByCreatedAtDesc(movie.getId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MovieReview> getUserReviews(Long userId) throws InstanceNotFoundException {
        
        // Check if user exists
        if (!usersDao.existsById(userId)) {
            throw new InstanceNotFoundException("user.notFound", userId);
        }
        
        return movieReviewDao.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public MovieReview voteReview(Long userId, Long reviewId, boolean isHelpful) 
            throws InstanceNotFoundException, PermissionException {
        
        // Find review
        Optional<MovieReview> reviewOpt = movieReviewDao.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new InstanceNotFoundException("review.notFound", reviewId);
        }
        MovieReview review = reviewOpt.get();
        
        // Find user
        Optional<Users> userOpt = usersDao.findById(userId);
        if (!userOpt.isPresent()) {
            throw new InstanceNotFoundException("user.notFound", userId);
        }
        Users user = userOpt.get();
        
        // Check that the user is not voting on their own review
        if (review.getUser().getId().equals(userId)) {
            throw new PermissionException();
        }
        
        // Check if the user already voted
        Optional<ReviewVote> existingVoteOpt = reviewVoteDao.findByReviewIdAndUserId(reviewId, userId);
        
        if (existingVoteOpt.isPresent()) {
            // Update existing vote
            ReviewVote vote = existingVoteOpt.get();
            vote.setHelpful(isHelpful);
            reviewVoteDao.save(vote);
        } else {
            // Create new vote
            ReviewVote vote = new ReviewVote(review, user, isHelpful);
            reviewVoteDao.save(vote);
        }
        
        return review;
    }
    
    @Override
    public void removeVote(Long userId, Long reviewId) 
            throws InstanceNotFoundException, PermissionException {
        
        // Check if review exists
        if (!movieReviewDao.existsById(reviewId)) {
            throw new InstanceNotFoundException("review.notFound", reviewId);
        }
        
        // Check if user exists
        if (!usersDao.existsById(userId)) {
            throw new InstanceNotFoundException("user.notFound", userId);
        }
        
        // Find and delete the vote
        Optional<ReviewVote> voteOpt = reviewVoteDao.findByReviewIdAndUserId(reviewId, userId);
        if (!voteOpt.isPresent()) {
            throw new InstanceNotFoundException("vote.notFound", "ReviewVote");
        }
        
        reviewVoteDao.deleteByReviewIdAndUserId(reviewId, userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getHelpfulVotesCount(Long reviewId) throws InstanceNotFoundException {
        
        if (!movieReviewDao.existsById(reviewId)) {
            throw new InstanceNotFoundException("review.notFound", reviewId);
        }
        
        return movieReviewDao.countHelpfulVotes(reviewId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnhelpfulVotesCount(Long reviewId) throws InstanceNotFoundException {
        
        if (!movieReviewDao.existsById(reviewId)) {
            throw new InstanceNotFoundException("review.notFound", reviewId);
        }
        
        return movieReviewDao.countUnhelpfulVotes(reviewId);
    }

    @Override
    public Page<MovieReview> getMovieReviewsPaged(String imdbId, Pageable pageable) throws InstanceNotFoundException {
        Movie movie = movieDao.findByImdbId(imdbId)
            .orElseThrow(() -> new InstanceNotFoundException("project.entities.movie", imdbId));
            
        return movieReviewDao.findByMovie(movie, pageable);
    }
}
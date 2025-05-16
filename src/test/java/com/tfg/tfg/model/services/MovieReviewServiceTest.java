package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

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

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class MovieReviewServiceTest {

    private final Long NON_EXISTENT_ID = -1L;
    
    @Autowired
    private MovieReviewService movieReviewService;
    
    @Autowired
    private MovieReviewDao movieReviewDao;
    
    @Autowired
    private ReviewVoteDao reviewVoteDao;
    
    @Autowired
    private UsersDao usersDao;
    
    @Autowired
    private MovieDao movieDao;
    
    private Users testUser;
    private Users anotherUser;
    private Movie testMovie;
    private MovieReview testReview;
    
    @BeforeEach
    public void setUp() {
        // Clean up
        reviewVoteDao.deleteAll();
        movieReviewDao.deleteAll();
        
        // Create test user
        testUser = new Users();
        testUser.setUserName("testUser");
        testUser.setPassword("password");
        testUser.setEmail("test@example.com");
        testUser.setAvatar("avatar.jpg");
        testUser.setRole(Users.RoleType.USER);
        usersDao.save(testUser);
        
        // Create another user for testing
        anotherUser = new Users();
        anotherUser.setUserName("anotherUser");
        anotherUser.setPassword("password");
        anotherUser.setEmail("another@example.com");
        anotherUser.setAvatar("avatar2.jpg");
        anotherUser.setRole(Users.RoleType.USER);
        usersDao.save(anotherUser);
        
        // Create test movie
        testMovie = new Movie();
        testMovie.setImdbId("tt1234567");
        testMovie.setTitle("Test Movie");
        testMovie.setOverview("Test movie overview");
        testMovie.setReleaseYear(2023);
        testMovie.setVerticalPoster("poster.jpg");
        testMovie.setRuntime(120);
        movieDao.save(testMovie);
        
        // Create test review
        testReview = new MovieReview();
        testReview.setUser(testUser);
        testReview.setMovie(testMovie);
        testReview.setTitle("Great Movie");
        testReview.setContent("This is a great movie, I recommend it.");
        testReview.setCreatedAt(LocalDateTime.now());
        movieReviewDao.save(testReview);
    }
    
    @Test
    public void testCreateReview() throws InstanceNotFoundException {
        String title = "Amazing Film";
        String content = "Loved every minute of it!";
        
        MovieReview review = movieReviewService.createReview(
            anotherUser.getId(), 
            testMovie.getImdbId(), 
            title,
            content
        );
        
        assertNotNull(review);
        assertEquals(title, review.getTitle());
        assertEquals(content, review.getContent());
        assertEquals(anotherUser.getId(), review.getUser().getId());
        assertEquals(testMovie.getId(), review.getMovie().getId());
        
        // Verify it's in the database
        List<MovieReview> reviews = movieReviewDao.findByUserIdOrderByCreatedAtDesc(anotherUser.getId());
        assertEquals(1, reviews.size());
        assertEquals(title, reviews.get(0).getTitle());
    }
    
    @Test
    public void testCreateReviewWithNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.createReview(
                NON_EXISTENT_ID, 
                testMovie.getImdbId(), 
                "Title", 
                "Content"
            );
        });
    }
    
    @Test
    public void testCreateReviewWithNonExistentMovie() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.createReview(
                testUser.getId(), 
                "tt9999999", 
                "Title", 
                "Content"
            );
        });
    }
    
    @Test
    public void testUpdateExistingReview() throws InstanceNotFoundException {
        // User already has a review for the movie
        String newTitle = "Updated Title";
        String newContent = "Updated Content";
        
        MovieReview updatedReview = movieReviewService.createReview(
            testUser.getId(),
            testMovie.getImdbId(),
            newTitle,
            newContent
        );
        
        assertEquals(testReview.getId(), updatedReview.getId()); // Same review, not a new one
        assertEquals(newTitle, updatedReview.getTitle());
        assertEquals(newContent, updatedReview.getContent());
    }
    
    @Test
    public void testUpdateReview() throws InstanceNotFoundException, PermissionException {
        String newTitle = "New Title";
        String newContent = "New Content";
        
        MovieReview updatedReview = movieReviewService.updateReview(
            testUser.getId(),
            testReview.getId(),
            newTitle,
            newContent
        );
        
        assertEquals(testReview.getId(), updatedReview.getId());
        assertEquals(newTitle, updatedReview.getTitle());
        assertEquals(newContent, updatedReview.getContent());
        
        // Verify database update
        MovieReview fromDb = movieReviewDao.findById(testReview.getId()).orElse(null);
        assertNotNull(fromDb);
        assertEquals(newTitle, fromDb.getTitle());
        assertEquals(newContent, fromDb.getContent());
    }
    
    @Test
    public void testUpdateReviewWithNonExistentReview() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.updateReview(
                testUser.getId(),
                NON_EXISTENT_ID,
                "Title",
                "Content"
            );
        });
    }
    
    @Test
    public void testUpdateReviewWithWrongUser() {
        assertThrows(PermissionException.class, () -> {
            movieReviewService.updateReview(
                anotherUser.getId(),
                testReview.getId(),
                "Title",
                "Content"
            );
        });
    }
    
    @Test
    public void testDeleteReview() throws InstanceNotFoundException, PermissionException {
        movieReviewService.deleteReview(testUser.getId(), testReview.getId());
        
        assertFalse(movieReviewDao.existsById(testReview.getId()));
    }
    
    @Test
    public void testDeleteReviewWithNonExistentReview() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.deleteReview(testUser.getId(), NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testDeleteReviewWithWrongUser() {
        assertThrows(PermissionException.class, () -> {
            movieReviewService.deleteReview(anotherUser.getId(), testReview.getId());
        });
    }
    
    @Test
    public void testGetMovieReviews() throws InstanceNotFoundException {
        // Create another review for the same movie
        MovieReview anotherReview = new MovieReview();
        anotherReview.setUser(anotherUser);
        anotherReview.setMovie(testMovie);
        anotherReview.setTitle("Another Review");
        anotherReview.setContent("Another review content");
        anotherReview.setCreatedAt(LocalDateTime.now().minusDays(1)); // 1 day older
        movieReviewDao.save(anotherReview);
        
        List<MovieReview> reviews = movieReviewService.getMovieReviews(testMovie.getImdbId());
        
        assertEquals(2, reviews.size());
        // First should be newest (testReview) due to createdAt DESC order
        assertEquals(testReview.getId(), reviews.get(0).getId());
        assertEquals(anotherReview.getId(), reviews.get(1).getId());
    }
    
    @Test
    public void testGetMovieReviewsWithNonExistentMovie() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.getMovieReviews("tt9999999");
        });
    }
    
    @Test
    public void testGetUserReviews() throws InstanceNotFoundException {
        // Create a review for another movie by the same user
        Movie anotherMovie = new Movie();
        anotherMovie.setImdbId("tt7654321");
        anotherMovie.setTitle("Another Movie");
        anotherMovie.setOverview("Overview");
        movieDao.save(anotherMovie);
        
        MovieReview anotherReview = new MovieReview();
        anotherReview.setUser(testUser);
        anotherReview.setMovie(anotherMovie);
        anotherReview.setTitle("Review for Another Movie");
        anotherReview.setContent("Content for another movie");
        anotherReview.setCreatedAt(LocalDateTime.now().minusDays(1)); // 1 day older
        movieReviewDao.save(anotherReview);
        
        List<MovieReview> reviews = movieReviewService.getUserReviews(testUser.getId());
        
        assertEquals(2, reviews.size());
        // First should be newest (testReview) due to createdAt DESC order
        assertEquals(testReview.getId(), reviews.get(0).getId());
        assertEquals(anotherReview.getId(), reviews.get(1).getId());
    }
    
    @Test
    public void testGetUserReviewsWithNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.getUserReviews(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testVoteReview() throws InstanceNotFoundException, PermissionException {
        MovieReview votedReview = movieReviewService.voteReview(anotherUser.getId(), testReview.getId(), true);
        
        assertEquals(testReview.getId(), votedReview.getId());
        
        // Verify vote was saved
        List<ReviewVote> votes = reviewVoteDao.findAll();
        assertEquals(1, votes.size());
        assertEquals(testReview.getId(), votes.get(0).getReview().getId());
        assertEquals(anotherUser.getId(), votes.get(0).getUser().getId());
        assertTrue(votes.get(0).isHelpful());
    }
    
    @Test
    public void testVoteReviewWithNonExistentReview() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.voteReview(anotherUser.getId(), NON_EXISTENT_ID, true);
        });
    }
    
    @Test
    public void testVoteReviewWithNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.voteReview(NON_EXISTENT_ID, testReview.getId(), true);
        });
    }
    
    @Test
    public void testVoteOwnReview() {
        assertThrows(PermissionException.class, () -> {
            movieReviewService.voteReview(testUser.getId(), testReview.getId(), true);
        });
    }
    
    @Test
    public void testUpdateExistingVote() throws InstanceNotFoundException, PermissionException {
        // Create initial vote
        movieReviewService.voteReview(anotherUser.getId(), testReview.getId(), true);
        
        // Update to unhelpful
        movieReviewService.voteReview(anotherUser.getId(), testReview.getId(), false);
        
        // Verify vote was updated
        List<ReviewVote> votes = reviewVoteDao.findAll();
        assertEquals(1, votes.size());
        assertFalse(votes.get(0).isHelpful());
    }
    
    @Test
    public void testRemoveVote() throws InstanceNotFoundException, PermissionException {
        // Create vote first
        movieReviewService.voteReview(anotherUser.getId(), testReview.getId(), true);
        
        // Remove the vote
        movieReviewService.removeVote(anotherUser.getId(), testReview.getId());
        
        // Verify vote was removed
        List<ReviewVote> votes = reviewVoteDao.findAll();
        assertTrue(votes.isEmpty());
    }
    
    @Test
    public void testRemoveVoteWithNonExistentReview() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.removeVote(anotherUser.getId(), NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testRemoveVoteWithNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.removeVote(NON_EXISTENT_ID, testReview.getId());
        });
    }
    
    @Test
    public void testRemoveNonExistentVote() {
        // No vote exists yet
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.removeVote(anotherUser.getId(), testReview.getId());
        });
    }
    
    @Test
    public void testGetHelpfulVotesCount() throws InstanceNotFoundException, PermissionException {
        // Add helpful votes
        movieReviewService.voteReview(anotherUser.getId(), testReview.getId(), true);
        
        // Create a third user and add another helpful vote
        Users thirdUser = new Users();
        thirdUser.setUserName("thirdUser");
        thirdUser.setPassword("password");
        thirdUser.setEmail("third@example.com");
        thirdUser.setAvatar("avatar3.jpg");
        thirdUser.setRole(Users.RoleType.USER); // USER role
        usersDao.save(thirdUser);
        
        movieReviewService.voteReview(thirdUser.getId(), testReview.getId(), true);
        
        Long helpfulVotes = movieReviewService.getHelpfulVotesCount(testReview.getId());
        
        assertEquals(2L, helpfulVotes);
    }
    
    @Test
    public void testGetUnhelpfulVotesCount() throws InstanceNotFoundException, PermissionException {
        // Add unhelpful vote
        movieReviewService.voteReview(anotherUser.getId(), testReview.getId(), false);
        
        Long unhelpfulVotes = movieReviewService.getUnhelpfulVotesCount(testReview.getId());
        
        assertEquals(1L, unhelpfulVotes);
    }
    
    @Test
    public void testGetHelpfulVotesCountWithNonExistentReview() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.getHelpfulVotesCount(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testGetUnhelpfulVotesCountWithNonExistentReview() {
        assertThrows(InstanceNotFoundException.class, () -> {
            movieReviewService.getUnhelpfulVotesCount(NON_EXISTENT_ID);
        });
    }
}
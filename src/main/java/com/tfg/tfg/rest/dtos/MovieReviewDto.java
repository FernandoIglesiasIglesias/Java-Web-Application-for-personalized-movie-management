package com.tfg.tfg.rest.dtos;

public class MovieReviewDto {
    
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long movieId;
    private String movieImdbId;
    private String movieTitle;
    private String moviePoster;
    private String title;
    private String content;
    private String createdAt;
    private Long helpfulVotes;
    private Long unhelpfulVotes;
    private Boolean userVoted;
    private Boolean userVotedHelpful;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getUserAvatar() {
        return userAvatar;
    }
    
    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }
    
    public Long getMovieId() {
        return movieId;
    }
    
    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }
    
    public String getMovieImdbId() {
        return movieImdbId;
    }
    
    public void setMovieImdbId(String movieImdbId) {
        this.movieImdbId = movieImdbId;
    }
    
    public String getMovieTitle() {
        return movieTitle;
    }
    
    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }
    
    public String getMoviePoster() {
        return moviePoster;
    }
    
    public void setMoviePoster(String moviePoster) {
        this.moviePoster = moviePoster;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getHelpfulVotes() {
        return helpfulVotes;
    }
    
    public void setHelpfulVotes(Long helpfulVotes) {
        this.helpfulVotes = helpfulVotes;
    }
    
    public Long getUnhelpfulVotes() {
        return unhelpfulVotes;
    }
    
    public void setUnhelpfulVotes(Long unhelpfulVotes) {
        this.unhelpfulVotes = unhelpfulVotes;
    }
    
    public Boolean getUserVoted() {
        return userVoted;
    }
    
    public void setUserVoted(Boolean userVoted) {
        this.userVoted = userVoted;
    }
    
    public Boolean getUserVotedHelpful() {
        return userVotedHelpful;
    }
    
    public void setUserVotedHelpful(Boolean userVotedHelpful) {
        this.userVotedHelpful = userVotedHelpful;
    }
}
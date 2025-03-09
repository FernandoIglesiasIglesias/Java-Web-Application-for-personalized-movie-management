package com.tfg.tfg.rest.dtos;

import java.util.List;

public class CustomListDto {
    
    private Long id;
    private String name;
    private Long userId;
    private List<MovieDto> movies;
    
    public CustomListDto() {}
    
    public CustomListDto(Long id, String name, Long userId, List<MovieDto> movies) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.movies = movies;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public List<MovieDto> getMovies() {
        return movies;
    }
    
    public void setMovies(List<MovieDto> movies) {
        this.movies = movies;
    }
}
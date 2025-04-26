package com.tfg.tfg.rest.dtos;

public class ActivityDto {
    
    private Double rating;
    private String searchParams;
    
    public ActivityDto() {}

    public ActivityDto(Double rating, String searchParams) {
        this.rating = rating;
        this.searchParams = searchParams;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public String getSearchParams() {
        return searchParams;
    }
    
    public void setSearchParams(String searchParams) {
        this.searchParams = searchParams;
    }
}
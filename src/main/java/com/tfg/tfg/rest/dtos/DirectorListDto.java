package com.tfg.tfg.rest.dtos;

import java.util.List;

public class DirectorListDto {
    
    private Long id;
    private Long userId;
    private String name;
    private List<DirectorDto> directors;
    private Integer directorCount;
    
    public DirectorListDto() {}

    public DirectorListDto(Long id, String name, Long userId, List<DirectorDto> directors, int directorCount) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.directors = directors;
        this.directorCount = directorCount;
    }
    
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public List<DirectorDto> getDirectors() {
        return directors;
    }
    
    public void setDirectors(List<DirectorDto> directors) {
        this.directors = directors;
    }
    
    public Integer getDirectorCount() {
        return directorCount;
    }
    
    public void setDirectorCount(Integer directorCount) {
        this.directorCount = directorCount;
    }
}
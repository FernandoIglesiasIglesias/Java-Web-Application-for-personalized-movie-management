package com.tfg.tfg.rest.dtos;

import java.util.List;

public class ActorListDto {
    
    private Long id;
    private Long userId;
    private String name;
    private List<ActorDto> actors;
    private Integer actorCount;
    
    public ActorListDto() {}

    public ActorListDto(Long id, String name, Long userId, List<ActorDto> actors, int actorCount) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.actors = actors;
        this.actorCount = actorCount;
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
    
    public List<ActorDto> getActors() {
        return actors;
    }
    
    public void setActors(List<ActorDto> actors) {
        this.actors = actors;
    }
    
    public Integer getActorCount() {
        return actorCount;
    }
    
    public void setActorCount(Integer actorCount) {
        this.actorCount = actorCount;
    }
}
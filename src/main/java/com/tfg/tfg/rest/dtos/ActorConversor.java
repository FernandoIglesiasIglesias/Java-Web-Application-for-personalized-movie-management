package com.tfg.tfg.rest.dtos;

import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.Date;

import com.tfg.tfg.model.entities.Actor;

public class ActorConversor {

    private ActorConversor() {}

    public static ActorDto toActorDto(Actor actor) {
        if (actor == null) return null;
        ActorDto dto = new ActorDto(actor.getId(), actor.getName());
        dto.setImdbId(actor.getImdbId());
        return dto;
    }

    public static ActorDto toActorDtoExpanded(Actor actor) {
        if (actor == null) return null;
        
        ActorDto actorDto = new ActorDto();
        actorDto.setId(actor.getId());
        actorDto.setName(actor.getName());
        actorDto.setBirthDate(actor.getBirthDate());
        actorDto.setBirthPlace(actor.getBirthPlace());
        actorDto.setHeight(actor.getHeight());
        actorDto.setBio(actor.getBio());
        actorDto.setImageUrl(actor.getImageUrl());
        actorDto.setImdbId(actor.getImdbId());
        if (actor.getMovies() != null && !actor.getMovies().isEmpty()) {
            actorDto.setMovies(actor.getMovies().stream()
                .map(MovieConversor::toMovieDto)
                .toList());
        }
        
        return actorDto;
    }

    public static Actor toActor(ActorDto actorDto) {
        if (actorDto == null) return null;
        
        Actor actor = new Actor();
        actor.setId(actorDto.getId());
        actor.setName(actorDto.getName());
        actor.setBirthDate(actorDto.getBirthDate());
        actor.setBirthPlace(actorDto.getBirthPlace());
        actor.setHeight(actorDto.getHeight());
        actor.setBio(actorDto.getBio());
        actor.setImageUrl(actorDto.getImageUrl());
        actor.setImdbId(actorDto.getImdbId());
        
        return actor;
    }
    
    public static Date parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        String[] dateFormats = {
            "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "MMMM d, yyyy", "d MMMM yyyy"
        };
        
        for (String format : dateFormats) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat(format);
                dateFormat.setLenient(false);
                return dateFormat.parse(dateString.trim());
            } catch (ParseException e) {
            }
        }
        
        return null;
    }
}
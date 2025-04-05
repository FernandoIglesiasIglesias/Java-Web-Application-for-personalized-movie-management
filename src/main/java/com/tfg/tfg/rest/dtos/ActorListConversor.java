package com.tfg.tfg.rest.dtos;

import java.util.List;
import java.util.Collections;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorList;

public class ActorListConversor {

    private ActorListConversor() {}
    
    public static ActorListDto toActorListDto(ActorList actorList) {
        ActorListDto dto = new ActorListDto();
        
        dto.setId(actorList.getId());
        dto.setUserId(actorList.getUser().getId());
        dto.setName(actorList.getName());
        dto.setActorCount(actorList.getActors().size());
        
        return dto;
    }

    private static ActorDto toActorDtoWithImage(Actor actor) {
        if (actor == null) {
            return null;
        }
        
        ActorDto actorDto = new ActorDto();
        actorDto.setId(actor.getId());
        actorDto.setName(actor.getName());
        actorDto.setImdbId(actor.getImdbId());
        
        actorDto.setImageUrl(actor.getImageUrl());

        return actorDto;
    }
    
    // Método para convertir una lista con sus actores, incluyendo las imágenes
    public static ActorListDto toActorListDtoWithActors(ActorList actorList) {
        if (actorList == null) {
            return null;
        }
        
        ActorListDto dto = toActorListDto(actorList);
        
        if (actorList.getActors() != null) {
            dto.setActors(actorList.getActors().stream()
                .map(ActorListConversor::toActorDtoWithImage) // Usar el método que incluye imageUrl
                .toList());
        } else {
            dto.setActors(Collections.emptyList());
        }
        
        return dto;
    }
    
    public static List<ActorListDto> toActorListDtos(List<ActorList> actorLists) {
        return actorLists.stream()
            .map(ActorListConversor::toActorListDto)
            .toList();
    }
}
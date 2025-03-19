package com.tfg.tfg.rest.dtos;

import java.util.List;

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

    public static ActorListDto toActorListDtoWithActors(ActorList actorList) {
        ActorListDto dto = toActorListDto(actorList);
        
        List<ActorDto> actorDtos = actorList.getActors().stream()
            .map(ActorConversor::toActorDto)
            .toList();
        
        dto.setActors(actorDtos);
        
        return dto;
    }
    
    public static List<ActorListDto> toActorListDtos(List<ActorList> actorLists) {
        return actorLists.stream()
            .map(ActorListConversor::toActorListDto)
            .toList();
    }
}
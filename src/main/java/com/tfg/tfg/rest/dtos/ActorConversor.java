package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Actor;

public class ActorConversor {

    private ActorConversor() {}

    public static ActorDto toActorDto(Actor actor) {
        return new ActorDto(actor.getId(), actor.getFirstName(), actor.getLastName(), actor.getNationality(), actor.getBirthDate());
    }
}
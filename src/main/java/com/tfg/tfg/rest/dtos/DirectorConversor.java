package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Director;

public class DirectorConversor {

    private DirectorConversor() {}

    public static DirectorDto toDirectorDto(Director director) {
        return new DirectorDto(director.getId(), director.getFirstName(), director.getLastName());
    }
}
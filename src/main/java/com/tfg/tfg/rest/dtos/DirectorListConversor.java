package com.tfg.tfg.rest.dtos;

import java.util.Collections;
import java.util.List;

import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorList;

public class DirectorListConversor {

    private DirectorListConversor() {}
    
    public static DirectorListDto toDirectorListDto(DirectorList directorList) {
        DirectorListDto dto = new DirectorListDto();
        
        dto.setId(directorList.getId());
        dto.setUserId(directorList.getUser().getId());
        dto.setName(directorList.getName());
        dto.setDirectorCount(directorList.getDirectors().size());
        
        return dto;
    }

    private static DirectorDto toDirectorDtoWithImage(Director director) {
        if (director == null) {
            return null;
        }
        
        DirectorDto directorDto = new DirectorDto();
        directorDto.setId(director.getId());
        directorDto.setName(director.getName());
        directorDto.setImdbId(director.getImdbId());
        
        directorDto.setImageUrl(director.getImageUrl());
        
        return directorDto;
    }
    
    // Método para convertir una lista con sus directores, incluyendo las imágenes
    public static DirectorListDto toDirectorListDtoWithDirectors(DirectorList directorList) {
        if (directorList == null) {
            return null;
        }
        
        DirectorListDto dto = toDirectorListDto(directorList);
        
        if (directorList.getDirectors() != null) {
            dto.setDirectors(directorList.getDirectors().stream()
                .map(DirectorListConversor::toDirectorDtoWithImage) // Usar el método que incluye imageUrl
                .toList());
        } else {
            dto.setDirectors(Collections.emptyList());
        }
        
        return dto;
    }
    
    public static List<DirectorListDto> toDirectorListDtos(List<DirectorList> directorLists) {
        return directorLists.stream()
            .map(DirectorListConversor::toDirectorListDto)
            .toList();
    }
}
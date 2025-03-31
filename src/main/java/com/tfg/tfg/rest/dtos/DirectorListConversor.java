package com.tfg.tfg.rest.dtos;

import java.util.List;

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

    public static DirectorListDto toDirectorListDtoWithDirectors(DirectorList directorList) {
        DirectorListDto dto = toDirectorListDto(directorList);
        
        List<DirectorDto> directorDtos = directorList.getDirectors().stream()
            .map(DirectorConversor::toDirectorDto)
            .toList();
        
        dto.setDirectors(directorDtos);
        
        return dto;
    }
    
    public static List<DirectorListDto> toDirectorListDtos(List<DirectorList> directorLists) {
        return directorLists.stream()
            .map(DirectorListConversor::toDirectorListDto)
            .toList();
    }
}
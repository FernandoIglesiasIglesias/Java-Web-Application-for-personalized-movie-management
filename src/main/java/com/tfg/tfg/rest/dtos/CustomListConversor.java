package com.tfg.tfg.rest.dtos;

import java.util.List;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.Users;

public class CustomListConversor {

    private CustomListConversor() {
    }
    
    public static CustomListDto toCustomListDto(CustomList customList) {
        List<MovieDto> movieDtos = customList.getMovies().stream()
                .map(MovieConversor::toMovieDto)
                .toList();
        
        return new CustomListDto(
                customList.getId(),
                customList.getName(),
                customList.getUser().getId(),
                movieDtos
        );
    }
    
    public static List<CustomListDto> toCustomListDtos(List<CustomList> customLists) {
        return customLists.stream()
                .map(CustomListConversor::toCustomListDto)
                .toList();
    }
    
    public static CustomList toCustomList(CustomListDto dto, Users user) {
        CustomList customList = new CustomList();
        customList.setId(dto.getId());
        customList.setName(dto.getName());
        customList.setUser(user);
        
        return customList;
    }
}
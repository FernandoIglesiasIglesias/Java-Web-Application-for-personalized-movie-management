package com.tfg.tfg.rest.dtos;

import java.util.ArrayList;
import java.util.List;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.Users;

public class CustomListConversor {

    private CustomListConversor() {
    }
    
    public static CustomListDto toCustomListDto(CustomList list) {
        if (list == null) return null;
        
        List<MovieDto> movieDtos = list.getMovies() != null ?
            list.getMovies().stream()
                .map(MovieConversor::toMovieDto)
                .toList() :
            new ArrayList<>();
        
        return new CustomListDto(
                list.getId(),
                list.getName(),
                list.getUser() != null ? list.getUser().getId() : null,
                movieDtos,
                list.getMovies() != null ? list.getMovies().size() : 0
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
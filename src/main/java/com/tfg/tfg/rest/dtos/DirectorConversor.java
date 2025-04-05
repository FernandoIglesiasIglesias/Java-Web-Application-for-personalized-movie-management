package com.tfg.tfg.rest.dtos;

import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.Date;

import com.tfg.tfg.model.entities.Director;

public class DirectorConversor {
    
    private DirectorConversor() {}
    
    public static DirectorDto toDirectorDto(Director director) {
        if (director == null) return null;
        DirectorDto dto = new DirectorDto(director.getId(), director.getName());
        dto.setImdbId(director.getImdbId());
        return dto;    }
    
    public static DirectorDto toDirectorDtoExpanded(Director director) {
        if (director == null) return null;
        
        DirectorDto directorDto = new DirectorDto();
        directorDto.setId(director.getId());
        directorDto.setName(director.getName());
        directorDto.setBirthDate(director.getBirthDate());
        directorDto.setBirthPlace(director.getBirthPlace());
        directorDto.setHeight(director.getHeight());
        directorDto.setBio(director.getBio());
        directorDto.setImageUrl(director.getImageUrl());
        directorDto.setImdbId(director.getImdbId());
        if (director.getMovies() != null && !director.getMovies().isEmpty()) {
            directorDto.setMovies(director.getMovies().stream()
                .map(MovieConversor::toMovieDto)
                .toList());
        }
        
        return directorDto;
    }
    
    public static Director toDirector(DirectorDto directorDto) {
        if (directorDto == null) return null;
        
        Director director = new Director();
        director.setId(directorDto.getId());
        director.setName(directorDto.getName());
        director.setBirthDate(directorDto.getBirthDate());
        director.setBirthPlace(directorDto.getBirthPlace());
        director.setHeight(directorDto.getHeight());
        director.setBio(directorDto.getBio());
        director.setImageUrl(directorDto.getImageUrl());
        director.setImdbId(directorDto.getImdbId());
        
        return director;
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
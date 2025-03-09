package com.tfg.tfg.model.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "CustomLists")
public class CustomList {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "userId")
    private Users user;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "CustomListMovies", 
        joinColumns = @JoinColumn(name = "listId"), 
        inverseJoinColumns = @JoinColumn(name = "movieId")
    )
    private List<Movie> movies = new ArrayList<>();
    
    public CustomList() {}
    
    public CustomList(String name, Users user) {
        this.name = name;
        this.user = user;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public List<Movie> getMovies() {
        return movies;
    }

    public void setMovies(List<Movie> movies) {
        this.movies = movies;
    }
    
    public void addMovie(Movie movie) {
        if (!this.movies.contains(movie)) {
            this.movies.add(movie);
        }
    }
    
    public void removeMovie(Movie movie) {
        this.movies.remove(movie);
    }
}
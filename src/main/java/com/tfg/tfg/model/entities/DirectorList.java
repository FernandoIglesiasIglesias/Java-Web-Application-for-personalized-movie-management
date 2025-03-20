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
@Table(name = "DirectorLists")
public class DirectorList {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private Users user;
    
    private String name;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "DirectorListItems",
        joinColumns = @JoinColumn(name = "listId"),
        inverseJoinColumns = @JoinColumn(name = "directorId")
    )
    private List<Director> directors = new ArrayList<>();
    
    public DirectorList() {}
    
    public DirectorList(Users user, String name) {
        this.user = user;
        this.name = name;
    }
    
    public DirectorList(Users user, String name, List<Director> directors) {
        this.user = user;
        this.name = name;
        this.directors = directors;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Users getUser() {
        return user;
    }
    
    public void setUser(Users user) {
        this.user = user;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public List<Director> getDirectors() {
        return directors;
    }
    
    public void setDirectors(List<Director> directors) {
        this.directors = directors;
    }
    
    public void addDirector(Director director) {
        if (!this.directors.contains(director)) {
            this.directors.add(director);
        }
    }
    
    public void removeDirector(Director director) {
        this.directors.remove(director);
    }
}
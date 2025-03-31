package com.tfg.tfg.model.entities;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectorListDao extends JpaRepository<DirectorList, Long> {
    
    List<DirectorList> findByUserId(Long userId);
    
    boolean existsByUserIdAndName(Long userId, String name);
    
    Optional<DirectorList> findByUserIdAndName(Long userId, String name);
}
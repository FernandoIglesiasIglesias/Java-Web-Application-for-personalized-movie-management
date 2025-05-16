package com.tfg.tfg.model.entities;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActorListDao extends JpaRepository<ActorList, Long> {
    
    List<ActorList> findByUserId(Long userId);
    
    boolean existsByUserIdAndName(Long userId, String name);
    
    Optional<ActorList> findByUserIdAndName(Long userId, String name);
}
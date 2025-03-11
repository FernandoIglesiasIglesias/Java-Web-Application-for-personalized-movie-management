package com.tfg.tfg.model.entities;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomListDao extends JpaRepository<CustomList, Long> {
    List<CustomList> findByUserId(Long userId);
    Optional<CustomList> findByIdAndUserId(Long id, Long userId);
    Optional<CustomList> findByNameAndUserId(String name, Long userId);
    Optional<CustomList> findByNameAndUserIdAndIdNot(String name, Long userId, Long id);
}
package com.tfg.tfg.model.entities;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersDao extends JpaRepository<Users, Long> {

    boolean existsByUserName(String userName);
    
    Optional<Users> findByUserName(String userName);

    
}
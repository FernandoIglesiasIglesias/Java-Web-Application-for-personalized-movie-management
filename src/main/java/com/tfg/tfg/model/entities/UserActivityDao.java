package com.tfg.tfg.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserActivityDao extends JpaRepository<UserActivity, Long> {
    List<UserActivity> findByUserIdOrderByTimestampDesc(Long userId);
    List<UserActivity> findByUserIdAndActivityType(Long userId, String activityType);
    void deleteByUserId(Long userId);
}
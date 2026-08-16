package com.vidyutseva.repository;

import com.vidyutseva.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByConsumerIdOrderByCreatedAtDesc(String consumerId);
    long countByConsumerIdAndIsRead(String consumerId, Boolean isRead);
}

package com.vidyutseva.repository;

import com.vidyutseva.entity.FeedbackEntity;
import com.vidyutseva.entity.FeedbackEntity.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long> {
    
    List<FeedbackEntity> findByConsumerId(String consumerId);
    List<FeedbackEntity> findByStatus(FeedbackStatus status);
    List<FeedbackEntity> findByStatusOrderByCreatedAtDesc(FeedbackStatus status);
    List<FeedbackEntity> findAllByOrderByCreatedAtDesc();
    boolean existsByFeedbackNumber(String feedbackNumber);
}
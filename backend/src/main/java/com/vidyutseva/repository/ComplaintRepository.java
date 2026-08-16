package com.vidyutseva.repository;

import com.vidyutseva.entity.ComplaintEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<ComplaintEntity, String> {
    List<ComplaintEntity> findByConsumerId(String consumerId);
    List<ComplaintEntity> findByAssignedArea(String assignedArea);
    List<ComplaintEntity> findByStatus(String status);
    List<ComplaintEntity> findByAssignedAreaAndStatus(String area, String status);
    long countByStatus(String status);
}

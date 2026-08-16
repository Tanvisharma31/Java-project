package com.vidyutseva.repository;

import com.vidyutseva.entity.ServiceRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequestEntity, String> {
    List<ServiceRequestEntity> findByConsumerId(String consumerId);
    List<ServiceRequestEntity> findByStatus(String status);
    long countByStatus(String status);
}

package com.vidyutseva.repository;

import com.vidyutseva.entity.BillEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<BillEntity, String> {
    List<BillEntity> findByConsumerId(String consumerId);
    List<BillEntity> findByConsumerIdAndStatus(String consumerId, String status);
    List<BillEntity> findByStatus(String status);
    boolean existsByConsumerIdAndBillingMonth(String consumerId, String billingMonth);
}

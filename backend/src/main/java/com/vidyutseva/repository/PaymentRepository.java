package com.vidyutseva.repository;

import com.vidyutseva.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {
    List<PaymentEntity> findByConsumerId(String consumerId);
}

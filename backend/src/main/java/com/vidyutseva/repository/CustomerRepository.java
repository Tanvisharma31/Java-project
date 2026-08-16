package com.vidyutseva.repository;

import com.vidyutseva.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, String> {
    Optional<CustomerEntity> findByConsumerId(String consumerId);
    Optional<CustomerEntity> findByUserId(String userId);
    Optional<CustomerEntity> findByEmail(String email);
    List<CustomerEntity> findByUserIdOrEmail(String userId, String email);
    List<CustomerEntity> findByAddressArea(String addressArea);
    List<CustomerEntity> findByStatus(String status);
    boolean existsByConsumerId(String consumerId);
    boolean existsByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByUserId(String userId);
}

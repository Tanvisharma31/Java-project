package com.vidyutseva.repository;

import com.vidyutseva.entity.TariffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TariffRepository extends JpaRepository<TariffEntity, Long> {
    Optional<TariffEntity> findByConnectionType(String connectionType);
}

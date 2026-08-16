package com.vidyutseva.repository;

import com.vidyutseva.entity.StaffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<StaffEntity, String> {
    Optional<StaffEntity> findByStaffId(String staffId);
    List<StaffEntity> findByAreaAssigned(String areaAssigned);
}

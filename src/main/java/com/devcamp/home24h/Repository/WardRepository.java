package com.devcamp.home24h.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Ward;

public interface WardRepository extends JpaRepository<Ward, Integer>{

    List<Ward> findByDistrictId(int districtId);
    
}

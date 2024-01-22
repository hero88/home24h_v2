package com.devcamp.home24h.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.District;

public interface DistrictRepository extends JpaRepository<District, Integer>{

    List<District> findByProvinceId(int provinceId);

    District findByName(String name);
    
}

package com.devcamp.home24h.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Street;

public interface StreetRepository extends JpaRepository<Street, Integer>{

    List<Street> findByProvinceIdAndDistrictId(int provinceId, int districtId);

    
}

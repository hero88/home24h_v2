package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Province;

public interface ProvinceRepository extends JpaRepository<Province, Integer>{

    Province findByName(String name);

    Province findByCode(String code);
    
}

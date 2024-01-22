package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.DesignUnit;

public interface DesignUnitRepository extends JpaRepository<DesignUnit, Integer>{
    DesignUnit findByName (String name);
}

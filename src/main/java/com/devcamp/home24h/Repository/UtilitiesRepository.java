package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Utilities;

public interface UtilitiesRepository extends JpaRepository<Utilities, Integer>{
    Utilities findByName(String name);
}

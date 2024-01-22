package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Contractor;

public interface ContractorRepository extends JpaRepository<Contractor, Integer> {
    Contractor findByName(String name);
}

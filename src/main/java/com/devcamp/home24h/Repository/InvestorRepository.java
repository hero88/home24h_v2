package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Investor;

public interface InvestorRepository extends JpaRepository<Investor, Integer> {

    Investor findByName(String name);
    
}

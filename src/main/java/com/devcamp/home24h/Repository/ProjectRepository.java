package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Project;

public interface ProjectRepository extends JpaRepository<Project, Integer>{

    Project findByName(String name);
    
}

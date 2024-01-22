package com.devcamp.home24h.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Layout;

public interface LayoutRepository extends JpaRepository<Layout, Integer>{

    List<Layout> findByProjectId(int projectId);
    
}

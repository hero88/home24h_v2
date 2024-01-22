package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.RegionLink;

public interface RegionLinkRepository extends JpaRepository<RegionLink, Integer>{
    RegionLink findByName(String name);
}

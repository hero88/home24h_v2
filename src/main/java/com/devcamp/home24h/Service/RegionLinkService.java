package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.RegionLinkRepository;
import com.devcamp.home24h.model.RegionLink;

@Service
public class RegionLinkService {
    
    @Autowired
    RegionLinkRepository regionLinkRepository;

    //Search RegionLink theo Name
    public List<RegionLink> findRegionLinkByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<RegionLink> allRegionLink = regionLinkRepository.findAll();
    
        List<RegionLink> filterRegionLinkName = allRegionLink.stream().filter(i -> {
            for (String keyword : nameArray) {
                if (!i.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterRegionLinkName;
    }

}

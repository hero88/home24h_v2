package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.UtilitiesRepository;
import com.devcamp.home24h.model.Utilities;

@Service
public class UtilitiesService {
    @Autowired
    UtilitiesRepository utilitiesRepository;

    //Search Utilities theo Name
    public List<Utilities> findUtilitiesByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<Utilities> allUtilities = utilitiesRepository.findAll();
    
        List<Utilities> filterUtilitiesName = allUtilities.stream().filter(i -> {
            for (String keyword : nameArray) {
                if (!i.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterUtilitiesName;
    }

    
}

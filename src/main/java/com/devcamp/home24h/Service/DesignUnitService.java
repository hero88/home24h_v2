package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.DesignUnitRepository;
import com.devcamp.home24h.model.DesignUnit;

@Service
public class DesignUnitService {
    
    @Autowired
    DesignUnitRepository designUnitRepository;


    //Search DesignnUnit theo Name
    public List<DesignUnit> findDesignUnitByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<DesignUnit> allDesignUnit = designUnitRepository.findAll();
    
        List<DesignUnit> filterDesignUnitName = allDesignUnit.stream().filter(i -> {
            for (String keyword : nameArray) {
                if (!i.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterDesignUnitName;
    }

}

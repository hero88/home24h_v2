package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.DistrictRepository;
import com.devcamp.home24h.model.District;

@Service
public class DistrictService {
    @Autowired
    DistrictRepository districtRepository;


    public List<District> findDistrictByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<District> allDistrict = districtRepository.findAll();
    
        List<District> filterDistrictName = allDistrict.stream().filter(district -> {
            for (String keyword : nameArray) {
                if (!district.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterDistrictName;
    }

    
}

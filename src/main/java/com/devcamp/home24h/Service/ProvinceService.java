package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.ProvinceRepository;
import com.devcamp.home24h.model.Province;

@Service
public class ProvinceService {

    @Autowired
    ProvinceRepository provinceRepository;

    //Search Province theo Name
    public List<Province> findProvinceByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<Province> allProvince = provinceRepository.findAll();
    
        List<Province> filterProvinceName = allProvince.stream().filter(province -> {
            for (String keyword : nameArray) {
                if (!province.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterProvinceName;
    }


    
}

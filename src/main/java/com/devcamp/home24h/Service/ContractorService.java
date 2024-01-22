package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.ContractorRepository;
import com.devcamp.home24h.model.Contractor;

@Service
public class ContractorService {

    @Autowired
    ContractorRepository contractorRepository;

    //Search Contractor theo Name
    public List<Contractor> findContractorByKeyName(String name){
        String [] nameArray = name.split(" ");
      
        List<Contractor> allContractor = contractorRepository.findAll();
    
        List<Contractor> filterContractorName = allContractor.stream().filter(contractor -> {
            for (String keyword : nameArray) {
                if (!contractor.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterContractorName;
    }

    
}

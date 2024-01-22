package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.InvestorRepository;
import com.devcamp.home24h.model.Investor;

@Service
public class InvestorService {

    @Autowired
    InvestorRepository investorRepository;

    //Search Investor theo Name
    public List<Investor> findInvestorByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<Investor> allInvestor = investorRepository.findAll();
    
        List<Investor> filterInvestorName = allInvestor.stream().filter(i -> {
            for (String keyword : nameArray) {
                if (!i.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterInvestorName;
    }

    
}

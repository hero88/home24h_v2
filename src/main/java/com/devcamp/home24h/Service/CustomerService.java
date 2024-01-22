package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.CustomerRepository;
import com.devcamp.home24h.model.Customer;

@Service
public class CustomerService {

    @Autowired
    CustomerRepository customerRepository;


    //Search DesignnUnit theo Phone
    public List<Customer> findCustomerByKeyPhone(String phone){
        List<Customer> allCustomer = customerRepository.findAll();
    
        List<Customer> filterCustomerPhone = allCustomer.stream().filter(i -> i.getMobile().contains(phone))
            .collect(Collectors.toList());
        return filterCustomerPhone;
    }

    
}

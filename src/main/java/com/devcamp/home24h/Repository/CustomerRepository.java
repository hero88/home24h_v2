package com.devcamp.home24h.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer>{

    Customer findByMobile(String mobile);
    
}

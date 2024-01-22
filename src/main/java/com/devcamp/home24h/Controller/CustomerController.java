package com.devcamp.home24h.Controller;

import java.util.Date;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.home24h.Repository.CustomerRepository;
import com.devcamp.home24h.Service.CustomerService;
import com.devcamp.home24h.model.Customer;

@RestController
@CrossOrigin
public class CustomerController {

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    CustomerService customerService;

    //Tạo Customer trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/customer/post")
    public ResponseEntity<Object> createCustomer(@RequestBody Customer customer){
        try {  
            if(customerRepository.findByMobile(customer.getMobile()) != null){
                return ResponseEntity.badRequest().body("SĐT này đã tồn tại");
            }
            customer.setCreatDate(new Date());
            customer.setUpdateDate(new Date());        

            return ResponseEntity.status(HttpStatus.CREATED).body(customerRepository.save(customer));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Lây danh sách Customer có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/customer/get/allCustomer")
    public ResponseEntity<Page<Customer>> getAllCustomerPagination(@RequestParam String phone, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<Customer> customerByPhone = customerService.findCustomerByKeyPhone(phone);
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, customerByPhone.size());
            Page<Customer> customerByPhonePagination = new PageImpl<>(customerByPhone.subList(start, end), paging, customerByPhone.size());
            
            return ResponseEntity.ok(customerByPhonePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lây danh sách Customer
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/customer/get/all")
    public ResponseEntity<List<Customer>> getAllCustomer(){
        try {            
            return ResponseEntity.ok(customerRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Lấy thông tin Customer theo Id
    @GetMapping("/customer/get/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<Customer> getCustomerById(@PathVariable int customerId){
        try {
            Customer customertById = customerRepository.findById(customerId).get();
            return ResponseEntity.ok(customertById);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    
    //Xóa Customer By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/customer/delete/{customerId}")
    public ResponseEntity<Object> deleteCustomer(@PathVariable int customerId){
        try {    
            customerRepository.deleteById(customerId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Cập nhật Customer trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/customer/put/{customerId}")
    public ResponseEntity<Object> updateDesignUnit(@RequestBody Customer newCustomer, @PathVariable int customerId){
        try {
            if(customerRepository.findByMobile(newCustomer.getMobile()) != null && customerRepository.findByMobile(newCustomer.getMobile()).getId() != customerId ){
                return ResponseEntity.badRequest().body("SDT này đã tồn tại");
            }         
            
             
            Customer customerUpdate = customerRepository.findById(customerId).get();
            BeanUtils.copyProperties(newCustomer, customerUpdate, "id");
            customerRepository.save(customerUpdate);
                    
            return ResponseEntity.status(HttpStatus.CREATED).body(customerUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    
}

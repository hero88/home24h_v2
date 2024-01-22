package com.devcamp.home24h.Controller;

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

import com.devcamp.home24h.Repository.ContractorRepository;
import com.devcamp.home24h.Service.ContractorService;
import com.devcamp.home24h.model.Contractor;

@RestController
@CrossOrigin
public class ContractorController {

    @Autowired
    ContractorRepository contractorRepository;

    @Autowired
    ContractorService contractorService;

    //Lấy Danh sách tất cả contractor
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/contractor/get/all")
    public List<Contractor> getAllContractor(){
        return contractorRepository.findAll();
    }


    //Lây danh sách Contractor có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/contractor/get/allContractor")
    public ResponseEntity<Page<Contractor>> getAllContractorPagination(@RequestParam String name, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<Contractor> contractorByName = contractorService.findContractorByKeyName(name);
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, contractorByName.size());
            Page<Contractor> contractorByNamePagination = new PageImpl<>(contractorByName.subList(start, end), paging, contractorByName.size());
            
            return ResponseEntity.ok(contractorByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy thông tin Contractor theo Id
    @GetMapping("/contractor/get/{contractorId}")
    public ResponseEntity<Contractor> getContractorById(@PathVariable int contractorId){
        try {
            Contractor contractorById = contractorRepository.findById(contractorId).get();
            return ResponseEntity.ok(contractorById);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Tạo Contractor trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/contractor/post")
    public ResponseEntity<Object> createContactor(@RequestBody Contractor contractor){
        try {  
            if(contractorRepository.findByName(contractor.getName()) != null){
                return ResponseEntity.badRequest().body("Tên nhà thầu này đã tồn tại");
            }         
            return ResponseEntity.status(HttpStatus.CREATED).body(contractorRepository.save(contractor));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Cập nhật Contractor trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/contractor/put/{contractorId}")
    public ResponseEntity<Object> updateContractor(@RequestBody Contractor newContractor, @PathVariable int contractorId){
        try {
            if(contractorRepository.findByName(newContractor.getName()) != null && contractorRepository.findByName(newContractor.getName()).getId() != contractorId ){
                return ResponseEntity.badRequest().body("Tên nhà thầu này đã tồn tại");
            }         
                         
            Contractor contractorUpdate = contractorRepository.findById(contractorId).get();
            BeanUtils.copyProperties(newContractor, contractorUpdate, "id");
            contractorRepository.save(contractorUpdate);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(contractorUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    //Xóa Contractor By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/contractor/delete/{contractorId}")
    public ResponseEntity<Object> deleteContractor(@PathVariable int contractorId){
        try {    
            contractorRepository.deleteById(contractorId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }



    
}

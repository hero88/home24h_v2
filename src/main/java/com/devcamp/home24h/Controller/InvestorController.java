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

import com.devcamp.home24h.Repository.InvestorRepository;
import com.devcamp.home24h.Service.InvestorService;
import com.devcamp.home24h.model.Investor;

@RestController
@CrossOrigin
public class InvestorController {

    @Autowired
    InvestorRepository investorRepository;

    @Autowired
    InvestorService investorService;


    //Lấy Danh sách tất cả investor
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/investor/get/all")
    public List<Investor> getAllInvestor(){
        return investorRepository.findAll();
    }


    //Lây danh sách Investor có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/investor/get/allInvestor")
    public ResponseEntity<Page<Investor>> getAllInvestorPagination(@RequestParam String name, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<Investor> investorByName = investorService.findInvestorByKeyName(name);
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, investorByName.size());
            Page<Investor> InvestorByNamePagination = new PageImpl<>(investorByName.subList(start, end), paging, investorByName.size());
            
            return ResponseEntity.ok(InvestorByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy thông tin Investor theo Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/investor/get/{investorId}")
    public ResponseEntity<Investor> getInvestorById(@PathVariable int investorId){
        try {
            Investor investorById = investorRepository.findById(investorId).get();
            return ResponseEntity.ok(investorById);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Tạo Investor trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/investor/post")
    public ResponseEntity<Object> createContactor(@RequestBody Investor investor){
        try {  
            if(investorRepository.findByName(investor.getName()) != null){
                return ResponseEntity.badRequest().body("Tên Chủ đàu tư này đã tồn tại");
            }         
            return ResponseEntity.status(HttpStatus.CREATED).body(investorRepository.save(investor));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Cập nhật Investor trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/investor/put/{investorId}")
    public ResponseEntity<Object> updateInvestor(@RequestBody Investor newInvestor, @PathVariable int investorId){
        try {
            if(investorRepository.findByName(newInvestor.getName()) != null && investorRepository.findByName(newInvestor.getName()).getId() != investorId ){
                return ResponseEntity.badRequest().body("Tên Chủ đầu tư này đã tồn tại");
            }         
            
             
            Investor investorUpdate = investorRepository.findById(investorId).get();
            BeanUtils.copyProperties(newInvestor, investorUpdate, "id");
            investorRepository.save(investorUpdate);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(investorUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    //Xóa Investor By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/investor/delete/{investorId}")
    public ResponseEntity<Object> deleteInvestor(@PathVariable int investorId){
        try {    
            investorRepository.deleteById(investorId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    
}

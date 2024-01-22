package com.devcamp.home24h.Controller;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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

import com.devcamp.home24h.Repository.UtilitiesRepository;
import com.devcamp.home24h.Service.UtilitiesService;
import com.devcamp.home24h.model.Utilities;

@RestController
@CrossOrigin
public class UitiliesController {
    @Autowired
    UtilitiesRepository utilitiesRepository;

    @Autowired
    UtilitiesService utilitiesService;


    //Lấy Danh sách tất cả Utilities
    //@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/utilities/get/all")
    public List<Utilities> getAllUtilities(){
        return utilitiesRepository.findAll();
    }



    //Gọi các utilies dựa trên danh sách Id yêu cầu
    @GetMapping("utilities/get/listUitilitiesById")
    public ResponseEntity<List<Utilities>> getListUtilities(@RequestParam String paramUtilitiesStr) {
        try {
            String[] arrIdUtilitiesStr = paramUtilitiesStr.split(",");
            List<Utilities> allUtilies = utilitiesRepository.findAll();

            List<Utilities> utilitiesFound = allUtilies.stream()
                    .filter(u -> Arrays.stream(arrIdUtilitiesStr)
                            .anyMatch(id -> String.valueOf(u.getId()).equals(id)))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(utilitiesFound);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Lây danh sách Utilities có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/utilities/get/allUtilities")
    public ResponseEntity<Page<Utilities>> getAllUtilitiesPagination(@RequestParam String name, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<Utilities> utilitiesByName = utilitiesService.findUtilitiesByKeyName(name);
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, utilitiesByName.size());
            Page<Utilities> utilitiesByNamePagination = new PageImpl<>(utilitiesByName.subList(start, end), paging, utilitiesByName.size());
            
            return ResponseEntity.ok(utilitiesByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy thông tin Utilities theo Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/utilities/get/{utilitiesId}")
    public ResponseEntity<Utilities> getUtilitiesById(@PathVariable int utilitiesId){
        try {
            Utilities utilitiesById = utilitiesRepository.findById(utilitiesId).get();
            return ResponseEntity.ok(utilitiesById);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Tạo Utilities trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/utilities/post")
    public ResponseEntity<Object> createContactor(@RequestBody Utilities utilities){
        try {  
            if(utilitiesRepository.findByName(utilities.getName()) != null){
                return ResponseEntity.badRequest().body("Tên Tiện Ích đã tồn tại");
            }         
            return ResponseEntity.status(HttpStatus.CREATED).body(utilitiesRepository.save(utilities));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Cập nhật Utilities trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/utilities/put/{utilitiesId}")
    public ResponseEntity<Object> updateUtilities(@RequestBody Utilities newUtilities, @PathVariable int utilitiesId){
        try {
            if(utilitiesRepository.findByName(newUtilities.getName()) != null && utilitiesRepository.findByName(newUtilities.getName()).getId() != utilitiesId ){
                return ResponseEntity.badRequest().body("Tên Tiện Ích đã tồn tại");
            }         
            
             
            Utilities utilitiesUpdate = utilitiesRepository.findById(utilitiesId).get();
            BeanUtils.copyProperties(newUtilities, utilitiesUpdate, "id");
            utilitiesRepository.save(utilitiesUpdate);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(utilitiesUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    //Xóa Utilities By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/utilities/delete/{utilitiesId}")
    public ResponseEntity<Object> deleteUtilities(@PathVariable int utilitiesId){
        try {    
            utilitiesRepository.deleteById(utilitiesId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    
}

package com.devcamp.home24h.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

import com.devcamp.home24h.Repository.DistrictRepository;
import com.devcamp.home24h.Repository.ProvinceRepository;
import com.devcamp.home24h.Repository.StreetRepository;
import com.devcamp.home24h.model.Street;
import com.devcamp.home24h.model.Ward;

@RestController
@CrossOrigin
public class StreetController {

    @Autowired
    StreetRepository streetRepository;

    @Autowired
    ProvinceRepository  provinceRepository;

    @Autowired
    DistrictRepository districtRepository;

    //Gọi Danh sách Street bởi wardId
    @GetMapping("street/get/{provinceId}/{districtId}")
    public ResponseEntity<List<Street>> getStreetByProvinecIdAndDistrictId(@PathVariable int provinceId, @PathVariable int districtId){
        try {
          List<Street> streetByProvinceIdAnDistrictId = streetRepository.findByProvinceIdAndDistrictId(provinceId, districtId);
          return ResponseEntity.ok(streetByProvinceIdAnDistrictId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Gọi danh sách Street bởi Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/street/get/streetById/{streetId}")
    public ResponseEntity<Street> getStreetById(@PathVariable int streetId){
        try {
          return ResponseEntity.ok(streetRepository.findById(streetId).get());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Lây danh sách Street có phân trang theo Search
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/street/get/allDetailStreet")
    public ResponseEntity<Page<Street>> getAllWardPagination(
            @RequestParam int provinceId,
            @RequestParam int districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            
            List<Street> allStreet = streetRepository.findAll();
            List<Street> streetFound = new ArrayList<>();
            if(provinceId == 0 && districtId == 0){
                streetFound = allStreet;
            } else if(provinceId != 0 && districtId == 0) {
                streetFound = allStreet.stream().filter(w -> ( w.getProvince().getId() == provinceId)).collect(Collectors.toList());

            } else if(provinceId != 0 && districtId != 0) {
                streetFound = allStreet.stream().filter(w -> ( w.getProvince().getId() == provinceId)
                        && ( w.getDistrict().getId() == districtId)).collect(Collectors.toList());
            }
            
            int start = page * size;
            int end = Math.min(start + size, streetFound.size());
            Pageable paging = PageRequest.of(page, size);
            List<Street> subList = streetFound.subList(start, end);
            Page<Street> streetPagination = new PageImpl<>(subList, paging, streetFound.size());

            return ResponseEntity.ok(streetPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }  
    }

    //Xóa Ward By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/street/delete/{streetId}")
    public ResponseEntity<Object> deleteStreet(@PathVariable int streetId){
        try {    
            streetRepository.deleteById(streetId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Tạo Street
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("street/post/{provinceId}/{districtId}")
    public ResponseEntity<Object> createWard(@PathVariable int provinceId, @PathVariable int districtId, @RequestBody Street street){
        try {

            street.setProvince(provinceRepository.findById(provinceId).get());
            street.setDistrict(districtRepository.findById(districtId).get());
            return ResponseEntity.status(HttpStatus.CREATED).body(streetRepository.save(street));            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Cập nhật Street
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/street/put/{streetId}/{districtId}/{provinceId}")
    public ResponseEntity<Object> updateWardtById(@PathVariable int districtId, @RequestBody Ward streetUpdate, @PathVariable int provinceId, @PathVariable int streetId){
        try {
            
            Street street = streetRepository.findById(streetId).get();
            street.setName(streetUpdate.getName());
            street.setPrefix(streetUpdate.getPrefix());
            street.setProvince(provinceRepository.findById(provinceId).get());
            street.setDistrict(districtRepository.findById(districtId).get());

            
            return ResponseEntity.ok(streetRepository.save(street));            
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }





    
}

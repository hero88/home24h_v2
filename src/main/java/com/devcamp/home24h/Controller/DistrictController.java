package com.devcamp.home24h.Controller;

import java.util.Comparator;
import java.util.List;

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
import com.devcamp.home24h.Service.DistrictService;
import com.devcamp.home24h.model.District;
import com.devcamp.home24h.model.ESort;


@RestController
@CrossOrigin
public class DistrictController {


    @Autowired
    DistrictRepository districtRepository;

    @Autowired
    DistrictService districtService;

    @Autowired
    ProvinceRepository provinceRepository;

    //Gọi danh sách district bởi provinceId
    @GetMapping("/district/get/{provinceId}")
    public ResponseEntity<List<District>> getDistrictByProvinceId(@PathVariable int provinceId){
        try {
          List<District> districtByProvinceId = districtRepository.findByProvinceId(provinceId);
          for(District district: districtByProvinceId){
            district.setProjects(null);
            district.setRealestates(null);
          } 
          return ResponseEntity.ok(districtByProvinceId);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Gọi danh sách district bởi Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/district/get/districtById/{districtId}")
    public ResponseEntity<District> getDistrictById(@PathVariable int districtId){
        try {
          return ResponseEntity.ok(districtRepository.findById(districtId).get());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    //Lây danh sách Province có phân trang theo Search
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/district/get/allDetailDistrict")
    public ResponseEntity<Page<District>> getAllDistrictPagination(
            @RequestParam String name,
            @RequestParam String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            
            List<District> districtByName = name.equals("") ? districtRepository.findAll(): districtService.findDistrictByKeyName(name);
            ESort sortEnum = null;
            
            try {
                sortEnum = ESort.valueOf(sort);
            } catch (IllegalArgumentException e) {
                // Xử lý khi giá trị sort không hợp lệ
            }

            if (sortEnum != null) {
                switch (sortEnum) {
                    case PROJECT_AZ:
                        districtByName.sort(Comparator.comparing(District::getTotalProject));
                        break;
                    case PROJECT_ZA:
                        districtByName.sort(Comparator.comparing(District::getTotalProject).reversed());
                        break;
                    case REALESTATES_AZ:
                        districtByName.sort(Comparator.comparing(District::getTotalRealestates));
                        break;
                    case REALESTATES_ZA:
                        districtByName.sort(Comparator.comparing(District::getTotalRealestates).reversed());
                        break;
                    default:
                        break;
                }
            }

            int start = page * size;
            int end = Math.min(start + size, districtByName.size());
            Pageable paging = PageRequest.of(page, size);
            List<District> subList = districtByName.subList(start, end);
            Page<District> districtByNamePagination = new PageImpl<>(subList, paging, districtByName.size());

            return ResponseEntity.ok(districtByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }  
    }

    //Tạo District
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("district/post/{provinceId}")
    public ResponseEntity<Object> createDistrict(@PathVariable int provinceId, @RequestBody District district){
        try {
            if(districtRepository.findByName(district.getName()) != null){
                return ResponseEntity.badRequest().body("Tên Quận/Huyện này đã tồn tại");
            }

            district.setProvince(provinceRepository.findById(provinceId).get());
            return ResponseEntity.status(HttpStatus.CREATED).body(districtRepository.save(district));

            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Cập nhật District
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/district/put/{districtId}/{provinceId}")
    public ResponseEntity<Object> updateDistrictById(@PathVariable int districtId, @RequestBody District districtUpdate, @PathVariable int provinceId){
        try {
            if(districtRepository.findByName(districtUpdate.getName()) != null && districtRepository.findByName(districtUpdate.getName()).getId() != districtId ){
                return ResponseEntity.badRequest().body("Tên Quận/Huyện này đã tồn tại");
            }
            
            District district = districtRepository.findById(districtId).get();
            district.setPrefix(districtUpdate.getPrefix());
            district.setName(districtUpdate.getName());
            district.setProvince(provinceRepository.findById(provinceId).get());
            
            return ResponseEntity.ok(districtRepository.save(district));            
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Xóa Province By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/district/delete/{districtId}")
    public ResponseEntity<Object> deleteDistrict(@PathVariable int districtId){
        try {    
            districtRepository.deleteById(districtId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    
}

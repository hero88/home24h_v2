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

import com.devcamp.home24h.Repository.ProvinceRepository;
import com.devcamp.home24h.Service.ProvinceService;
import com.devcamp.home24h.model.ESort;
import com.devcamp.home24h.model.Province;

@RestController
@CrossOrigin
public class ProvinceController {

    @Autowired
    ProvinceRepository provinceRepository;

    @Autowired
    ProvinceService provinceService;

    //Lấy tất cả province
    @GetMapping("/province/get/allProvince")
    public ResponseEntity<List<Province>> getAllProvince(){
        try {
            List<Province> provinces = provinceRepository.findAll();
            for (Province province : provinces) {
                province.setProjects(null);
                province.setRealestates(null);
            }
            return ResponseEntity.ok(provinces);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lấy Province by Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/province/get/{provinceId}")
    public ResponseEntity<Province> getProvinceById(@PathVariable int provinceId){
        try {
            Province provinceById = provinceRepository.findById(provinceId).get();
            return ResponseEntity.ok(provinceById);
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lây danh sách Province có phân trang theo Search
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/province/get/allDetailProvince")
    public ResponseEntity<Page<Province>> getAllProvincePagination(
            @RequestParam String name,
            @RequestParam String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            
            List<Province> provinceByName = name.equals("") ? provinceRepository.findAll(): provinceService.findProvinceByKeyName(name);
            ESort sortEnum = null;
            
            try {
                sortEnum = ESort.valueOf(sort);
            } catch (IllegalArgumentException e) {
                // Xử lý khi giá trị sort không hợp lệ
            }

            if (sortEnum != null) {
                switch (sortEnum) {
                    case PROJECT_AZ:
                        provinceByName.sort(Comparator.comparing(Province::getTotalProject));
                        break;
                    case PROJECT_ZA:
                        provinceByName.sort(Comparator.comparing(Province::getTotalProject).reversed());
                        break;
                    case REALESTATES_AZ:
                        provinceByName.sort(Comparator.comparing(Province::getTotalRealestates));
                        break;
                    case REALESTATES_ZA:
                        provinceByName.sort(Comparator.comparing(Province::getTotalRealestates).reversed());
                        break;
                    default:
                        break;
                }
            }

            int start = page * size;
            int end = Math.min(start + size, provinceByName.size());
            Pageable paging = PageRequest.of(page, size);
            List<Province> subList = provinceByName.subList(start, end);
            Page<Province> provinceByNamePagination = new PageImpl<>(subList, paging, provinceByName.size());

            return ResponseEntity.ok(provinceByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }  
    }
    

    //Tạo Province
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/province/post")
    public ResponseEntity<Object> createProvince(@RequestBody Province province){
        try {
            if(provinceRepository.findByName(province.getName()) != null){
                return ResponseEntity.badRequest().body("Tên Tỉnh Thành này đã tồn tại");
            }
            if(provinceRepository.findByCode(province.getCode()) != null){
                return ResponseEntity.badRequest().body("Mã Tỉnh Thành này đã tồn tại");
            }         
       
            return ResponseEntity.status(HttpStatus.CREATED).body(provinceRepository.save(province));
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Cập nhật Province
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/province/put/{provinceId}")
    public ResponseEntity<Object> updateProvinceById(@PathVariable int provinceId, @RequestBody Province provinceUpdate){
        try {
            if(provinceRepository.findByName(provinceUpdate.getName()) != null && provinceRepository.findByName(provinceUpdate.getName()).getId() != provinceId ){
                return ResponseEntity.badRequest().body("Tên Tỉnh Thành này đã tồn tại");
            }
            
            if(provinceRepository.findByCode(provinceUpdate.getCode()) != null && provinceRepository.findByCode(provinceUpdate.getCode()).getId() != provinceId ){
                return ResponseEntity.badRequest().body("Mã Tỉnh Thành này đã tồn tại");
            }

            Province province = provinceRepository.findById(provinceId).get();
            province.setCode(provinceUpdate.getCode());
            province.setName(provinceUpdate.getName());
            
            return ResponseEntity.ok(provinceRepository.save(province));            
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Xóa Province By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/province/delete/{provinceId}")
    public ResponseEntity<Object> deleteProvince(@PathVariable int provinceId){
        try {    
            provinceRepository.deleteById(provinceId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }



}

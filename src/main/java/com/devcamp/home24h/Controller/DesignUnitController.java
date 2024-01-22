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

import com.devcamp.home24h.Repository.DesignUnitRepository;
import com.devcamp.home24h.Service.DesignUnitService;
import com.devcamp.home24h.model.DesignUnit;

@RestController
@CrossOrigin
public class DesignUnitController {


    @Autowired
    DesignUnitRepository designUnitRepository;

    @Autowired
    DesignUnitService designUnitService;

    //Lấy Danh sách tất cả designUnit
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/designUnit/get/all")
    public List<DesignUnit> getAllDesignUnit(){
        return designUnitRepository.findAll();
    }





    //Lây danh sách DesignUnit có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/designUnit/get/allDesignUnit")
    public ResponseEntity<Page<DesignUnit>> getAllDesignUnitPagination(@RequestParam String name, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<DesignUnit> designUnitByName = designUnitService.findDesignUnitByKeyName(name);
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, designUnitByName.size());
            Page<DesignUnit> designUnitByNamePagination = new PageImpl<>(designUnitByName.subList(start, end), paging, designUnitByName.size());
            
            return ResponseEntity.ok(designUnitByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy thông tin DesignUnit theo Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/designUnit/get/{designUnitId}")
    public ResponseEntity<DesignUnit> getDesignUnitById(@PathVariable int designUnitId){
        try {
            DesignUnit designUnitById = designUnitRepository.findById(designUnitId).get();
            return ResponseEntity.ok(designUnitById);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Tạo DesignUnit trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/designUnit/post")
    public ResponseEntity<Object> createContactor(@RequestBody DesignUnit designUnit){
        try {  
            if(designUnitRepository.findByName(designUnit.getName()) != null){
                return ResponseEntity.badRequest().body("Tên đơn vị thiết kế này đã tồn tại");
            }         
            return ResponseEntity.status(HttpStatus.CREATED).body(designUnitRepository.save(designUnit));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Cập nhật DesignUnit trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/designUnit/put/{designUnitId}")
    public ResponseEntity<Object> updateDesignUnit(@RequestBody DesignUnit newDesignUnit, @PathVariable int designUnitId){
        try {
            if(designUnitRepository.findByName(newDesignUnit.getName()) != null && designUnitRepository.findByName(newDesignUnit.getName()).getId() != designUnitId ){
                return ResponseEntity.badRequest().body("Tên đơn vị thiết kế này đã tồn tại");
            }         
            
             
            DesignUnit designUnitUpdate = designUnitRepository.findById(designUnitId).get();
            BeanUtils.copyProperties(newDesignUnit, designUnitUpdate, "id");
            designUnitRepository.save(designUnitUpdate);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(designUnitUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    //Xóa DesignUnit By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/designUnit/delete/{designUnitId}")
    public ResponseEntity<Object> deleteDesignUnit(@PathVariable int designUnitId){
        try {    
            designUnitRepository.deleteById(designUnitId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    
}

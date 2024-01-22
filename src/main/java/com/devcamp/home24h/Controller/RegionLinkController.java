package com.devcamp.home24h.Controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.multipart.MultipartFile;

import com.devcamp.home24h.Repository.RegionLinkRepository;
import com.devcamp.home24h.Service.RegionLinkService;
import com.devcamp.home24h.Service.StorageFirebaseService;
import com.devcamp.home24h.model.Layout;
import com.devcamp.home24h.model.RegionLink;

@RestController
@CrossOrigin
public class RegionLinkController {

    @Autowired
    RegionLinkRepository regionLinkRepository;

    @Autowired
    RegionLinkService regionLinkService;

    @Autowired
    StorageFirebaseService storageFirebaseService;

    //Lấy Danh sách tất cả RegionLink
    //@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/regionLink/get/all")
    public List<RegionLink> getAllRegionLink(){
        return regionLinkRepository.findAll();
    }

    //Gọi các regionLink dựa trên danh sách Id yêu cầu
    @GetMapping("regionLink/get/listRegionLinkById")
    public ResponseEntity<List<RegionLink>> getListRegionLink(@RequestParam String paramRegionLinkId) {
        try {
            String[] arrIdRegionLinkStr = paramRegionLinkId.split(",");
            List<RegionLink> allRegionLink = regionLinkRepository.findAll();

            List<RegionLink> regionLinkFound = allRegionLink.stream()
                    .filter(u -> Arrays.stream(arrIdRegionLinkStr)
                            .anyMatch(id -> String.valueOf(u.getId()).equals(id)))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(regionLinkFound);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    //Lây danh sách RegionLink có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/regionLink/get/allRegionLink")
    public ResponseEntity<Page<RegionLink>> getAllRegionLinkPagination(@RequestParam String name, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<RegionLink> regionLinkByName = regionLinkService.findRegionLinkByKeyName(name);
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, regionLinkByName.size());
            Page<RegionLink> regionLinkByNamePagination = new PageImpl<>(regionLinkByName.subList(start, end), paging, regionLinkByName.size());
            
            return ResponseEntity.ok(regionLinkByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy thông tin RegionLink theo Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/regionLink/get/{regionLinkId}")
    public ResponseEntity<RegionLink> getRegionLinkById(@PathVariable int regionLinkId){
        try {
            RegionLink regionLinkById = regionLinkRepository.findById(regionLinkId).get();
            return ResponseEntity.ok(regionLinkById);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Tạo RegionLink trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/regionLink/post")
    public ResponseEntity<Object> createContactor(@RequestParam Map<String, String> regionLinkMap, @RequestParam(required = false) MultipartFile imageCreate){
        try {  
            if(regionLinkRepository.findByName(regionLinkMap.get("name")) != null){
                return ResponseEntity.badRequest().body("Tên Vùng này đã tồn tại");
            }
            
            RegionLink newRegionLink = new RegionLink();
            newRegionLink.setName(regionLinkMap.get("name"));
            newRegionLink.setDescription(regionLinkMap.get("description"));
            newRegionLink.setAddress(regionLinkMap.get("address"));
            
            if(imageCreate != null){
                String imageName = storageFirebaseService.uploadImage(imageCreate);
                newRegionLink.setPhoto(imageName);

            }
            return ResponseEntity.status(HttpStatus.CREATED).body(regionLinkRepository.save(newRegionLink));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Cập nhật RegionLink trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/regionLink/put/{regionLinkId}")
    public ResponseEntity<Object> updateRegionLink(
        @RequestParam Map<String, String> regionLinkMap, @RequestParam(required = false) MultipartFile imageCreate,
        @PathVariable int regionLinkId){
        try {
            if(regionLinkRepository.findByName(regionLinkMap.get("name")) != null && regionLinkRepository.findByName(regionLinkMap.get("name")).getId() != regionLinkId ){
                return ResponseEntity.badRequest().body("Tên Vùng này đã tồn tại");
            }         
            
             
            RegionLink regionLinkUpdate = regionLinkRepository.findById(regionLinkId).get();
            boolean isExists = regionLinkRepository.existsById(regionLinkId);
            if(isExists){
                regionLinkUpdate.setName(regionLinkMap.get("name"));
                regionLinkUpdate.setDescription(regionLinkMap.get("description"));
                regionLinkUpdate.setAddress(regionLinkMap.get("address"));

                
            
                //Xóa hình ảnh cũ
                if (regionLinkMap.containsKey("imgeNameStrOldRemove")) {
                    String[] imgRemoveArray = regionLinkMap.get("imgeNameStrOldRemove").split(",");
                    
                    // Duyệt qua mảng để xử lý từng giá trị
                    for (String imageName : imgRemoveArray) {
                        // Xử lý mỗi giá trị imageName ở đây
                        storageFirebaseService.deleteImage(imageName);
                    }
                }
             
                if(imageCreate != null){
                    String imageName = storageFirebaseService.uploadImage(imageCreate);
                    regionLinkUpdate.setPhoto(imageName);
                }
                  
            }
            regionLinkRepository.save(regionLinkUpdate);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(regionLinkUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    //Xóa RegionLink By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/regionLink/delete/{regionLinkId}")
    public ResponseEntity<Object> deleteRegionLink(@PathVariable int regionLinkId){
        try {    

            String photo = regionLinkRepository.findById(regionLinkId).get().getPhoto();
            if(photo != null){
                storageFirebaseService.deleteImage(photo);
            }

            regionLinkRepository.deleteById(regionLinkId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    
}

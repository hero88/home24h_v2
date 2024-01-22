package com.devcamp.home24h.Controller;

import java.util.List;
import java.util.Map;

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

import com.devcamp.home24h.Repository.LayoutRepository;
import com.devcamp.home24h.Repository.ProjectRepository;
import com.devcamp.home24h.Service.StorageFirebaseService;
import com.devcamp.home24h.model.Layout;

import org.springframework.web.multipart.MultipartFile;


@RestController
@CrossOrigin
public class LayoutController {

    @Autowired
    LayoutRepository layoutRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    StorageFirebaseService storageFirebaseService;


    //Tạo Layout trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/layout/post/{projectId}")
    public ResponseEntity<Object> createContactor(
        @RequestParam Map<String, String> layoutMap, @RequestParam(required = false) MultipartFile imageCreate,
        @PathVariable int projectId ){
        try {
            Layout newLayout = new Layout();
            newLayout.setName(layoutMap.get("name"));
            newLayout.setDescription(layoutMap.get("description"));
            newLayout.setProject(projectRepository.findById(projectId).get());
            
            if(imageCreate != null){
                String imageName = storageFirebaseService.uploadImage(imageCreate);
                newLayout.setPhoto(imageName);

            }
            return ResponseEntity.status(HttpStatus.CREATED).body(layoutRepository.save(newLayout));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    //Lấy Layout theo layoutId
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/layout/get/{layoutId}")
    public ResponseEntity<Layout> getLayoutId(@PathVariable int layoutId ){
        try {
            
            return ResponseEntity.ok(layoutRepository.findById(layoutId).get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    //Lây danh sách Layout có phân trang theo Project
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/layout/get/allLayout/{projectId}")
    public ResponseEntity<Page<Layout>> getAllLayoutPagination(@PathVariable int projectId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        try {
            boolean isProjectValid = projectRepository.existsById(projectId);

            List<Layout> layoutFound;
            if (isProjectValid) {
                layoutFound = layoutRepository.findByProjectId(projectId);
            } else {
                layoutFound = layoutRepository.findAll();
            }

            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, layoutFound.size());
            Page<Layout> layoutPagination = new PageImpl<>(layoutFound.subList(start, end), paging, layoutFound.size());

            return ResponseEntity.ok(layoutPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Xóa Layout By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/layout/delete/{layoutId}")
    public ResponseEntity<Object> deleteLayout(@PathVariable int layoutId){
        try {
            String photo = layoutRepository.findById(layoutId).get().getPhoto();
            if(photo != null){
                storageFirebaseService.deleteImage(photo);
            }

            layoutRepository.deleteById(layoutId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Cập nhật Layout trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/layout/put/{layoutId}/{projectId}")
    public ResponseEntity<Object> updateLayout(
        @RequestParam Map<String, String> layoutMap, @RequestParam(required = false) MultipartFile imageCreate,
        @PathVariable int projectId, @PathVariable int layoutId){
        
        try {
                         
            Layout layoutUpdate = layoutRepository.findById(layoutId).get();
            boolean isExists = projectRepository.existsById(projectId);
            if(isExists){
                layoutUpdate.setName(layoutMap.get("name"));
                layoutUpdate.setDescription(layoutMap.get("description"));
                layoutUpdate.setProject(projectRepository.findById(projectId).get());
            
                //Xóa hình ảnh cũ
                if (layoutMap.containsKey("imgeNameStrOldRemove")) {
                    String[] imgRemoveArray = layoutMap.get("imgeNameStrOldRemove").split(",");
                    
                    // Duyệt qua mảng để xử lý từng giá trị
                    for (String imageName : imgRemoveArray) {
                        // Xử lý mỗi giá trị imageName ở đây
                        storageFirebaseService.deleteImage(imageName);
                    }
                }
             
                if(imageCreate != null){
                    String imageName = storageFirebaseService.uploadImage(imageCreate);
                    layoutUpdate.setPhoto(imageName);
                }
                  
            }
            layoutRepository.save(layoutUpdate);
            
            return ResponseEntity.status(HttpStatus.OK).body(layoutUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }




    
}

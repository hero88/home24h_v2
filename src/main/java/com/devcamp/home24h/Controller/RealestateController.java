package com.devcamp.home24h.Controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devcamp.home24h.Repository.CustomerRepository;
import com.devcamp.home24h.Repository.DistrictRepository;
import com.devcamp.home24h.Repository.ProjectRepository;
import com.devcamp.home24h.Repository.ProvinceRepository;
import com.devcamp.home24h.Repository.RealestateRepository;
import com.devcamp.home24h.Repository.StreetRepository;
import com.devcamp.home24h.Repository.UserRepository;
import com.devcamp.home24h.Repository.WardRepository;
import com.devcamp.home24h.Service.StorageFirebaseImp;
import com.devcamp.home24h.Service.StorageFirebaseService;
import com.devcamp.home24h.model.Customer;
import com.devcamp.home24h.model.EStatus;
import com.devcamp.home24h.model.Realestate;
import com.devcamp.home24h.model.User;

@RestController
@CrossOrigin
public class RealestateController {

    @Autowired
    RealestateRepository realestateRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    ProvinceRepository provinceRepository;

    @Autowired
    DistrictRepository districtRepository;

    @Autowired
    WardRepository wardRepository;

    @Autowired
    StreetRepository streetRepository;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StorageFirebaseService storageFirebaseService;

    // Tạo Realestate ở WebUser
    @Transactional
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
    @PostMapping("/realestates/post/{provinceId}/{districtId}/{wardId}/{streetId}/{projectId}")
    public ResponseEntity<Object> createRealestate(
            @RequestParam Map<String, String> fileMap, @RequestParam(required = false) MultipartFile imageCreate, 
            @PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId,
            @PathVariable int streetId, @PathVariable int projectId) {
        try {
            if (realestateRepository.findByTitle(fileMap.get("title")) != null) {
                return ResponseEntity.badRequest().body("Error: Title exsit");
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            User currentUser = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);

            Realestate newRealestate = new Realestate();
            newRealestate.setUser(currentUser);
            newRealestate.setStatus(EStatus.PENDING_APPROVAL.getCode());     
            newRealestate.setProvince(provinceId == 0 ? null : provinceRepository.findById(provinceId).get());
            newRealestate.setDistrict(districtId == 0 ? null : districtRepository.findById(districtId).get());
            newRealestate.setWard(wardId == 0 ? null : wardRepository.findById(wardId).get());
            newRealestate.setStreet(streetId == 0 ? null : streetRepository.findById(streetId).get());
            newRealestate.setProject(projectId == 0 ? null : projectRepository.findById(projectId).get());
            newRealestate.setCreateDate(new Date());
            newRealestate.setUpdateDate(new Date());
            this.setUpRealestate(fileMap, newRealestate);
            if(!imageCreate.isEmpty()){
                String imageName = storageFirebaseService.uploadImage(imageCreate);
                newRealestate.setPhoto(imageName);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(realestateRepository.save(newRealestate));
        } catch (Exception e) {
            System.out.println("Lỗi ==>" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Tạo Realestate ở DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("/realestates/post/dashboard/{provinceId}/{districtId}/{wardId}/{streetId}/{projectId}/{customerId}")
    public ResponseEntity<Object> createRealestateInDashBoard(
            @RequestParam Map<String, String> fileMap, @RequestParam(required = false) MultipartFile imageCreate, 
            @PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId,
            @PathVariable int streetId, @PathVariable int projectId, @PathVariable int customerId) {
        try {
            if (realestateRepository.findByTitle(fileMap.get("title")) != null) {
                return ResponseEntity.badRequest().body("Tên tiêu đề dã tồn tại");
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            User currentUser = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);
            Realestate paramRealestate = new Realestate();
            paramRealestate.setUser(currentUser);
            paramRealestate.setCustomer(customerId == 0 ? null : customerRepository.findById(customerId).get());
            paramRealestate.setStatus(EStatus.APPROVAL.getCode());
            paramRealestate.setProvince(provinceId == 0 ? null : provinceRepository.findById(provinceId).get());
            paramRealestate.setDistrict(districtId == 0 ? null : districtRepository.findById(districtId).get());
            paramRealestate.setWard(wardId == 0 ? null : wardRepository.findById(wardId).get());
            paramRealestate.setStreet(streetId == 0 ? null : streetRepository.findById(streetId).get());
            paramRealestate.setProject(projectId == 0 ? null : projectRepository.findById(projectId).get());
            paramRealestate.setCreateDate(new Date());
            paramRealestate.setUpdateDate(new Date());
            this.setUpRealestate(fileMap, paramRealestate);
            if(!imageCreate.isEmpty()){
                String imageName = storageFirebaseService.uploadImage(imageCreate);
                paramRealestate.setPhoto(imageName);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(realestateRepository.save(paramRealestate));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Cập nhật Realestate ở WebUser
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
    @PutMapping("/realestates/put/{realestatesId}/{provinceId}/{districtId}/{wardId}/{streetId}/{projectId}")
    public ResponseEntity<Object> updateRealestate(@PathVariable int realestatesId,
            @RequestParam Map<String, String> fileMap, @RequestParam(required = false) MultipartFile imageCreate, 
            @PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId,
            @PathVariable int streetId, @PathVariable int projectId
            ) {
        try {
            if (realestateRepository.findByTitle(fileMap.get("title")) != null
                    && realestateRepository.findByTitle(fileMap.get("title")).getId() != realestatesId) {
                return ResponseEntity.badRequest().body("Error: Title exsit");
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            Realestate updateRealestates = realestateRepository.findById(realestatesId).get();
            User user = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);

            if (!updateRealestates.getUser().equals(user)) {
                return ResponseEntity.badRequest().body("Error: You don't have permission to update this realestates");
            }

            updateRealestates.setStatus(EStatus.PENDING_APPROVAL.getCode());
            updateRealestates.setProvince(provinceId == 0 ? null : provinceRepository.findById(provinceId).get());
            updateRealestates.setDistrict(districtId == 0 ? null : districtRepository.findById(districtId).get());
            updateRealestates.setWard(wardId == 0 ? null : wardRepository.findById(wardId).get());
            updateRealestates.setStreet(streetId == 0 ? null : streetRepository.findById(streetId).get());
            updateRealestates.setProject(projectId == 0 ? null : projectRepository.findById(projectId).get());
            updateRealestates.setUpdateDate(new Date());
            this.setUpRealestate(fileMap, updateRealestates);
            
             //Xóa hình ảnh cũ
             if (fileMap.containsKey("imgeNameStrOldRemove")) {
                String[] imgRemoveArray = fileMap.get("imgeNameStrOldRemove").split(",");
                
                // Duyệt qua mảng để xử lý từng giá trị
                for (String imageName : imgRemoveArray) {
                    // Xử lý mỗi giá trị imageName ở đây
                    storageFirebaseService.deleteImage(imageName);
                }
            }
             
            if(imageCreate != null){
                String imageName = storageFirebaseService.uploadImage(imageCreate);
                updateRealestates.setPhoto(imageName);
            }

            return ResponseEntity.status(HttpStatus.OK).body(realestateRepository.save(updateRealestates));
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Cập nhật Realestate ở DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/realestates/put/dashboard/{realestatesId}/{provinceId}/{districtId}/{wardId}/{streetId}/{projectId}/{customerId}")
    public ResponseEntity<Object> updateRealestateInDashBoard(@PathVariable int realestatesId,
            @RequestParam Map<String, String> fileMap, @RequestParam(required = false) MultipartFile imageCreate,
            @PathVariable int provinceId, @PathVariable int districtId,
            @PathVariable int wardId, @PathVariable int streetId, @PathVariable int projectId, @PathVariable int customerId) {
        try {
            if (realestateRepository.findByTitle(fileMap.get("title")) != null
                    && realestateRepository.findByTitle(fileMap.get("title")).getId() != realestatesId) {
                return ResponseEntity.badRequest().body("Error: Title exsit");
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Realestate updateRealestates = realestateRepository.findById(realestatesId).get();
            User user = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);

            updateRealestates.setCustomer(customerId == 0 ? null : customerRepository.findById(customerId).get());
            updateRealestates.setProvince(provinceId == 0 ? null : provinceRepository.findById(provinceId).get());
            updateRealestates.setDistrict(districtId == 0 ? null : districtRepository.findById(districtId).get());
            updateRealestates.setWard(wardId == 0 ? null : wardRepository.findById(wardId).get());
            updateRealestates.setStreet(streetId == 0 ? null : streetRepository.findById(streetId).get());
            updateRealestates.setProject(projectId == 0 ? null : projectRepository.findById(projectId).get());
            updateRealestates.setUpdateDate(new Date());
            this.setUpRealestate(fileMap, updateRealestates);

            //Xóa hình ảnh cũ
            if (fileMap.containsKey("imgeNameStrOldRemove")) {
                String[] imgRemoveArray = fileMap.get("imgeNameStrOldRemove").split(",");
                
                // Duyệt qua mảng để xử lý từng giá trị
                for (String imageName : imgRemoveArray) {
                    // Xử lý mỗi giá trị imageName ở đây
                    storageFirebaseService.deleteImage(imageName);
                }
            }
             
            if(imageCreate != null){
                String imageName = storageFirebaseService.uploadImage(imageCreate);
                updateRealestates.setPhoto(imageName);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(realestateRepository.save(updateRealestates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Cập nhật status theo Id realestates
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/realestates/update/{status}/{realestatesId}")
    public ResponseEntity<Object> updateStatusRealestates(@PathVariable int status, @PathVariable int realestatesId) {
        try {
            return ResponseEntity.ok(realestateRepository.updateStatus(status, realestatesId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Search Realestates theo điều kiện ở DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/relestates/get/search")
    public ResponseEntity<Page<Realestate>> getRealestateByCondition(
            @RequestParam int statusId, @RequestParam int requestId, @RequestParam int typeId,
            @RequestParam int provinceId, @RequestParam int districtId, @RequestParam int wardId,
            @RequestParam(required = false) Long minPrice, @RequestParam(required = false) Long maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<Realestate> allRealestates = realestateRepository.findAll();
            List<Realestate> realestatesResult = allRealestates.stream().filter(
                    r -> (statusId == 0 || r.getStatus() == statusId) && (requestId == 0 || r.getRequest() == requestId)
                            && (typeId == 0 || r.getType() == typeId)
                            && (!provinceRepository.findById(provinceId).isPresent()
                                    || r.getProvince().getId() == provinceId)
                            && (!districtRepository.findById(districtId).isPresent()
                                    || r.getDistrict().getId() == districtId)
                            && (wardRepository.findById(wardId).isPresent() == false || r.getWard().getId() == wardId)
                            && (minPrice == null || r.getPrice() >= minPrice)
                            && (maxPrice == null || r.getPrice() <= maxPrice))
                    .sorted(Comparator.comparing(Realestate::getUpdateDate).reversed()).collect(Collectors.toList());

            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, realestatesResult.size());
            Page<Realestate> realestatesPagination = new PageImpl<>(realestatesResult.subList(start, end), paging,
                    realestatesResult.size());

            return ResponseEntity.ok(realestatesPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Search Realestates theo điều kiện ở User Page
    @GetMapping("/relestates/get/searchUserPage")
    public ResponseEntity<Page<Realestate>> getRealestateByConditionFromUserPage(
            @RequestParam int requestId, @RequestParam int typeId,
            @RequestParam int provinceId, @RequestParam int districtId, @RequestParam int wardId,
            @RequestParam(required = false) Long minPrice, @RequestParam(required = false) Long maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<Realestate> allRealestates = realestateRepository.findAll();
            List<Realestate> realestatesResult = allRealestates.stream().filter(
                    r -> (r.getStatus() == EStatus.APPROVAL.getCode())
                            && (requestId == 0 || r.getRequest() == requestId)
                            && (typeId == 0 || r.getType() == typeId)
                            && (!provinceRepository.findById(provinceId).isPresent()
                                    || r.getProvince().getId() == provinceId)
                            && (!districtRepository.findById(districtId).isPresent()
                                    || r.getDistrict().getId() == districtId)
                            && (wardRepository.findById(wardId).isPresent() == false || r.getWard().getId() == wardId)
                            && (minPrice == null || r.getPrice() >= minPrice)
                            && (maxPrice == null || r.getPrice() <= maxPrice))
                    .sorted(Comparator.comparing(Realestate::getUpdateDate).reversed()).collect(Collectors.toList());

            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, realestatesResult.size());
            Page<Realestate> realestatesPagination = new PageImpl<>(realestatesResult.subList(start, end), paging,
                    realestatesResult.size());

            return ResponseEntity.ok(realestatesPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Lấy Realestates theo status và request có số lượng của Web User
    @GetMapping("/realestates/get/requestFromUserPage")
    public ResponseEntity<List<Realestate>> getRealestatesByStatusAndRequest(
            @RequestParam(required = false) Integer requestId, @RequestParam(defaultValue = "6") int size) {
        try {
            List<Realestate> allRealestates = realestateRepository.findAll();
            List<Realestate> realestatesResult = allRealestates.stream()
                    .filter(r -> (r.getStatus() == EStatus.APPROVAL.getCode())
                            && (requestId == null || r.getRequest() == requestId))
                    .sorted(Comparator.comparing(Realestate::getUpdateDate).reversed()).collect(Collectors.toList());
            int start = 0;
            int end = Math.min(size, realestatesResult.size());
            return ResponseEntity.ok(realestatesResult.subList(start, end));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Lấy thông tin Realestates theo Id
    // Nếu không có quyền admin và mod, thì chỉ được truy cập các id realestates có
    // status approval và của chính mình
    @GetMapping("/realestates/get/realestatesUser/{realestatesId}")
    public ResponseEntity<Object> getRealestatesByIdAndStatus(@PathVariable int realestatesId) {
        try {
            Realestate realestateFind = realestateRepository.findById(realestatesId).orElse(null);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            boolean isAdminOrModerator = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")
                            || auth.getAuthority().equals("ROLE_MODERATOR"));

            User user = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);

            if (!isAdminOrModerator) {
                if (realestateFind == null) {
                    return ResponseEntity.badRequest().body("Error: Realestates don't exsit");
                }

                if (realestateFind.getStatus() != EStatus.APPROVAL.getCode()
                        && !realestateFind.getUser().equals(user)) {
                    return ResponseEntity.badRequest().body("Error: you do not have access");
                }
            }

            return ResponseEntity.ok(realestateFind);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Lấy Realestates theo user
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
    @GetMapping("/realestates/get/realestatesByUserId")
    public ResponseEntity<Page<Realestate>> getRealestatesByUserId(
            @RequestParam(defaultValue = "approval") String status, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "2") int size) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);
            List<Realestate> realestatesUser = user.getRealestates();
            List<Realestate> realestatesByStatus = new ArrayList<>();
            if (status.equals("approval")) {
                realestatesByStatus = realestatesUser.stream().filter(r -> r.getStatus() == EStatus.APPROVAL.getCode())
                        .sorted(Comparator.comparing(Realestate::getUpdateDate).reversed())
                        .collect(Collectors.toList());
            }
            ;

            if (status.equals("pendingApproval")) {
                realestatesByStatus = realestatesUser.stream()
                        .filter(r -> r.getStatus() == EStatus.PENDING_APPROVAL.getCode())
                        .sorted(Comparator.comparing(Realestate::getUpdateDate).reversed())
                        .collect(Collectors.toList());
            }

            if (status.equals("pendingDelete")) {
                realestatesByStatus = realestatesUser.stream()
                        .filter(r -> r.getStatus() == EStatus.PENDING_DELETE.getCode())
                        .sorted(Comparator.comparing(Realestate::getUpdateDate).reversed())
                        .collect(Collectors.toList());
            }

            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, realestatesByStatus.size());

            Page<Realestate> realestatesFound = new PageImpl<>(realestatesByStatus.subList(start, end), paging,
                    realestatesByStatus.size());
            return ResponseEntity.ok(realestatesFound);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Xóa Realestates by Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/realestates/delete/{realestatesId}")
    public ResponseEntity<Object> deleteRealestates(@PathVariable int realestatesId) {
        try {
            Realestate realestateFind = realestateRepository.findById(realestatesId).get();
            String photo = realestateFind.getPhoto();
            if(photo != null){
                storageFirebaseService.deleteImage(photo);
            }
            realestateRepository.deleteById(realestatesId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Xóa Realestates by Id trên Web User
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
    @PutMapping("/realestates/deleteOnUser/{realestatesId}")
    public ResponseEntity<Object> deleteRealestatesOnUser(@PathVariable int realestatesId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = userRepository.findByUsername(authentication != null ? authentication.getName() : "")
                    .orElse(null);
            if (!realestateRepository.findById(realestatesId).get().getUser().equals(user)) {
                return ResponseEntity.badRequest().body("Error: You don't have the right to delete this Realestates");
            }
            realestateRepository.updateStatus(EStatus.PENDING_DELETE.getCode(), realestatesId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    private void setUpRealestate(Map<String, String> paramMap, Realestate paramRealestate){
        try {
       
        paramRealestate.setTitle(paramMap.get("title"));
        paramRealestate.setAddress(paramMap.get("address"));
        paramRealestate.setType(Integer.parseInt(paramMap.get("type")));
        paramRealestate.setRequest(Integer.parseInt(paramMap.get("request")));
        paramRealestate.setAcreage(new BigDecimal (paramMap.get("acreage")));
        paramRealestate.setPrice(Long.parseLong(paramMap.get("price")));
        paramRealestate.setLongX(new BigDecimal (paramMap.get("longX")));
        paramRealestate.setWidthY(new BigDecimal (paramMap.get("widthY")));
        paramRealestate.setBedRoom(Integer.parseInt(paramMap.get("bedRoom")));
        paramRealestate.setBathRoom(Integer.parseInt(paramMap.get("bathRoom")));
        paramRealestate.setDirection(Integer.parseInt(paramMap.get("direction")));
        paramRealestate.setApartCode(paramMap.get("apartCode"));
        paramRealestate.setDescription(paramMap.get("description"));
        paramRealestate.setAdjacentFacadeNum(Integer.parseInt(paramMap.get("adjacentFacadeNum")));
        paramRealestate.setNumberFloors(Integer.parseInt(paramMap.get("numberFloors")));
        paramRealestate.setTotalFloors(Integer.parseInt(paramMap.get("totalFloors")));
        paramRealestate.setWallArea(new BigDecimal (paramMap.get("wallArea")));
        paramRealestate.setStructure(paramMap.get("structure"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        

    }
    

}

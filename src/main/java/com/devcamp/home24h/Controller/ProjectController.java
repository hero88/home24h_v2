package com.devcamp.home24h.Controller;

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

import com.devcamp.home24h.Repository.ContractorRepository;
import com.devcamp.home24h.Repository.DesignUnitRepository;
import com.devcamp.home24h.Repository.DistrictRepository;
import com.devcamp.home24h.Repository.InvestorRepository;
import com.devcamp.home24h.Repository.ProjectRepository;
import com.devcamp.home24h.Repository.ProvinceRepository;
import com.devcamp.home24h.Repository.StreetRepository;
import com.devcamp.home24h.Repository.WardRepository;
import com.devcamp.home24h.Service.ProjectService;
import com.devcamp.home24h.model.Project;

@RestController
@CrossOrigin
public class ProjectController {

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    ProjectService projectService;

    @Autowired 
    ProvinceRepository provinceRepository;

    @Autowired
    DistrictRepository districtRepository;

    @Autowired 
    WardRepository wardRepository;

    @Autowired
    StreetRepository streetRepository;

    @Autowired
    InvestorRepository investorRepository;

    @Autowired
    ContractorRepository contractorRepository;

    @Autowired
    DesignUnitRepository designUnitRepository;

    //Tạo Project
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("project/post/{provinceId}/{districtId}/{wardId}/{streetId}/{investorId}/{contractorId}/{designUnitId}")
    public ResponseEntity<Object> createProject(@PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId, @PathVariable int streetId, @PathVariable int investorId, @PathVariable int contractorId, @PathVariable int designUnitId, @RequestBody Project project){
        try {
            if(projectRepository.findByName(project.getName()) != null){
                return ResponseEntity.badRequest().body("Tên dự án này đã tồn tại");
            }
            
            project.setProvince(provinceRepository.findById(provinceId).get());
            project.setDistrict(districtRepository.findById(districtId).get());
            project.setWard(wardRepository.findById(wardId).get());
            project.setStreet(streetRepository.findById(streetId).get());
            project.setInvestor(investorId == 0 ? null : investorRepository.findById(investorId).get());
            project.setContractor(contractorId == 0 ? null : contractorRepository.findById(contractorId).get());
            project.setDesignUnit(designUnitId == 0 ? null : designUnitRepository.findById(designUnitId).get());
            return ResponseEntity.status(HttpStatus.CREATED).body(projectRepository.save(project));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Cập nhật Project trên DashBoard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/project/put/{projectId}/{provinceId}/{districtId}/{wardId}/{streetId}/{investorId}/{contractorId}/{designUnitId}")
    public ResponseEntity<Object> updateProject(@RequestBody Project newProject, @PathVariable int projectId,
    @PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId, @PathVariable int streetId, @PathVariable int investorId, @PathVariable int contractorId, @PathVariable int designUnitId){
        try {
            if(projectRepository.findByName(newProject.getName()) != null && projectRepository.findByName(newProject.getName()).getId() != projectId ){
                return ResponseEntity.badRequest().body("Tên đơn vị thiết kế này đã tồn tại");
            }         
            
             
            Project projectUpdate = projectRepository.findById(projectId).get();
            BeanUtils.copyProperties(newProject, projectUpdate, "id");
            projectUpdate.setProvince(provinceRepository.findById(provinceId).get());
            projectUpdate.setDistrict(districtRepository.findById(districtId).get());
            projectUpdate.setWard(wardRepository.findById(wardId).get());
            projectUpdate.setStreet(streetRepository.findById(streetId).get());
            projectUpdate.setInvestor(investorId == 0 ? null : investorRepository.findById(investorId).get());
            projectUpdate.setContractor(contractorId == 0 ? null : contractorRepository.findById(contractorId).get());
            projectUpdate.setDesignUnit(designUnitId == 0 ? null : designUnitRepository.findById(designUnitId).get());

            projectRepository.save(projectUpdate);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(projectUpdate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }


    //Lây danh sách Project có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/project/get/allProject")
    public ResponseEntity<Page<Project>> getAllProjectPagination(@RequestParam int provinceId, @RequestParam int districtId, @RequestParam String name, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<Project> projectByName = name.equals("") ? projectRepository.findAll() : projectService.findProjectByKeyName(name);
            boolean isProvince = provinceRepository.existsById(provinceId);
            boolean isDistrict = districtRepository.existsById(districtId);

            List<Project> projectFound;
            if (isProvince && isDistrict) {
                projectFound = projectByName.stream()
                        .filter(p -> p.getProvinceId() == provinceId && p.getDistrictId() == districtId)
                        .collect(Collectors.toList());
            } else if (isProvince) {
                projectFound = projectByName.stream()
                        .filter(p -> p.getProvinceId() == provinceId)
                        .collect(Collectors.toList());
            } else {
                projectFound = projectByName;
            }

            int start = page * size;
            int end = Math.min(start + size, projectFound.size());
            List<Project> projectsToPaginate = projectFound.subList(start, end);

            Pageable paging = PageRequest.of(page, size);
            Page<Project> projectByNamePagination = new PageImpl<>(projectsToPaginate, paging, projectFound.size());

            return ResponseEntity.ok(projectByNamePagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Lây danh sách Project
    @GetMapping("/project/get/all")
    public ResponseEntity<List<Project>> getAllProject(){
        try {            
            return ResponseEntity.ok(projectRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    //Lấy danh sách Project theo id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/project/get/{projectId}")
    public ResponseEntity<Project> getProjectById(@PathVariable int projectId){
        try {
            return ResponseEntity.ok(projectRepository.findById(projectId).get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    //Xóa Project By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/project/delete/{projectId}")
    public ResponseEntity<Object> deleteInvestor(@PathVariable int projectId){
        try {    
            projectRepository.deleteById(projectId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    
}

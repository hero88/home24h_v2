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
import com.devcamp.home24h.Repository.WardRepository;
import com.devcamp.home24h.model.Ward;

@RestController
@CrossOrigin
public class WardController {

    @Autowired
    WardRepository wardRepository;

    @Autowired
    ProvinceRepository provinceRepository;

    @Autowired
    DistrictRepository districtRepository;

    // Lấy danh sách các phường bới districtId
    @GetMapping("/ward/get/{districtId}")
    public ResponseEntity<List<Ward>> getWardByDistrictId(@PathVariable int districtId) {
        try {
            List<Ward> wardByDistrictId = wardRepository.findByDistrictId(districtId);
            return ResponseEntity.ok(wardByDistrictId);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Gọi danh sách ward bởi Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/ward/get/wardById/{wardId}")
    public ResponseEntity<Ward> getWardById(@PathVariable int wardId) {
        try {
            return ResponseEntity.ok(wardRepository.findById(wardId).get());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Lây danh sách Ward có phân trang theo Search
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/ward/get/allDetailWard")
    public ResponseEntity<Page<Ward>> getAllWardPagination(
            @RequestParam int provinceId,
            @RequestParam int districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {

            List<Ward> allWard = wardRepository.findAll();
            List<Ward> wardFound = new ArrayList<>();
            if (provinceId == 0 && districtId == 0) {
                wardFound = allWard;
            } else {
                wardFound = allWard.stream()
                        .filter(w -> (!provinceRepository.findById(provinceId).isPresent()
                                || w.getProvince().getId() == provinceId)
                                && (!districtRepository.findById(districtId).isPresent()
                                        || w.getDistrict().getId() == districtId))
                        .collect(Collectors.toList());
            }

            int start = page * size;
            int end = Math.min(start + size, wardFound.size());
            Pageable paging = PageRequest.of(page, size);
            List<Ward> subList = wardFound.subList(start, end);
            Page<Ward> WardPagination = new PageImpl<>(subList, paging, wardFound.size());

            return ResponseEntity.ok(WardPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Tạo Ward
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping("ward/post/{provinceId}/{districtId}")
    public ResponseEntity<Object> createWard(@PathVariable int provinceId, @PathVariable int districtId,
            @RequestBody Ward ward) {
        try {

            ward.setProvince(provinceRepository.findById(provinceId).get());
            ward.setDistrict(districtRepository.findById(districtId).get());
            return ResponseEntity.status(HttpStatus.CREATED).body(wardRepository.save(ward));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Xóa Ward By Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/ward/delete/{wardId}")
    public ResponseEntity<Object> deleteWard(@PathVariable int wardId) {
        try {
            wardRepository.deleteById(wardId);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    // Cập nhật Ward
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/district/put/{wardId}/{districtId}/{provinceId}")
    public ResponseEntity<Object> updateWardtById(@PathVariable int districtId, @RequestBody Ward wardUpdate,
            @PathVariable int provinceId, @PathVariable int wardId) {
        try {

            Ward ward = wardRepository.findById(wardId).get();
            ward.setName(wardUpdate.getName());
            ward.setPrefix(wardUpdate.getPrefix());
            ward.setProvince(provinceRepository.findById(provinceId).get());
            ward.setDistrict(districtRepository.findById(districtId).get());

            return ResponseEntity.ok(wardRepository.save(ward));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}

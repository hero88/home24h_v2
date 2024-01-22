package com.devcamp.home24h.Controller;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.home24h.Repository.RoleRepository;
import com.devcamp.home24h.Repository.UserRepository;
import com.devcamp.home24h.Service.UserService;
import com.devcamp.home24h.model.ERole;
import com.devcamp.home24h.model.Role;
import com.devcamp.home24h.model.User;

@RestController
@CrossOrigin
public class UserController {

    @Autowired
    UserRepository userRepository;
    
    @Autowired
    UserService userService;

    @Autowired
    RoleRepository roleRepository;


    //Lây danh sách User có phân trang
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/get/allUser")
    public ResponseEntity<Page<User>> getAllUserPagination(@RequestParam String name, @RequestParam String roleStr, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        try {
            List<User> userFound = new ArrayList<>();
            List<User> userByName = userService.findUserByKeyName(name);

            ERole role = null;
            try {
                role = ERole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                // RoleStr không tương ứng với bất kỳ giá trị nào của ERole
            }

            if (role == null) {
                userFound = userByName;
            } else {
                userFound = userByName.stream().filter(u -> u.getUserRole() == ERole.valueOf(roleStr)).collect(Collectors.toList());
            }

            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, userFound.size());
            Page<User> userPagination = new PageImpl<>(userFound.subList(start, end), paging, userFound.size());

            return ResponseEntity.ok(userPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Xóa User By Id
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/user/delete/{userId}")
    public ResponseEntity<Object> deleteUser(@PathVariable long userId){
        try {    
            userRepository.deleteById(userId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Cập nhật Role của User
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/user/updateRole/{userId}")
    public ResponseEntity<Object> updateRole(@PathVariable long userId, @RequestParam ERole roleUpdate){
        try {    
            User userUpdate = userRepository.findById(userId).get();
            Role role = roleRepository.findByName(roleUpdate).get();
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            userUpdate.setRoles(roles);
            
            return ResponseEntity.ok(userRepository.save(userUpdate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getCause().getCause().getMessage());
        }
    }

    //Lấy User theo userId
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/get/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable long userId){
        try {    
            User user = userRepository.findById(userId).get();            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Cập nhật Info User
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/user/put/{userId}")
    public ResponseEntity<Object> updateInfoUser(@RequestBody User paramUserUpdate, @PathVariable long userId){
        try {
            if(userRepository.findByEmail(paramUserUpdate.getEmail()) != null && userRepository.findByEmail(paramUserUpdate.getEmail()).getId() != userId ){
                return ResponseEntity.badRequest().body("Tên email này đã tồn tại");
            }         
                         
            User userUpdate = userRepository.findById(userId).get();
            userUpdate.setEmail(paramUserUpdate.getEmail());
            userUpdate.setAddress(paramUserUpdate.getAddress());
            userUpdate.setPhone(paramUserUpdate.getPhone());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(userUpdate));
        } catch (Exception e) { 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }










    
}

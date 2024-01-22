package com.devcamp.home24h.Controller;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.home24h.Repository.RoleRepository;
import com.devcamp.home24h.Repository.UserRepository;
import com.devcamp.home24h.Request.ChangePassRequest;
import com.devcamp.home24h.Request.ForgotPasswordRequest;
import com.devcamp.home24h.Request.UserInfo;
import com.devcamp.home24h.Service.EmailService;
import com.devcamp.home24h.model.ERole;
import com.devcamp.home24h.model.Role;
import com.devcamp.home24h.model.User;
import com.devcamp.home24h.payload.request.LoginRequest;
import com.devcamp.home24h.payload.request.SignupRequest;
import com.devcamp.home24h.payload.response.JwtResponse;
import com.devcamp.home24h.payload.response.MessageResponse;
import com.devcamp.home24h.security.jwt.JwtUtils;
import com.devcamp.home24h.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @Autowired
  EmailService emailService;

  @PostMapping("/user/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);
      
      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());
      return ResponseEntity.ok(new JwtResponse(jwt, 
                          userDetails.getId(), 
                          userDetails.getUsername(), 
                          userDetails.getEmail(), 
                          roles));
    } 
    catch (BadCredentialsException e) {
        return ResponseEntity
            .internalServerError()
            .body(new MessageResponse("Error: Wrong username or password"));
    }
                        
  }

  @PostMapping("user/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Username is already taken!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
      User user = new User(signUpRequest.getUsername(), 
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()), signUpRequest.getSecretQuestion(), encoder.encode(signUpRequest.getSecretAnswer().toLowerCase()));

    Set<String> strRoles = signUpRequest.getRole();
    Set<Role> roles = new HashSet<>();

    if (strRoles == null) {
      Role userRole = roleRepository.findByName(ERole.ROLE_USER)
          .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
      roles.add(userRole);
    } else {
      strRoles.forEach(role -> {
        switch (role) {
        case "admin":
          Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
              .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
          roles.add(adminRole);

          break;
        case "mod":
          Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
              .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
          roles.add(modRole);

          break;
        default:
          Role userRole = roleRepository.findByName(ERole.ROLE_USER)
              .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
          roles.add(userRole);
        }
      });
    }

    user.setRoles(roles);
    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }

  //Thay đổi mật khẩu
  @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
  @PutMapping("/user/changePassword")
  public ResponseEntity<?> changePassword(@RequestBody ChangePassRequest changePassRequest){
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication != null ? authentication.getName() : "").orElse(null);
        if(encoder.matches(changePassRequest.getOldPassword(), currentUser.getPassword())){
          currentUser.setPassword(encoder.encode(changePassRequest.getNewPassword()));
          return ResponseEntity.ok(userRepository.save(currentUser));
        } else {
          return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old Password wrong");
        }
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }

  //Lấy một số thông tin cơ bản của user
  @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
  @GetMapping("/user/basicInfoUser")
  public ResponseEntity<UserInfo> getBasicInfoUser(){
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(authentication != null ? authentication.getName() : "").orElse(null);
        UserInfo basicInfo = new UserInfo(currentUser.getUsername(), currentUser.getEmail());
        return ResponseEntity.ok(basicInfo);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }

  @PostMapping("/user/forgotPassword")
  public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest){
    try {
      
      Optional<User> user = userRepository.findByUsername(forgotPasswordRequest.getUsername());
      if(user.isPresent()){
        if(user.get().getSecretQuestion() == forgotPasswordRequest.getSecretQuestion() && encoder.matches(forgotPasswordRequest.getSecretAnswer().toLowerCase(), user.get().getSecretAnswer())){
          String newPass = RandomStringUtils.randomAlphanumeric(10);
          user.get().setPassword(encoder.encode(newPass));
          userRepository.save(user.get());
          String text = "Your new password is '" + newPass + "'. You can go to Page My Account to change your password";
          emailService.sendEmail(user.get().getEmail(), text);
          return ResponseEntity.ok().body("success");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Incorrect secret question or answer");
      } else {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Username dont't exist");
      }
      
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }




}

package com.devcamp.home24h.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "users", 
    uniqueConstraints = { 
      @UniqueConstraint(columnNames = "username"),
      @UniqueConstraint(columnNames = "email") 
    })
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 20)
  private String username;

  @NotBlank
  @Size(max = 50)
  @Email
  private String email;

  @NotBlank
  @Size(max = 120)
  private String password;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(  name = "user_roles", 
        joinColumns = @JoinColumn(name = "user_id"), 
        inverseJoinColumns = @JoinColumn(name = "role_id"))
  private Set<Role> roles = new HashSet<>();

  @Enumerated(EnumType.STRING)
  private ESecretQuestion secretQuestion;

  @NotBlank
  @Size(max = 120)
  private String secretAnswer;

  @OneToMany(mappedBy = "user")
  @JsonIgnore
  private List<Realestate> realestates;

  private String phone;

  private String address;


  public User() {
  }

  public User(String username, String email, String password, ESecretQuestion secretQuestion, String secretAnswer) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.secretQuestion = secretQuestion;
    this.secretAnswer = secretAnswer;

  }

  

  public User(Long id, @NotBlank @Size(max = 20) String username, @NotBlank @Size(max = 50) @Email String email,
      @NotBlank @Size(max = 120) String password, Set<Role> roles, ESecretQuestion secretQuestion,
      @NotBlank @Size(max = 120) String secretAnswer, List<Realestate> realestates, String phone, String address) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.secretQuestion = secretQuestion;
    this.secretAnswer = secretAnswer;
    this.realestates = realestates;
    this.phone = phone;
    this.address = address;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Set<Role> getRoles() {
    return roles;
  }

  public void setRoles(Set<Role> roles) {
    this.roles = roles;
  }

  public String getSecretAnswer() {
    return secretAnswer;
  }

  public void setSecretAnswer(String secretAnswer) {
    this.secretAnswer = secretAnswer;
  }

  public ESecretQuestion getSecretQuestion() {
    return secretQuestion;
  }

  public void setSecretQuestion(ESecretQuestion secretQuestion) {
    this.secretQuestion = secretQuestion;
  }

  public List<Realestate> getRealestates() {
    return realestates;
  }

  public void setRealestates(List<Realestate> realestates) {
    this.realestates = realestates;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public ERole getUserRole(){
    ERole userRole = ERole.ROLE_USER;
    boolean foundRole = false; // Biến cờ kiểm tra xem đã tìm thấy vai trò nào hay chưa

    for (Role role : roles) {
        if (role.getName().equals(ERole.ROLE_ADMIN)) {
            userRole = role.getName();
            foundRole = true;
            break;
        } else if (role.getName().equals(ERole.ROLE_MODERATOR)) {
            userRole = role.getName();
            foundRole = true;
        }
    }

    if (!foundRole) {
        userRole = ERole.ROLE_USER;
    }

    return userRole;
  }

}

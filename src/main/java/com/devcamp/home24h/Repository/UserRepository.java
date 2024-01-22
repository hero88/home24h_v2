package com.devcamp.home24h.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.home24h.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);

  Boolean existsByUsername(String username);

  Boolean existsByEmail(String email);

  User findByEmail(String email);
}

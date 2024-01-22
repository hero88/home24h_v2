package com.devcamp.home24h;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.devcamp.home24h.Repository.RoleRepository;
import com.devcamp.home24h.Repository.UserRepository;
import com.devcamp.home24h.model.ERole;
import com.devcamp.home24h.model.Role;

@SpringBootApplication
public class Home24hApplication implements CommandLineRunner {

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	UserRepository userRepository;



	public static void main(String[] args) {
		SpringApplication.run(Home24hApplication.class, args);
	}

	@Override
	public void run(String... params) throws Exception {
		if(!roleRepository.findByName(ERole.ROLE_USER).isPresent()) {
			roleRepository.save(new Role(ERole.ROLE_USER));
		}

		if(!roleRepository.findByName(ERole.ROLE_MODERATOR).isPresent()) {
			roleRepository.save(new Role(ERole.ROLE_MODERATOR));
		}

		if(!roleRepository.findByName(ERole.ROLE_ADMIN).isPresent()) {
			roleRepository.save(new Role(ERole.ROLE_ADMIN));
		}

	}


}

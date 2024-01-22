package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.UserRepository;
import com.devcamp.home24h.model.User;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    //Search User theo Name
    public List<User> findUserByKeyName(String name){
        String [] nameArray = name.split(" ");
      
        List<User> allUser = userRepository.findAll();
    
        List<User> filterUserName = allUser.stream().filter(user -> {
            for (String keyword : nameArray) {
                if (!user.getUsername().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterUserName;
    }

    
}

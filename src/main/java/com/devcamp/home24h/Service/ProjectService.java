package com.devcamp.home24h.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.home24h.Repository.ProjectRepository;
import com.devcamp.home24h.model.Project;

@Service
public class ProjectService {

    @Autowired
    ProjectRepository projectRepository;

    //Search Project theo Name
    public List<Project> findProjectByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<Project> allProject = projectRepository.findAll();
    
        List<Project> filterProjectName = allProject.stream().filter(i -> {
            for (String keyword : nameArray) {
                if (!i.getName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterProjectName;
    }

    
}

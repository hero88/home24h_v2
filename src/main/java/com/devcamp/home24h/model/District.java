package com.devcamp.home24h.model;
import java.util.List;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name="district")
public class District {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private String name;
    
    private String prefix;

    @ManyToOne
    @JsonIgnore
    private Province province;

    

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Ward> wards;

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Street> streets;

    @OneToMany(mappedBy = "district")
    @JsonIgnore
    private List<Project> projects;

    @OneToMany(mappedBy = "district")
    @JsonIgnore
    private List<Realestate> realestates;


    public District() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public Province getProvince() {
        return province;
    }

    public void setProvince(Province province) {
        this.province = province;
    }

    public Set<Ward> getWards() {
        return wards;
    }

    public void setWards(Set<Ward> wards) {
        this.wards = wards;
    }

    public Set<Street> getStreets() {
        return streets;
    }

    public void setStreets(Set<Street> streets) {
        this.streets = streets;
    }

    public List<Project> getProjects() {
        return projects;
    }

    public void setProjects(List<Project> projects) {
        this.projects = projects;
    }

    public List<Realestate> getRealestates() {
        return realestates;
    }

    public void setRealestates(List<Realestate> realestates) {
        this.realestates = realestates;
    }

    public int getTotalProject(){
        int vCount = 0;
        if(projects != null){
          vCount = projects.size();
        }
        return vCount;
    }

    public int getTotalRealestates(){
        int vCount = 0;
        if(realestates != null){
          vCount = realestates.size();
        }
        return vCount;
    }

    public String getProvinceName(){
        return province.getName();
    }


    public int getIdProvince() {
        return province.getId();
    }


    

    
}

package com.devcamp.home24h.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="ward")
public class Ward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
  
    private String name;

    private String prefix;

    @ManyToOne
    @JsonIgnore
    private District district;

    @ManyToOne
    @JsonIgnore
    private Province province;

    

    public Ward() {
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

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }

    public Province getProvince() {
        return province;
    }

    public void setProvince(Province province) {
        this.province = province;
    }

    public String getProvinceName(){
        return province.getName();
    }

        public String getDistrictName(){
        return district.getName();
    }

    public int getProvinceById(){
        return province.getId();
    }

    public int getDistrictById(){
        return district.getId();
    }




    


    
}

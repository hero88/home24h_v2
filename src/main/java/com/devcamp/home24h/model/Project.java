package com.devcamp.home24h.model;

import java.math.BigDecimal;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name="project")
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String name;

    private String address;

    private String slogan;

    private String 	description;

    private BigDecimal acreage;

    private BigDecimal constructArea;

    private int numBlock;

    private String numFloor;

    private Integer numApartment; 

    private String apartmenttArea;

    private String utilities;

    private String regionLink;

    private String photo;

    @ManyToOne
    @JoinColumn(name="province_id")
    @JsonIgnore
    private Province province;


    @ManyToOne
    @JoinColumn(name="district_id")
    @JsonIgnore
    private District district;

    @ManyToOne
    @JoinColumn(name="ward_id")
    @JsonBackReference("ward_project")
    private Ward ward;

    @ManyToOne
    @JoinColumn(name="street_id")
    @JsonBackReference("street_project")
    private Street street;

    @ManyToOne
    @JoinColumn(name="investor_id")
    @JsonBackReference("investor_project")
    private Investor investor;

    @ManyToOne
    @JoinColumn(name="contractor_id")
    @JsonBackReference("contractor_project")
    private Contractor contractor;


    @ManyToOne
    @JoinColumn(name="design_unit_id")
    @JsonBackReference("designUnit_project")
    private DesignUnit designUnit;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "project")
    @JsonIgnore
    private List<Realestate> realestates;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "project")
    @JsonManagedReference("project_layout")
    private List<Layout> layouts;



    public Project() {
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


    public String getAddress() {
        return address;
    }


    public void setAddress(String address) {
        this.address = address;
    }


    public String getSlogan() {
        return slogan;
    }


    public void setSlogan(String slogan) {
        this.slogan = slogan;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public BigDecimal getAcreage() {
        return acreage;
    }


    public void setAcreage(BigDecimal acreage) {
        this.acreage = acreage;
    }


    public BigDecimal getConstructArea() {
        return constructArea;
    }


    public void setConstructArea(BigDecimal constructArea) {
        this.constructArea = constructArea;
    }


    public int getNumBlock() {
        return numBlock;
    }


    public void setNumBlock(int numBlock) {
        this.numBlock = numBlock;
    }


    public String getNumFloor() {
        return numFloor;
    }


    public void setNumFloor(String numFloor) {
        this.numFloor = numFloor;
    }


    public Integer getNumApartment() {
        return numApartment;
    }


    public void setNumApartment(Integer numApartment) {
        this.numApartment = numApartment;
    }


    public String getApartmenttArea() {
        return apartmenttArea;
    }


    public void setApartmenttArea(String apartmenttArea) {
        this.apartmenttArea = apartmenttArea;
    }


    public String getPhoto() {
        return photo;
    }


    public void setPhoto(String photo) {
        this.photo = photo;
    }


    public Province getProvince() {
        return province;
    }


    public void setProvince(Province province) {
        this.province = province;
    }


    public District getDistrict() {
        return district;
    }


    public void setDistrict(District district) {
        this.district = district;
    }


    public Ward getWard() {
        return ward;
    }


    public void setWard(Ward ward) {
        this.ward = ward;
    }


    public Street getStreet() {
        return street;
    }


    public void setStreet(Street street) {
        this.street = street;
    }


    public Investor getInvestor() {
        return investor;
    }


    public void setInvestor(Investor investor) {
        this.investor = investor;
    }


    public Contractor getContractor() {
        return contractor;
    }


    public void setContractor(Contractor contractor) {
        this.contractor = contractor;
    }


    public DesignUnit getDesignUnit() {
        return designUnit;
    }


    public void setDesignUnit(DesignUnit designUnit) {
        this.designUnit = designUnit;
    }


    public String getUtilities() {
        return utilities;
    }


    public void setUtilities(String utilities) {
        this.utilities = utilities;
    }


    public String getRegionLink() {
        return regionLink;
    }


    public void setRegionLink(String regionLink) {
        this.regionLink = regionLink;
    }

    public List<Realestate> getRealestates() {
        return realestates;
    }


    public void setRealestates(List<Realestate> realestates) {
        this.realestates = realestates;
    }

    public List<Layout> getLayouts() {
        return layouts;
    }


    public void setLayouts(List<Layout> layouts) {
        this.layouts = layouts;
    }



    

    // ----------------------------------------------------------
    public String getProvinceName(){
        return province.getName();
    }

    public String getDistrictName(){
        return district.getName();
    }

    public String getWardName(){
        return ward.getName();
    }

    public String getInvestorName(){
        if(investor == null){
            return null;
        } else {
        return investor.getName();
        }
    }

    public String getContractorName(){
        if(contractor == null){
            return null;
        } else {
        return contractor.getName();
        }
    }

    public String getDesignUnitName(){
        if(designUnit == null){
            return null;
        } else {
        return designUnit.getName();
        }
    }

    public int getTotalRealestates(){
       if(realestates == null ){
        return 0;
       } else {
        return realestates.size();
       }
    }

    public int getProvinceId(){
        return province.getId();
    }

    public int getDistrictId(){
        return district.getId();
    }

    public int getWardId(){
        return ward.getId();
    }

    public int getStreetId(){
        return street.getId();
    }

    public Integer getContractorId(){   
        if(contractor != null){    
            return contractor.getId();
        }
        else {
            return null;
        }
    }

    public Integer getInvestorId(){    
        if(investor != null){    
            return investor.getId();
        }
        else {
            return null;
        }
    }

    public Integer getDesignUnitId(){
        if(designUnit != null){    
            return designUnit.getId();
        }
        else {
            return null;
        }
    }

    
}

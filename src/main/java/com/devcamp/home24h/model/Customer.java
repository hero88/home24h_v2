package com.devcamp.home24h.model;

import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name="customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String contactName;

    private String contactTitle;

    private String address;

    @Column(nullable = false, unique = true)
    private String mobile;

    private String email;

    private String note;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    // @JsonManagedReference("customer_realestate")
    @JsonIgnore
    private List<Realestate> realestates;



    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date creatDate;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date updateDate;

    public Customer() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactTitle() {
        return contactTitle;
    }

    public void setContactTitle(String contactTitle) {
        this.contactTitle = contactTitle;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Date getCreatDate() {
        return creatDate;
    }

    public void setCreatDate(Date creatDate) {
        this.creatDate = creatDate;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public List<Realestate> getRealestates() {
        return realestates;
    }

    public void setRealestates(List<Realestate> realestates) {
        this.realestates = realestates;
    }

    // ---------------------------------------------------------------

    public int getTotalRealestates(){
       if(realestates == null ){
        return 0;
       } else {
        return realestates.size();
       }
    }



    
}

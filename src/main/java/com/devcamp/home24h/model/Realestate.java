package com.devcamp.home24h.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Locale;
import java.util.ResourceBundle;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="realestate")
public class Realestate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String title;

    private int type;

    private int request;

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
    @JsonBackReference("ward_realestate")
    private Ward ward;

    @ManyToOne
    @JoinColumn(name="street_id")
    @JsonBackReference("street_realestate")
    private Street street;

    @ManyToOne
    @JoinColumn(name="project_id")
    // @JsonBackReference("project_realestate")
	@JsonIgnore
    private Project project;

    private String address;

    @ManyToOne
    @JoinColumn(name="customer_id")
    // @JsonBackReference("customer_realestate")
	@JsonIgnore
    private Customer customer;

    private long price;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date createDate;

	@JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date updateDate;


    @Column(nullable = false)
    private BigDecimal acreage;

    private int direction;

    private String apartCode;

    private int totalFloors;

    private int numberFloors;

    private int bathRoom;

    private int bedRoom;

    private BigDecimal wallArea;

	@Column(length = 5000)
    private String description;

    private int adjacentFacadeNum;


    private BigDecimal widthY;

    private BigDecimal longX;

    private String structure;

    private String photo;

	private int status;

	@ManyToOne
	@JoinColumn(name="user_id")
	private User user;

    public Realestate() {
    }

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public int getRequest() {
		return request;
	}

	public void setRequest(int request) {
		this.request = request;
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

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public Customer getCustomer() {
		return customer;
	}

	public void setCustomer(Customer customer) {
		this.customer = customer;
	}

	public long getPrice() {
		return price;
	}

	public void setPrice(long price) {
		this.price = price;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date creatDate) {
		this.createDate = creatDate;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}


	public BigDecimal getAcreage() {
		return acreage;
	}

	public void setAcreage(BigDecimal acreage) {
		this.acreage = acreage;
	}

	public int getDirection() {
		return direction;
	}

	public void setDirection(int direction) {
		this.direction = direction;
	}

	public String getApartCode() {
		return apartCode;
	}

	public void setApartCode(String apartCode) {
		this.apartCode = apartCode;
	}

	public int getTotalFloors() {
		return totalFloors;
	}

	public void setTotalFloors(int totalFloors) {
		this.totalFloors = totalFloors;
	}

	public int getNumberFloors() {
		return numberFloors;
	}

	public void setNumberFloors(int numberFloors) {
		this.numberFloors = numberFloors;
	}

	public int getBathRoom() {
		return bathRoom;
	}

	public void setBathRoom(int bathRoom) {
		this.bathRoom = bathRoom;
	}

	public int getBedRoom() {
		return bedRoom;
	}

	public void setBedRoom(int bedRoom) {
		this.bedRoom = bedRoom;
	}

	public BigDecimal getWallArea() {
		return wallArea;
	}

	public void setWallArea(BigDecimal wallArea) {
		this.wallArea = wallArea;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public int getAdjacentFacadeNum() {
		return adjacentFacadeNum;
	}

	public void setAdjacentFacadeNum(int adjacentFacadeNum) {
		this.adjacentFacadeNum = adjacentFacadeNum;
	}

	public BigDecimal getWidthY() {
		return widthY;
	}

	public void setWidthY(BigDecimal widthY) {
		this.widthY = widthY;
	}

	public BigDecimal getLongX() {
		return longX;
	}

	public void setLongX(BigDecimal longX) {
		this.longX = longX;
	}

	public String getStructure() {
		return structure;
	}

	public void setStructure(String structure) {
		this.structure = structure;
	}

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	

	public String getProvinceName(){
		if(this.province != null){
			return this.province.getName();
		}
		return null;
	}

	public int getProvinceId(){
		if(this.province != null){
			return this.province.getId();
		}
		return 0;
	}


	public String getDistrictName(){
		if(this.district != null){
			return this.district.getName();
		}
		return null;
	}

	public int getDistrictId(){
		if(this.district != null){
			return this.district.getId();
		}
		return 0;
	}
	

	public String getWardName(){
		if(this.ward != null){
			return this.ward.getName();
		}
		return null;
	}

	public int getWardId(){
		if(this.ward != null){
			return this.ward.getId();
		}
		return 0;
	}

	public int getStreetId(){
		if(this.street != null){
			return this.street.getId();
		}
		return 0;
	}

    
	public String getTypeName(){
		if(EType.getStatus(this.type) != null){
			Locale locale = new Locale("vi", "VN");
	        ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
			return messages.getString(EType.getStatus(this.type).name());
		}
		return null;
	}

	public String getRequestName(){
		if(ERequest.getStatus(this.request) != null){

			Locale locale = new Locale("vi", "VN");
        	ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
			return messages.getString(ERequest.getStatus(this.request).name());
		}
			return null;
	}

	public String getDirectionName(){
		if(EDirection.getStatus(this.direction) != null){

			Locale locale = new Locale("vi", "VN");
			ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
			return messages.getString(EDirection.getStatus(this.direction).name());
		}
			return null;
	}

	public String getStatusName(){
		if(EStatus.getStatus(this.status) != null){

			Locale locale = new Locale("vi", "VN");
			ResourceBundle messages = ResourceBundle.getBundle("messages", locale);
			return messages.getString(EStatus.getStatus(this.status).name());
		}
			return null;
	}

	


	public String getCustomerName(){
		if(this.customer != null){
			return customer.getContactName();
		}
		return null;
	}

	public int getCustomerId(){
		if(this.customer != null){
			return customer.getId();
		}
		return 0;
	}


	public Project getDetailProject(){
		if(this.project != null){
			return project;
		}
		return null;
	}


    


    
    
}

//---------------------- INPUT NUMBER --------------------------
function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

function validateInputMax2Decimal(input) {
   var decimalValue = input.value;

   // Kiểm tra xem giá trị có phải là số thập phân với tối đa 2 chữ số phần thập phân hay không? Nếu không thì thực hiện code
   if (!/^\d+(\.\d{0,2})?$/.test(decimalValue)) {
      // Xóa chữ số thập phân thứ ba và sau đó cập nhật lại giá trị nhập vào
      input.value = decimalValue.slice(0, decimalValue.indexOf(".") + 3);
   }
}

function validateInputMax1Decimal(input) {
   var decimalValue = input.value;

   // Kiểm tra xem giá trị có phải là số thập phân với tối đa 2 chữ số phần thập phân hay không? Nếu không thì thực hiện code
   if (!/^\d+(\.\d{0,1})?$/.test(decimalValue)) {
      // Xóa chữ số thập phân thứ ba và sau đó cập nhật lại giá trị nhập vào
      input.value = decimalValue.slice(0, decimalValue.indexOf(".") + 2);
   }
}

function isPositiveDecimal(event) {
   var charCode = event.which ? event.which : event.keyCode;
   var inputValue = event.target.value;

   // Kiểm tra xem ký tự được nhập có phải là số (0-9), dấu chấm (.) và là ký tự đầu tiên
   if (
      (charCode >= 48 && charCode <= 57) || // Số từ 0 đến 9
      (charCode === 46 && inputValue.indexOf(".") === -1) || // Dấu chấm (.) chỉ được nhập một lần
      charCode === 8 // Phím xóa (Backspace)
   ) {
      return true; // Cho phép nhập ký tự
   }

   return false; // Không cho phép nhập ký tự
}

const gLocalhostUrl = "http://localhost:8080";

checkToken();

//gọi API kiểm tra quyền đăng nhập
function callApiAdminOrModeratorAccess(paramHeader) {
   return new Promise(function (resolve, reject) {
      $.ajax({
         type: "GET",
         async: false,
         headers: paramHeader,
         url: `/users/adminOrMod`,
         success: function (res) {
            resolve(res);
         },
         error: function (xhr) {
            reject(xhr);
         },
      });
   });
}

//Kiểm tra token User có quyên đăng nhập không ?
async function checkToken() {
   const gInfoUser = JSON.parse(localStorage.getItem("home24h"));
   if (gInfoUser == null) {
      window.location.href = `../../UserPage/home/home.html`;
   } else {
      const gHeader = {
         Authorization: "Bearer " + gInfoUser.accessToken,
      };
      try {
         await callApiAdminOrModeratorAccess(gHeader);
         $(document).ready(function () {
            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            gImageCreate = [];

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/Home/Home.html`;
            });

            // --------------------- ADD ------------------------------------
            $("#btn-add").on("click", function () {
               let vData = getDataForm();
               if (validateData()) {
                  callApiCreateRealestates(vData);
               }
            });

            //    -----------------------------TAB------------------------------------
            $(".nav-itemInfo").on("click", function (event) {
               // Xóa lớp active khỏi tất cả các thẻ a con của nav-itemInfo
               $(".nav-itemInfo .nav-link").removeClass("active");
               // Gán lớp active cho thẻ a con trực tiếp được nhấp chuột
               $(this).children(".nav-link").addClass("active");
               // Lấy href của thẻ a được nhấp chuột
               var targetDivId = $(this).children(".nav-link").attr("data-target");
               // Ẩn tất cả các div với hiệu ứng fadeOut
               $(".infoAdd").fadeOut("fast", function () {
                  $(this).addClass("d-none");
               });

               // Hiển thị div tương ứng với hiệu ứng fadeIn
               $(targetDivId).fadeIn("fast", function () {
                  $(this).removeClass("d-none");
               });
            });

            // --------------------- PROVINCE ------------------------------------
            //Sự kiện khi thay đổi province
            $("#select-province").on("change", function () {
               $("#select-district").empty();
               $("#select-district").append(`
                  <option value="0">Chọn Tỉnh/Thành</option>`);

               $("#select-ward").empty();
               $("#select-ward").append(`
                  <option value="0">Chọn Phường Xã</option>`);

               $("#select-street").empty();
               $("#select-street").append(`
                  <option value="0">Chọn Đường</option>`);

               let vProvinceId = $(this).val();
               if (vProvinceId != 0) {
                  callApiDistrictByProvinceId(vProvinceId);
               }
            });

            // --------------------- DISTRICT ------------------------------------
            //Sự kiện khi thay đổi district
            $("#select-district").on("change", function () {
               $("#select-ward").empty();
               $("#select-ward").append(`
                  <option value="0">Chọn Phường Xã</option>`);

               $("#select-street").empty();
               $("#select-street").append(`
                  <option value="0">Chọn Đường</option>`);
               //Gọi Api danh sách ward
               let vDisstrictId = $(this).val();
               if (vDisstrictId != 0) {
                  callApiWardByDistrictId(vDisstrictId);
               }
            });

            // --------------------- WARD ------------------------------------
            //Sự kiện khi thay đổi ward
            $("#select-ward").on("change", function () {
               $("#select-street").empty();
               $("#select-street").append(`
                  <option value="0">Chọn Đường</option>`);

               let vProvinceId = $("#select-province").val();
               let vDistrictId = $("#select-district").val();
               let vWardId = $(this).val();
               if (vWardId != 0) {
                  callApiStreetByProvinceIdAndDistrictId(vProvinceId, vDistrictId);
               }
            });

            // --------------------- PHOTO ------------------------------------
            //Khi click sự kiện thay đổi hình ảnh
            $("#inp-filePhoto").on("change", function () {
   

               let fileInput = $(this)[0];
               if(fileInput.files.length  > 0){
                 
                  let selectedFile = fileInput.files[0];
                  if(selectedFile.type.startsWith('image/')){
                     gImageCreate = [];
                     $("#wrapper-photo").empty();
                     let reader = new FileReader();
                     reader.onload = function(e) {
                        // Hiển thị hình ảnh trong một thẻ img
                        $("#wrapper-photo").append(`
                        <img src="${e.target.result}" class="img-fluid" style="max-width: 400px;">
                     `);
                     };
                     reader.readAsDataURL(selectedFile);
                     gImageCreate.push(selectedFile)
                  }
               }
            });

            // --------------------- MODAL -----------------------------------------
            //Xử lý sự kiện khi click btn add Customer
            $("#btn-addCustomer").on("click", function () {
               $("#customer-modal").modal("show");
            });

            //Xử lý sự kiện khi click btn add trong modal Contractor
            $("#modal-btn-addCustomer").on("click", function () {
               let vData = getDataFormCustomer();

               if (validateDataCustomer()) {
                  callApiCreateCustomer(vData);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);

               // Hiện tab thông tin được active
               $(".nav-itemInfo").each(function () {
                  if ($(this).find(".nav-link").hasClass("active")) {
                     var targetDivId = $(this).find(".nav-link").attr("data-target");
                     $(targetDivId).removeClass("d-none").fadeIn("fast");
                  }
               });

               //Gọi Api Tất cả province
               callApiAllProvince();

               //Gọi Api Tất cả project
               callApiAllProject();

               //Gọi Api Tất cả Customer
               callApiAllCustomer();

               //Gọi Api Tất cả Type
               callApiAllType();

               //Gọi Api Tất cả Request
               callApiAllRequest();

               //Gọi Api Tất cả Direction
               callApiAllDirection();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api tạo Realestates
            function callApiCreateRealestates(paramData) {

               let vFormData  = new FormData();
               for(let key in paramData){
                  vFormData.append(key, paramData[key]);
               }

               if(gImageCreate[0]){
                  vFormData.append("imageCreate", gImageCreate[0]);
               }

               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/realestates/post/dashboard/${paramData.provinceId}/${paramData.districtId}/${paramData.wardId}/${paramData.streetId}/${paramData.projectId}/${paramData.customerId}`,
                  data: vFormData,
                  processData: false, // Không xử lý dữ liệu
                  contentType: false, // Không đặt loại nội dung
                  success: function (res) {
                     handleSuccess("realestates");
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Gọi API tạo Customer
            function callApiCreateCustomer(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/customer/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("customer");
                     callApiAllCustomer();
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Gọi Tất cả Project
            function callApiAllProject() {
               $.ajax({
                  type: "GET",
                  url: `/project/get/all`,
                  success: function (res) {
                     loadSelectProject(res);
                  },
               });
            }

            //Gọi Tất cả Customer
            function callApiAllCustomer() {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/customer/get/all`,
                  success: function (res) {
                     loadSelectCustomer(res);
                  },
               });
            }

            //Gọi Tất cả Type
            function callApiAllType() {
               $.ajax({
                  type: "GET",
                  url: `/enum/eType/get/all`,
                  success: function (res) {
                     loadSelectType(res);
                  },
               });
            }

            //Gọi Tất cả Request
            function callApiAllRequest() {
               $.ajax({
                  type: "GET",
                  url: `/enum/eRequest/get/all`,
                  success: function (res) {
                     loadSelectRequest(res);
                  },
               });
            }

            //Gọi Tất cả Direction
            function callApiAllDirection() {
               $.ajax({
                  type: "GET",
                  url: `/enum/eDirection/get/all`,
                  success: function (res) {
                     loadSelectDirection(res);
                  },
               });
            }

            //Gọi Tất cả Province
            function callApiAllProvince() {
               $.ajax({
                  type: "GET",
                  url: `/province/get/allProvince`,
                  success: function (res) {
                     loadSelectProvince(res);
                  },
               });
            }

            //Gọi danh sách District by ProvinceId
            function callApiDistrictByProvinceId(paramProvinceId) {
               $.ajax({
                  type: "GET",
                  url: `/district/get/${paramProvinceId}`,
                  success: function (res) {
                     loadSelectDistrict(res);
                  },
               });
            }

            //Gọi danh sách Ward by DistrictId
            function callApiWardByDistrictId(paramDistrictId) {
               $.ajax({
                  type: "GET",
                  url: `/ward/get/${paramDistrictId}`,
                  success: function (res) {
                     loadSelectWard(res);
                  },
               });
            }

            //Gọi danh sách Street by ProvinceId và DistrictId
            function callApiStreetByProvinceIdAndDistrictId(paramProvinceId, paramDistrictId) {
               $.ajax({
                  type: "GET",
                  url: `/street/get/${paramProvinceId}/${paramDistrictId}`,
                  success: function (res) {
                     loadSelectStreet(res);
                  },
               });
            }

            // ------------------------------ GET ----------------------------------------------
            function getDataForm() {
               let vData = {};
               vData.title = $("#inp-title").val().trim();
               vData.provinceId = $("#select-province").val();
               vData.districtId = $("#select-district").val();
               vData.wardId = $("#select-ward").val();
               vData.streetId = $("#select-street").val();
               vData.address = $("#inp-address").val().trim();
               vData.projectId = $("#select-project").val();
               vData.type = $("#select-type").val();
               vData.request = $("#select-request").val();
               vData.customerId = $("#select-customer").val();
               vData.acreage = $("#inp-acreage").val();
               vData.price = $("#inp-price").val().replace(/,/g, "");
               vData.longX = $("#inp-longX").val().trim();
               vData.widthY = $("#inp-widthY").val().trim();
               vData.bedRoom = $("#inp-bedRoom").val();
               vData.bathRoom = $("#inp-bathRoom").val();
               vData.direction = $("#select-direction").val();
               vData.apartCode = $("#inp-apartCode").val().trim();
               vData.description = $("#inp-description").val().replace(/\n/g, "<br>").trim();
               vData.adjacentFacadeNum = $("#inp-adjacentFacadeNum").val();
               vData.numberFloors = $("#inp-numberFloors").val();
               vData.totalFloors = $("#inp-totalFloors").val();
               vData.wallArea = $("#inp-wallArea").val();
               vData.structure = $("#inp-structure").val().trim();


               

               return vData;
            }

            //Lấy dữ liệu Customer
            function getDataFormCustomer() {
               let vData = {};
               vData.contactName = $("#inp-contactNameCustomer").val().trim();
               vData.contactTitle = $("#inp-contactTitleCustomer").val().trim();
               vData.address = $("#inp-addressCustomer").val().trim();
               vData.mobile = $("#inp-mobileCustomer").val();
               vData.email = $("#inp-emailCustomer").val().trim();
               vData.note = $("#inp-noteCustomer").val().trim();
               return vData;
            }

            // ------------------------------ LOAD ----------------------------------------------
            //Tải tất cả project vào select
            function loadSelectProject(paramData) {
               $("#select-project").append(`
                   <option value="0">Chọn Dự Án</option>`);

               paramData.forEach(function (element) {
                  $("#select-project").append(`
                     <option value="${element.id}">${element.name}</option>
                   `);
               });
            }

            //Tải tất cả customer vào select
            function loadSelectCustomer(paramData) {
               $("#select-customer").empty();
               $("#select-customer").append(`
                     <option value="0">Chọn Chủ Nhà</option>`);

               paramData.forEach(function (element) {
                  $("#select-customer").append(`
                       <option value="${element.id}">${element.contactName} - ${element.mobile}</option>
                     `);
               });
            }

            //Tải tất cả Type vào select
            function loadSelectType(paramData) {
               $("#select-type").append(`
                       <option value="0">Chọn Loại Tin</option>`);

               paramData.forEach(function (element) {
                  $("#select-type").append(`
                         <option value="${element.code}">${element.name}</option>
                 `);
               });
            }

            //Tải tất cả Request vào select
            function loadSelectRequest(paramData) {
               $("#select-request").append(`
                   <option value="0">Chọn Yêu Cầu</option>`);

               paramData.forEach(function (element) {
                  $("#select-request").append(`
                     <option value="${element.code}">${element.name}</option>
                  `);
               });
            }

            //Tải tất cả Direction vào select
            function loadSelectDirection(paramData) {
               $("#select-direction").append(`
                     <option value="0">Chọn Hướng Nhà</option>`);

               paramData.forEach(function (element) {
                  $("#select-direction").append(`
                       <option value="${element.code}">${element.name}</option>
                    `);
               });
            }

            //Tải tất cả province vào select
            function loadSelectProvince(paramData) {
               paramData.forEach(function (element) {
                  $("#select-province").append(`
                   <option value="${element.id}">${element.name}</option>
                 `);
               });
            }

            //Tải danh sách district bới provinceId
            function loadSelectDistrict(paramData) {
               paramData.forEach(function (element) {
                  $("#select-district").append(`
                  <option value="${element.id}">${element.name}</option>
                `);
               });
            }

            //Tải danh sách ward bới districtId
            function loadSelectWard(paramData) {
               paramData.forEach(function (element) {
                  $("#select-ward").append(`
                    <option value="${element.id}">${element.name}</option>
                  `);
               });
            }

            //Tải danh sách street bới provinceId và districtId
            function loadSelectStreet(paramData) {
               paramData.forEach(function (element) {
                  $("#select-street").append(`
                      <option value="${element.id}">${element.name}</option>
                    `);
               });
            }

            // ------------------------------ VALIDATE ----------------------------------------------
            function validateData() {
               let vName = $("#inp-title");
               let vProvince = $("#select-province");
               let vDistrict = $("#select-district");
               let vWard = $("#select-ward");
               let vType = $("#select-type");
               let vRequest = $("#select-request");
               let vAcreage = $("#inp-acreage");
               let vPrice = $("#inp-price");

               //Kiểm tra tên
               vName.on("input", function () {
                  vName.siblings(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra Province
               vProvince.on("change", function () {
                  if ($(this).val() !== "0") {
                     vProvince.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vProvince.val() == "0") {
                  vProvince.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra District
               vDistrict.on("change", function () {
                  if ($(this).val() !== "0") {
                     vDistrict.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vDistrict.val() == "0") {
                  vDistrict.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra Ward
               vWard.on("change", function () {
                  if ($(this).val() !== "0") {
                     vWard.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vWard.val() == "0") {
                  vWard.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra Type
               vType.on("change", function () {
                  if ($(this).val() !== "0") {
                     vType.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vType.val() == "0") {
                  vType.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra Request
               vRequest.on("change", function () {
                  if ($(this).val() !== "0") {
                     vRequest.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vRequest.val() == "0") {
                  vRequest.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra Acreage
               vAcreage.on("input", function () {
                  if ($(this).val() !== "") {
                     vAcreage.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vAcreage.val() == "") {
                  vAcreage.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               //Kiểm tra Price
               vPrice.on("input", function () {
                  if ($(this).val() !== "") {
                     vPrice.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vPrice.val() == "") {
                  vPrice.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            //Validate customer
            function validateDataCustomer() {
               let vMobile = $("#inp-mobileCustomer");

               vMobile.on("input", function () {
                  vMobile.siblings(".note-error").addClass("d-none");
               });

               if (vMobile.val() == "") {
                  vMobile.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function handleFail(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
               } else {
                  console.log(paramError.responseText);
               }
            }
            // ------------------------------ HANDlE ----------------------------------------------

            function handleFail(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
               } else {
                  console.log(paramError);
               }
            }

            function handleSuccess(param) {
               if (param == "realestates") {
                  $("#inp-title").val("");
                  $("#inp-filePhoto").val("");
                  $("#wrapper-photo").empty();
                  $("#select-province").val("0");
                  $("#select-district").empty();
                  $("#select-ward").empty();
                  $("#select-street").empty();
                  $("#inp-address").val("");
                  $("#select-project").val("0");
                  $("#select-type").val("0");
                  $("#select-request").val("0");
                  $("#select-customer").val("0");
                  $("#inp-acreage").val("");
                  $("#inp-price").val("");
                  $("#inp-longX").val("");
                  $("#inp-widthY").val("");
                  $("#inp-bedRoom").val("");
                  $("#inp-bathRoom").val("");
                  $("#select-direction").val("");
                  $("#inp-apartCode").val("");
                  $("#inp-description").val("");
                  $("#inp-adjacentFacadeNum").val("");
                  $("#inp-numberFloors").val("");
                  $("#inp-totalFloors").val("");
                  $("#inp-wallArea").val("");
                  $("#inp-structure").val("");
                  gImageCreate = [];
               }

               if (param == "customer") {
                  $("#inp-contactNameCustomer").val("");
                  $("#inp-contactTitleCustomer").val("");
                  $("#inp-addressCustomer").val("");
                  $("#inp-mobileCustomer").val("");
                  $("#inp-emailCustomer").val("");
                  $("#inp-noteCustomer").val("");
               }
               toastr.success("Tạo Thành Công");
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

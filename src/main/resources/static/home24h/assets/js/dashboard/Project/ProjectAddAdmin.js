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

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/home/home.html`;
            });

            // --------------------- ADD ------------------------------------
            $("#btn-add").on("click", function () {
               let vData = getDataForm();
               if (validateData()) {
                  callApiCreateProject(vData);
               }
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
               var vFile = $(this)[0].files;
               if (vFile.length > 0) {
                  $("#wrapper-photo").empty();
                  $("#wrapper-photo").append(`
                     <img src="/images/${vFile[0].name}" class="img-fluid">
                  `);
               }
               0;
            });

            //Khi click sự kiện thay đổi hình ảnh ở modal Utilities
            $("#inp-filePhotoUtilities").on("change", function () {
               var vFile = $(this)[0].files;
               if (vFile.length > 0) {
                  $("#wrapper-photoUtilities").empty();
                  $("#wrapper-photoUtilities").append(`
                        <img src="/images/${vFile[0].name}" class="img-fluid">
                     `);
               }
               0;
            });

            //Khi click sự kiện thay đổi hình ảnh ở modal RegionLink
            $("#inp-filePhotoRegionLink").on("change", function () {
               var vFile = $(this)[0].files;
               if (vFile.length > 0) {
                  $("#wrapper-photoRegionLink").empty();
                  $("#wrapper-photoRegionLink").append(`
                           <img src="/images/${vFile[0].name}" class="img-fluid">
                        `);
               }
               0;
            });

            // --------------------- MODAL ------------------------------------
            //Xử lý sự kiện khi click btn add investor
            $("#btn-addInvestor").on("click", function () {
               $("#investor-modal").modal("show");
            });

            //Xử lý sự kiện khi click btn add trong modal Investor
            $("#modal-btn-addInvestor").on("click", function () {
               let vData = getDataFormInvestor();

               if (validateDataInvestor()) {
                  callApiCreateInvestor(vData);
               }
            });

            //Xử lý sự kiện khi click btn add Contractor
            $("#btn-addContractor").on("click", function () {
               $("#contractor-modal").modal("show");
            });

            //Xử lý sự kiện khi click btn add trong modal Contractor
            $("#modal-btn-addContractor").on("click", function () {
               let vData = getDataFormContractor();

               if (validateDataContractor()) {
                  callApiCreateContractor(vData);
               }
            });

            //Xử lý sự kiện khi click btn add DesignUnit
            $("#btn-addDesignUnit").on("click", function () {
               $("#designUnit-modal").modal("show");
            });

            //Xử lý sự kiện khi click btn add trong modal DesignUnit
            $("#modal-btn-addDesignUnit").on("click", function () {
               let vData = getDataFormDesignUnit();

               if (validateDataDesignUnit()) {
                  callApiCreateDesignUnit(vData);
               }
            });

            //Xử lý sự kiện khi click btn add Utilities
            $("#wrapper-utilities").on("click", "#btn-addUtilities", function () {
               $("#utilities-modal").modal("show");
            });

            //Xử lý sự kiện khi click btn add trong modal Utilities
            $("#modal-btn-addUtilities").on("click", function () {
               let vData = getDataFormUtilities();
               if (validateDataUtilities()) {
                  callApiCreateUtilities(vData);
               }
            });

            //Xử lý sự kiện khi click btn add RegionLink
            $("#wrapper-regionLink").on("click", "#btn-addRegionLink", function () {
               $("#regionLink-modal").modal("show");
            });

            //Xử lý sự kiện khi click btn add trong modal RegionLink
            $("#modal-btn-addRegionLink").on("click", function () {
               let vData = getDataFormRegionLink();

               if (validateDataRegionLink()) {
                  callApiCreateRegionLink(vData);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);

               //Gọi Api Tất cả province
               callApiAllProvince();
               //Gọi Api tất cả chủ đầu tư
               callApiAllInvestor();
               //Gọi Api tất cả nhà thầu
               callApiAllContractor();
               //Gọi Api tất cả đơn vị thiết kế
               callApiAllDesignUnit();
               //Gọi Api tất cả tiện ích
               callApiAllUtilities();
               //Gọi Api tất cả vùng liên kết
               callApiAllRegionLink();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api tạo Project
            function callApiCreateProject(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/project/post/${paramData.provinceId}/${paramData.districtId}/${paramData.wardId}/${paramData.streetId}/${paramData.investorId}/${paramData.contractorId}/${paramData.designUnitId}`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("project");
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Gọi Tất cả province
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

            //Gọi danh sách tất cả Investor
            function callApiAllInvestor() {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/investor/get/all`,
                  success: function (res) {
                     loadSelectInvestor(res);
                  },
               });
            }

            //Gọi danh sách tất cả Contractor
            function callApiAllContractor() {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/contractor/get/all`,
                  success: function (res) {
                     loadSelectContractor(res);
                  },
               });
            }

            //Gọi danh sách tất cả DesignUnit
            function callApiAllDesignUnit() {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/designUnit/get/all`,
                  success: function (res) {
                     loadSelectDesignUnit(res);
                  },
               });
            }

            //Gọi danh sách tất cả Utilities
            function callApiAllUtilities() {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/utilities/get/all`,
                  success: function (res) {
                     loadUtilities(res);
                  },
               });
            }

            //Gọi danh sách tất cả RegionLink
            function callApiAllRegionLink() {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/regionLink/get/all`,
                  success: function (res) {
                     loadRegionLink(res);
                  },
               });
            }

            //Tạo Investor
            function callApiCreateInvestor(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/investor/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("investor");
                     callApiAllInvestor();
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Tạo Contractor
            function callApiCreateContractor(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/contractor/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("contractor");
                     callApiAllContractor();
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Tạo Contractor
            function callApiCreateDesignUnit(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/designUnit/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("designUnit");
                     callApiAllDesignUnit();
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Tạo Utilities
            function callApiCreateUtilities(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/utilities/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("utilities");
                     $("#wrapper-utilities > div:first-child").append(`
                        <label class="mr-3 font-weight-normal">
                           <input type="checkbox"  name="checkbox-utilities" class="mx-1" value="${res.id}">${res.name}
                        </label>         
                     `);
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Tạo Utilities
            function callApiCreateRegionLink(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/regionLink/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess("regionLink");
                     $("#wrapper-regionLink > div:first-child").append(`
                        <label class="mr-3 font-weight-normal">
                           <input type="checkbox"  name="checkbox-regionLink" class="mx-1" value="${res.id}">${res.name}
                        </label>         
                     `);
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            // ------------------------------ GET ----------------------------------------------
            function getDataForm() {
               let vData = {};
               vData.name = $("#inp-name").val().trim();
               vData.provinceId = $("#select-province").val();
               vData.districtId = $("#select-district").val();
               vData.wardId = $("#select-ward").val();
               vData.streetId = $("#select-street").val();
               vData.address = $("#inp-address").val().trim();
               vData.description = $("#inp-description").val().trim();
               vData.slogan = $("#inp-slogan").val().trim();
               vData.acreage = $("#inp-acreage").val().trim();
               vData.constructArea = $("#inp-constructArea").val().trim();
               vData.numBlock = $("#inp-numBlock").val().trim();
               vData.numFloors = $("#inp-numFloors").val().trim();
               vData.numApartment = $("#inp-numApartment").val().trim();
               vData.apartmentArea = $("#inp-apartmentArea").val().trim();
               vData.investorId = $("#select-investor").val();
               vData.contractorId = $("#select-contractor").val();
               vData.designUnitId = $("#select-designUnit").val();

               vData.utilities = "";
               //Lấy tất cả value tiện ích
               $(`input[name="checkbox-utilities"]:checked`).each(function () {
                  vData.utilities += $(this).val() + ",";
               });
               // Xóa dấu phẩy cuối cùng (nếu có)
               vData.utilities = vData.utilities.replace(/,$/, "");

               vData.regionLink = "";
               //Lấy tất cả value tiện ích
               $(`input[name="checkbox-regionLink"]:checked`).each(function () {
                  vData.regionLink += $(this).val() + ",";
               });
               // Xóa dấu phẩy cuối cùng (nếu có)
               vData.regionLink = vData.regionLink.replace(/,$/, "");

               //Lấy tên hình ảnh để lưu vào DB
               let vUrlPhoto = $("#inp-filePhoto").val();
               if (vUrlPhoto == "") {
                  vData.photo = null;
               } else {
                  vData.photo = vUrlPhoto.split("\\").pop();
               }
               return vData;
            }

            //Lấy thông tin trong form Investor
            function getDataFormInvestor() {
               let vData = {};
               vData.name = $("#inp-nameInvestor").val().trim();
               vData.description = $("#inp-descriptionInvestor").val().trim();
               vData.address = $("#inp-addressInvestor").val().trim();
               vData.phone = $("#inp-phoneInvestor").val().trim();
               vData.phone2 = $("#inp-phone2Investor").val().trim();
               vData.fax = $("#inp-faxInvestor").val().trim();
               vData.email = $("#inp-emailInvestor").val().trim();
               vData.website = $("#inp-websiteInvestor").val().trim();
               vData.note = $("#inp-noteInvestor").val().trim();
               return vData;
            }

            //Lấy thông tin trong form Contractor
            function getDataFormContractor() {
               let vData = {};
               vData.name = $("#inp-nameContractor").val().trim();
               vData.description = $("#inp-descriptionContractor").val().trim();
               vData.address = $("#inp-addressContractor").val().trim();
               vData.phone = $("#inp-phoneContractor").val().trim();
               vData.phone2 = $("#inp-phone2Contractor").val().trim();
               vData.fax = $("#inp-faxContractor").val().trim();
               vData.email = $("#inp-emailContractor").val().trim();
               vData.website = $("#inp-websiteContractor").val().trim();
               vData.note = $("#inp-noteContractor").val().trim();
               return vData;
            }

            //Lấy thông tin trong form DesignUnit
            function getDataFormDesignUnit() {
               let vData = {};
               vData.name = $("#inp-nameDesignUnit").val().trim();
               vData.description = $("#inp-descriptionDesignUnit").val().trim();
               vData.address = $("#inp-addressDesignUnit").val().trim();
               vData.phone = $("#inp-phoneDesignUnit").val().trim();
               vData.phone2 = $("#inp-phone2DesignUnit").val().trim();
               vData.fax = $("#inp-faxDesignUnit").val().trim();
               vData.email = $("#inp-emailDesignUnit").val().trim();
               vData.website = $("#inp-websiteDesignUnit").val().trim();
               vData.note = $("#inp-noteDesignUnit").val().trim();
               return vData;
            }

            //Lấy thông tin trong form Utilities
            function getDataFormUtilities() {
               let vData = {};
               vData.name = $("#inp-nameUtilities").val().trim();
               vData.description = $("#inp-descriptionUtilities").val().trim();
               vData.address = $("#inp-addressUtilities").val().trim();
               //Lấy tên hình ảnh để lưu vào DB
               let vUrlPhoto = $("#inp-filePhotoUtilities").val();
               if (vUrlPhoto == "") {
                  vData.photo = null;
               } else {
                  vData.photo = vUrlPhoto.split("\\").pop();
               }
               return vData;
            }

            //Lấy thông tin trong form RegionLink
            function getDataFormRegionLink() {
               let vData = {};
               vData.name = $("#inp-nameRegionLink").val().trim();
               vData.description = $("#inp-descriptionRegionLink").val().trim();
               vData.address = $("#inp-addressRegionLink").val().trim();
               //Lấy tên hình ảnh để lưu vào DB
               let vUrlPhoto = $("#inp-filePhotoRegionLink").val();
               if (vUrlPhoto == "") {
                  vData.photo = null;
               } else {
                  vData.photo = vUrlPhoto.split("\\").pop();
               }
               return vData;
            }

            // ------------------------------ LOAD ----------------------------------------------
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

            //Tải danh sách tất cả Investor
            function loadSelectInvestor(paramData) {
               $("#select-investor").empty();
               $("#select-investor").append(`
               <option value="0">Chọn Nhà Đầu Tư</option>`);
               paramData.forEach(function (element) {
                  $("#select-investor").append(`
                         <option value="${element.id}">${element.name}</option>`);
               });
            }

            //Tải danh sách tất cả Contractor
            function loadSelectContractor(paramData) {
               $("#select-contractor").empty();

               $("#select-contractor").append(`
               <option value="0">Chọn Nhà Thầu</option>`);

               paramData.forEach(function (element) {
                  $("#select-contractor").append(`
                      <option value="${element.id}">${element.name}</option>`);
               });
            }

            //Tải danh sách tất cả DesignUnit
            function loadSelectDesignUnit(paramData) {
               $("#select-designUnit").empty();

               $("#select-designUnit").append(`
               <option value="0">Chọn Đơn Vị Thiết Kế</option>`);

               paramData.forEach(function (element) {
                  $("#select-designUnit").append(`
                         <option value="${element.id}">${element.name}</option>`);
               });
            }

            //Tải danh sách Utilities vào form
            function loadUtilities(paramData) {
               $("#wrapper-utilities > div").empty();
               paramData.forEach(function (e) {
                  $("#wrapper-utilities > div").append(`
                     <label class="mr-3 font-weight-normal">
                        <input type="checkbox"  name="checkbox-utilities" class="mx-1" value="${e.id}">${e.name}</label>         
                  `);
               });

               $("#wrapper-utilities").append(`
                  <div class="mr-3">
                     <button class="btn btn-primary" id="btn-addUtilities"><i class="fa-solid fa-plus"></i></button>
                  </div>
               `);
            }

            //Tải danh sách RegionLink vào form
            function loadRegionLink(paramData) {
               $("#wrapper-regionLink > div").empty();

               paramData.forEach(function (e) {
                  $("#wrapper-regionLink > div").append(`
                     <label class="mr-3 font-weight-normal">
                        <input type="checkbox"  name="checkbox-regionLink" class="mx-1" value="${e.id}">${e.name}
                     </label>         
                  `);
               });

               $("#wrapper-regionLink").append(`
                  <div class="mr-3">
                     <button class="btn btn-primary" id="btn-addRegionLink"><i class="fa-solid fa-plus"></i></button>
                  </div>
               `);
            }

            // ------------------------------ VALIDATE ----------------------------------------------
            function validateData() {
               let vName = $("#inp-name");
               let vProvince = $("#select-province");
               let vDistrict = $("#select-district");
               let vWard = $("#select-ward");
               let vStreet = $("#select-street");

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

               return true;
            }

            function validateDataInvestor() {
               let vName = $("#inp-nameInvestor");

               vName.on("input", function () {
                  vName.siblings(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function validateDataContractor() {
               let vName = $("#inp-nameContractor");

               vName.on("input", function () {
                  vName.siblings(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function validateDataDesignUnit() {
               let vName = $("#inp-nameDesignUnit");

               vName.on("input", function () {
                  vName.siblings(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function validateDataUtilities() {
               let vName = $("#inp-nameUtilities");

               vName.on("input", function () {
                  vName.siblings(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function validateDataRegionLink() {
               let vName = $("#inp-nameRegionLink");

               vName.on("input", function () {
                  vName.siblings(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
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
               if (param == "investor") {
                  $("#inp-nameInvestor").val("");
                  $("#inp-descriptionInvestor").val("");
                  $("#inp-addressInvestor").val("");
                  $("#inp-phoneInvestor").val("");
                  $("#inp-phone2Investor").val("");
                  $("#inp-faxInvestor").val("");
                  $("#inp-emailInvestor").val("");
                  $("#inp-websiteInvestor").val("");
                  $("#inp-noteInvestor").val("");
               }

               if (param == "contractor") {
                  $("#inp-nameContractor").val("");
                  $("#inp-descriptionContractor").val("");
                  $("#inp-addressContractor").val("");
                  $("#inp-phoneContractor").val("");
                  $("#inp-phone2Contractor").val("");
                  $("#inp-faxContractor").val("");
                  $("#inp-emailContractor").val("");
                  $("#inp-websiteContractor").val("");
                  $("#inp-noteContractor").val("");
               }

               if (param == "designUnit") {
                  $("#inp-nameDesignUnit").val("");
                  $("#inp-descriptionDesignUnit").val("");
                  $("#inp-addressDesignUnit").val("");
                  $("#inp-phoneDesignUnit").val("");
                  $("#inp-phone2DesignUnit").val("");
                  $("#inp-faxDesignUnit").val("");
                  $("#inp-emailDesignUnit").val("");
                  $("#inp-websiteDesignUnit").val("");
                  $("#inp-noteDesignUnit").val("");
               }

               if (param == "utilities") {
                  $("#inp-nameUtilities").val("");
                  $("#inp-descriptionUtilities").val("");
                  $("#inp-addressUtilities").val("");
                  $("#inp-filePhotoUtilities").val("");
                  $("#wrapper-photoUtilities").empty();
               }

               if (param == "regionLink") {
                  $("#inp-nameRegionLink").val("");
                  $("#inp-descriptionRegionLink").val("");
                  $("#inp-addressRegionLink").val("");
                  $("#inp-filePhotoRegionLink").val("");
                  $("#wrapper-photoRegionLink").empty();
               }

               if (param == "project") {
                  $("#inp-name").val("");
                  $("#select-province").val("0");
                  $("#select-district").empty();
                  $("#select-ward").empty();
                  $("#select-street").empty();
                  $("#inp-address").val("");
                  $("#inp-description").val("");
                  $("#inp-slogan").val("");
                  $("#inp-acreage").val("");
                  $("#inp-constructArea").val("");
                  $("#inp-numBlock").val("");
                  $("#inp-numFloors").val("");
                  $("#inp-numApartment").val("");
                  $("#inp-apartmentArea").val("");
                  $("#select-investor").val("0");
                  $("#select-contractor").val("0");
                  $("#select-designUnit").val("0");
                  $("#inp-filePhoto").val("");
                  $("#wrapper-photo").empty();
                  $("input[name='checkbox-utilities']").prop("checked", false);
                  $("input[name='checkbox-regionLink']").prop("checked", false);
               }
               toastr.success("Tạo Thành Công");
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

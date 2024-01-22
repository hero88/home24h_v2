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
function callApiUserAccess(paramHeader) {
   return new Promise(function (resolve, reject) {
      $.ajax({
         type: "GET",
         async: false,
         headers: paramHeader,
         url: `/users/userAccess`,
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
         await callApiUserAccess(gHeader);
         $(document).ready(function () {
            if (gInfoUser) {
               $("#container-loginAndRegister").hide();
               $(".a-info").text("Hi, " + gInfoUser.username);
               $("#container-infoAccount").show();
               gInfoUser.roles.forEach(function (role) {
                  if (role == "ROLE_ADMIN" || role == "ROLE_MODERATOR") {
                     $("#container-infoAccount .dashboardPage").show();
                     return false;
                  }
               });
            }

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            let  gImageCreate = [];
            let gImageNameStrOld = [];
            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            $("#btn-logout").click(function () {
               localStorage.removeItem("home24h");
               $("#container-loginAndRegister").show();
               $("#container-infoAccount").hide();
               location.reload();
            });

            //Khi click vào thẻ chi tiêt
            $("#btn-showDetail").on("click", function (event) {
               event.preventDefault();
               let vFormDetail = document.getElementById("form-addDetail");
               if (vFormDetail.style.display === "none") {
                  vFormDetail.style.display = "block";
                  $(this).html("Hide Add Detail");
               } else {
                  vFormDetail.style.display = "none";
                  $(this).html("Show Add Detail");
               }
            });

            //Khi click vào update Realestates
            $("#btn-update").on("click", function () {
               if (validateData()) {
                  let vUrl = window.location.href;
                  let vUrlStr = new URL(vUrl);
                  let vRealestatesUpdateId = vUrlStr.searchParams.get("id");

                  let vData = getDataForm();
                  callApiUpdateRealestates(vData, vRealestatesUpdateId)
                     .then(function (res) {
                        handleSuccess();
                     })
                     .catch(function (xhr) {
                        handleFail(xhr);
                     });
               }
            });

            //Khi click vào nút cancel
            $("#btn-cancel").on("click", function () {
               let previousPage = document.referrer;
               window.location.href = previousPage;
            });

            // --------------------- PHOTO ------------------------------------
            $(".fa-image").on("click", function () {
               $("#inp-fileImage").click();
            });

            $("#inp-fileImage").on("change", function () {
               let fileInput = $(this)[0];
               if(fileInput.files.length  > 0){
                  let selectedFile = fileInput.files[0];
                  if(selectedFile.type.startsWith('image/')){
                     let reader = new FileReader();
                     reader.onload = function(e) {
                        // Hiển thị hình ảnh trong một thẻ img
                        $("#img-insert").attr("src", e.target.result).addClass("img-fluid");
                     };
                     reader.readAsDataURL(selectedFile);
                     gImageCreate.push(selectedFile);
                  }
               }
            });

            // --------------------- PROVINCE ------------------------------------
            //Sự kiện khi thay đổi province
            $("#select-province").on("change", async function () {
               $("#select-district").empty();
               $("#select-district").append(`
                    <option value="0">Select District</option>`);

               $("#select-ward").empty();
               $("#select-ward").append(`
                <option value="0">Select Ward</option>`);

               $("#select-street").empty();
               $("#select-street").append(`
                <option value="0">Select Street</option>`);

               let vProvinceId = $(this).val();
               if (vProvinceId != 0) {
                  let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
                  loadSelectDistrict(vDistrict);

               }
            });

            // --------------------- DISTRICT ------------------------------------
            //Sự kiện khi thay đổi district
            $("#select-district").on("change", async function () {
               $("#select-ward").empty();
               $("#select-ward").append(`
                <option value="0">Select Ward</option>`);

               $("#select-street").empty();
               $("#select-street").append(`
                 <option value="0">Select Street</option>`);

               let vIdDistrict = $(this).val();
               if (vIdDistrict != 0) {
                  let vWard = await callApiWardByDistrictId(vIdDistrict);
                  loadSelectWard(vWard);
               }
            });

            // --------------------- WARD ------------------------------------
            //Sự kiện khi thay đổi ward
            $("#select-ward").on("change", async function () {
               $("#select-street").empty();
               $("#select-street").append(`
                  <option value="0">Select Street</option>`);

               let vIdProvince = $("#select-province").val();
               let vIdDistrict = $("#select-district").val();
               let vWard = $(this).val();
               if (vWard != 0) {
                  let vStreet = await callApiStreetByProvinceIdAndDistrictId(vIdProvince, vIdDistrict);
                  loadSelectStreet(vStreet);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               handleLoading();
            }
            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ----------------------------------API-----------------------------------------
            //Gọi Api Realestates theo Id
            function callApiRealestatesById(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/realestates/get/realestatesUser/${paramId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi Api cập nhật Realestates
            function callApiUpdateRealestates(paramData, paramId) {
               let vData = new FormData();
              
                  vData.append("title", $("#inp-title").val().trim());
                  vData.append("address", $("#inp-address").val().trim());
                  vData.append("type", $("#select-type").val());
                  vData.append("request", $("#select-request").val());
                  vData.append("acreage", $("#inp-acreage").val());
                  vData.append("price", $("#inp-price").val().replace(/,/g, ""));
                  vData.append("longX", $("#inp-longX").val().trim());
                  vData.append("widthY", $("#inp-widthY").val().trim());
                  vData.append("bedRoom", $("#inp-bedRoom").val());
                  vData.append("bathRoom", $("#inp-bathRoom").val());
                  vData.append("direction", $("#select-direction").val());
                  vData.append("apartCode", $("#inp-apartCode").val().trim());
                  vData.append("description", $("#inp-description").val().replace(/\n/g, "<br>").trim());
                  vData.append("adjacentFacadeNum", $("#inp-adjacentFacadeNum").val());
                  vData.append("numberFloors", $("#inp-numberFloors").val());
                  vData.append("totalFloors", $("#inp-totalFloors").val());
                  vData.append("wallArea", $("#inp-wallArea").val());
                  vData.append("structure", $("#inp-structure").val().trim());

                  if(gImageCreate[0]){
                     vData.append("imageCreate", gImageCreate[0]);
                     vData.append("imgeNameStrOldRemove", gImageNameStrOld)
                  }
                           
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     headers: gHeader,
                     url: `/realestates/put/${paramId}/${paramData.provinceId}/${paramData.districtId}/${paramData.wardId}/${paramData.streetId}/${paramData.projectId}`,
                    data: vData,
                  processData: false, // Không xử lý dữ liệu
                  contentType: false, // Không đặt loại nội dung
                     success: function (res) {
                        resolve(res);
                        gImageCreate = [];
                        gImageNameStrOld = [];
                        gImageNameStrOld.push(res.photo)
                                                
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi Tất cả Project
            function callApiAllProject() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/project/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi Tất cả Type
            function callApiAllType() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/enum/eType/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi Tất cả Request
            function callApiAllRequest() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/enum/eRequest/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi Tất cả Direction
            function callApiAllDirection() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/enum/eDirection/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi Tất cả Province
            function callApiAllProvince() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/province/get/allProvince`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi danh sách District by ProvinceId
            function callApiDistrictByProvinceId(paramProvinceId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/district/get/${paramProvinceId}`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi danh sách Ward by DistrictId
            function callApiWardByDistrictId(paramDistrictId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/ward/get/${paramDistrictId}`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //Gọi danh sách Street by ProvinceId và DistrictId
            function callApiStreetByProvinceIdAndDistrictId(paramProvinceId, paramDistrictId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/street/get/${paramProvinceId}/${paramDistrictId}`,
                     success: function (res) {
                        resolve(res);
                     },
                  });
               });
            }

            //------------------------------GET----------------------------------------
            function getDataForm() {
               let vData = {};
               vData.title = $("#inp-title").val().trim();
               //Lấy tên hình ảnh để lưu vào DB
       
               vData.provinceId = $("#select-province").val();
               vData.districtId = $("#select-district").val();
               vData.wardId = $("#select-ward").val();
               vData.streetId = $("#select-street").val();
               vData.projectId = $("#select-project").val();

               return vData;
            }

            //------------------------------VALIDATE----------------------------------------
            //Kiểm tra dữ liệu create
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
                  vName.focus();
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
                  vPrice.focus();

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
                  vProvince.focus();

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
                  vDistrict.focus();

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
                  vWard.focus();
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
                  vAcreage.focus();

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
                  vType.focus();

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
                  vRequest.focus();

                  return false;
               }

               return true;
            }

            //------------------------------LOAD----------------------------------------
            //Tải tất cả project vào select
            function loadSelectProject(paramData) {
               paramData.forEach(function (element) {
                  $("#select-project").append(`
                      <option value="${element.id}">${element.name}</option>
                  `);
               });
            }

            //Tải tất cả Type vào select
            function loadSelectType(paramData) {
               paramData.forEach(function (element) {
                  $("#select-type").append(`
                      <option value="${element.code}">${element.name}</option>
                  `);
               });
            }

            //Tải tất cả Request vào select
            function loadSelectRequest(paramData) {
               paramData.forEach(function (element) {
                  $("#select-request").append(`
                      <option value="${element.code}">${element.name}</option>
                  `);
               });
            }

            //Tải tất cả Direction vào select
            function loadSelectDirection(paramData) {
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

            //------------------------------HANDLE----------------------------------------
            async function handleLoading() {
               let vUrl = window.location.href;
               let vUrlStr = new URL(vUrl);
               let vRealestatesUpdateId = vUrlStr.searchParams.get("id");

               let [vProvince, vProject, vType, vRequest, vDirection, vRealestates] = await Promise.all([
                  //Gọi Api Tất cả province
                  callApiAllProvince(),
                  //Gọi Api Tất cả project
                  callApiAllProject(),
                  //Gọi Api Tất cả Type
                  callApiAllType(),
                  //Gọi Api Tất cả Request
                  callApiAllRequest(),
                  //Gọi Api Tất cả Direction
                  callApiAllDirection(),
                  //Gọi APi Realesupdate
                  callApiRealestatesById(vRealestatesUpdateId),
               ]);

               //load các trường Realestates vào form
               $("#inp-title").val(vRealestates.title);
               if(vRealestates.photo){
                 $("#img-insert").attr("src", `/images/${vRealestates.photo}`).addClass("img-fluid");
                 gImageNameStrOld.push(vRealestates.photo);
               }
               $("#inp-address").val(vRealestates.address);
               $("#inp-acreage").val(vRealestates.acreage);

               $("#inp-price").val(vRealestates.price.toLocaleString());
               $("#inp-longX").val(vRealestates.longX);
               $("#inp-widthY").val(vRealestates.widthY);
               if (vRealestates.bedRoom !== 0) {
                  $("#inp-bedRoom").val(vRealestates.bedRoom);
               }
               if (vRealestates.bathRoom !== 0) {
                  $("#inp-bathRoom").val(vRealestates.bathRoom);
               }
               $("#inp-apartCode").val(vRealestates.apartCode);

               
            
               $("#inp-description").html(vRealestates.description? vRealestates.description.replace(/<br>/g, "\n") : null);
               if (vRealestates.adjacentFacadeNum !== 0) {
                  $("#inp-adjacentFacadeNum").val(vRealestates.adjacentFacadeNum);
               }
               if (vRealestates.numberFloors !== 0) {
                  $("#inp-numberFloors").val(vRealestates.numberFloors);
               }
               if (vRealestates.totalFloors !== 0) {
                  $("#inp-totalFloors").val(vRealestates.totalFloors);
               }
               $("#inp-wallArea").val(vRealestates.wallArea);
               $("#inp-structure").val(vRealestates.structure);

               loadSelectProvince(vProvince);
               $("#select-province").val(vRealestates.provinceId);

               let vDistrict = await callApiDistrictByProvinceId(vRealestates.provinceId);

               loadSelectDistrict(vDistrict);
               $("#select-district").val(vRealestates.districtId);

               let vWard = await callApiWardByDistrictId(vRealestates.districtId);
               loadSelectWard(vWard);
               $("#select-ward").val(vRealestates.wardId);

               let vStreet = await callApiStreetByProvinceIdAndDistrictId(
                  vRealestates.provinceId,
                  vRealestates.districtId
               );
               loadSelectStreet(vStreet);
               $("#select-street").val(vRealestates.streetId);

               loadSelectProject(vProject);
               if (vRealestates.detailProject != null) {
                  $("#select-project").val(vRealestates.detailProject.id);
               }

               loadSelectRequest(vRequest);
               $("#select-request").val(vRealestates.request);

               loadSelectType(vType);
               $("#select-type").val(vRealestates.type);

               loadSelectDirection(vDirection);
               $("#select-direction").val(vRealestates.direction);
            }

            function handleSuccess() {
               toastr.success("Update Success");
            }

            function handleFail(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
               } else {
                  console.log(paramError);
               }
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

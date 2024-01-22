const gLocalhostUrl = "http://localhost:8080";
// var gHeader;

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

            //Khi ấn nút Update Ward
            $("#btn-update").on("click", function () {
               let vValidate = validateData();
               if (vValidate) {
                  let vData = getDataForm();
                  let vUrlStr = new URL(window.location.href);
                  let vStreetIdUrl = vUrlStr.searchParams.get("streetId");

                  callApiUpdateDistrict(vData, vStreetIdUrl)
                     .then(function (res) {
                        handleSuccess();
                     })
                     .catch(function (xhr) {
                        handleFail(xhr);
                     });
               }
            });

            $("#select-province").on("change", async function () {
               let vProvinceId = $(this).val();

               let vSelectDistrict = $("#select-district");
               vSelectDistrict.empty();
               vSelectDistrict.append(`
                       <option value="0">Chọn Quận/Huyện</option>
                  `);
               let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
               loadSelectDistrict(vDistrict);
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               handleLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------
            function callApiUpdateDistrict(paramData, paramStreetId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     url: `/street/put/${paramStreetId}/${paramData.districtId}/${paramData.provinceId}`,
                     headers: gHeader,
                     contentType: "application/json",
                     data: JSON.stringify(paramData),
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi tất cả All Province
            function callApiAllProvince() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/province/get/allProvince`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi tất cả All Province
            function callApiStreetById(paramStreetId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/street/get/streetById/${paramStreetId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
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
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            // --------------------------VALIDATE----------------------------------
            function validateData() {
               let vProvince = $("#select-province");
               let vDistrict = $("#select-district");
               let vName = $("#inp-name");
               let vPrefix = $("#select-prefix");

               vProvince.on("change", function () {
                  if (vProvince.val() != 0) {
                     vProvince.siblings("span").addClass("d-none");
                  }
               });

               if (vProvince.val() == 0) {
                  vProvince.siblings("span").removeClass("d-none");
                  return false;
               }

               vDistrict.on("change", function () {
                  if (vDistrict.val() != 0) {
                     vDistrict.siblings("span").addClass("d-none");
                  }
               });

               if (vDistrict.val() == 0) {
                  vDistrict.siblings("span").removeClass("d-none");
                  return false;
               }

               vName.on("input", function () {
                  vName.siblings("span").addClass("d-none");
               });

               if (vName.val().trim() == "") {
                  vName.siblings("span").removeClass("d-none");
                  return false;
               }

               vPrefix.on("change", function () {
                  if (vPrefix.val() != 0) {
                     vPrefix.siblings("span").addClass("d-none");
                  }
               });

               if (vPrefix.val() == 0) {
                  vPrefix.siblings("span").removeClass("d-none");
                  return false;
               }

               return true;
            }

            // --------------------------GET---------------------------------------
            function getDataForm() {
               let vData = {};
               vData.name = $("#inp-name").val().trim();
               vData.prefix = $("#select-prefix :selected").text();
               vData.provinceId = $("#select-province").val();
               vData.districtId = $("#select-district").val();
               return vData;
            }

            // --------------------------GET---------------------------------------
            function loadSelectProvince(paramData) {
               paramData.forEach((element) => {
                  $("#select-province").append(`
                     <option value="${element.id}">${element.name}</option> 
                  `);
               });
            }

            function loadSelectDistrict(paramData) {
               paramData.forEach((element) => {
                  $("#select-district").append(`
                     <option value="${element.id}">${element.name}</option> 
                  `);
               });
            }

            // --------------------------HANDLE------------------------------------
            async function handleLoading() {
               let vUrlStr = new URL(window.location.href);
               let vStreetIdUrl = vUrlStr.searchParams.get("streetId");
               let [vProvince, vStreet] = await Promise.all([callApiAllProvince(), callApiStreetById(vStreetIdUrl)]);
               loadSelectProvince(vProvince);
               $("#inp-name").val(vStreet.name);
               // $("#select-province").val(vDistrict.idProvince);
               $("#select-prefix option")
                  .filter(function () {
                     return $(this).text() === vStreet.prefix;
                  })
                  .prop("selected", true);

               $("#select-province").val(vStreet.provinceById);

               let vDistrict = await callApiDistrictByProvinceId(vStreet.provinceById);
               loadSelectDistrict(vDistrict);
               $("#select-district").val(vStreet.districtById);
            }

            function handleSuccess() {
               toastr.success("Cập Nhật Thành Công");
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

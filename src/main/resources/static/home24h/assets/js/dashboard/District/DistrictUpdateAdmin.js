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

            //Khi ấn nút Add province
            $("#btn-update").on("click", function () {
               let vValidate = validateData();
               if (vValidate) {
                  let vData = getDataForm();
                  let vUrlStr = new URL(window.location.href);
                  let vDistrictIdUrl = vUrlStr.searchParams.get("districtId");

                  callApiUpdateDistrict(vData, vDistrictIdUrl)
                     .then(function (res) {
                        handleSuccess();
                     })
                     .catch(function (xhr) {
                        handleFail(xhr);
                     });
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               handleLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------
            function callApiUpdateDistrict(paramData, paramDistrictId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     url: `/district/put/${paramDistrictId}/${paramData.provinceId}`,
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
            function callApiDistrictById(paramDistrictId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/district/get/districtById/${paramDistrictId}`,
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

            // --------------------------HANDLE------------------------------------
            async function handleLoading() {
               let vUrlStr = new URL(window.location.href);
               let vDistrictIdUrl = vUrlStr.searchParams.get("districtId");
               let [vProvince, vDistrict] = await Promise.all([
                  callApiAllProvince(),
                  callApiDistrictById(vDistrictIdUrl),
               ]);
               loadSelectProvince(vProvince);
               $("#inp-name").val(vDistrict.name);
               $("#select-province").val(vDistrict.idProvince);
               $("#select-prefix option")
                  .filter(function () {
                     return $(this).text() === vDistrict.prefix;
                  })
                  .prop("selected", true);
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

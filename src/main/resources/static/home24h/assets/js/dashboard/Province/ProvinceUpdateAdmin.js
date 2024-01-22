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
            let vProvinceId;

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
                  callApiUpdateProvince(vData)
                     .then(function (res) {
                        handleSuccess();
                     })
                     .catch(function (xhr) {
                        handleFail(xhr);
                     });
                  console.log(vData);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               handleLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------
            function callApiUpdateProvince(paramData) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     url: `/province/put/${vProvinceId}`,
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

            function callApiProvinceById(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/province/get/${paramId}`,
                     headers: gHeader,
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
               let vName = $("#inp-name");
               let vCode = $("#inp-code");

               vName.on("input", function () {
                  vName.siblings("span").addClass("d-none");
               });

               if (vName.val().trim() == "") {
                  vName.siblings("span").removeClass("d-none");
                  return false;
               }

               vCode.on("input", function () {
                  vCode.siblings("span").addClass("d-none");
               });

               if (vCode.val().trim() == "") {
                  vCode.siblings("span").removeClass("d-none");
                  return false;
               }

               return true;
            }
            // --------------------------GET---------------------------------------
            function getDataForm() {
               let vData = {};
               vData.name = $("#inp-name").val().trim();
               vData.code = $("#inp-code").val().trim();
               return vData;
            }

            // --------------------------HANDLE------------------------------------
            async function handleLoading() {
               let vUrl = window.location.href;
               let vUrlStr = new URL(vUrl);
               vProvinceId = vUrlStr.searchParams.get("provinceId");
               let vProvinceById = await callApiProvinceById(vProvinceId);
               $("#inp-name").val(vProvinceById.name);
               $("#inp-code").val(vProvinceById.code);
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

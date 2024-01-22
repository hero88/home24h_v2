const gLocalhostUrl = "http://localhost:8080";
// var gHeader;

checkToken();

//gọi API kiểm tra quyền đăng nhập
function callApiAdminAccess(paramHeader) {
   return new Promise(function (resolve, reject) {
      $.ajax({
         type: "GET",
         async: false,
         headers: paramHeader,
         url: `/users/admin`,
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
         await callApiAdminAccess(gHeader);
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
                  let vId = vUrlStr.searchParams.get("id");

                  callApiUpDateInfoUser(vData, vId)
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
            function callApiUpDateInfoUser(paramData, paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     url: `/user/put/${paramId}`,
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

            function callApiUserById(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/user/get/${paramId}`,
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
               let vEmail = $("#inp-email");
               let vPhone = $("#inp-phone");

               vEmail.on("input", function () {
                  vEmail.siblings("span").addClass("d-none");
               });

               if (vEmail.val().trim() == "") {
                  vEmail.siblings("span").removeClass("d-none");
                  return false;
               }

               vPhone.on("input", function () {
                  vPhone.siblings("span").addClass("d-none");
               });

               if (isNaN(vPhone.val().trim())) {
                  vPhone.siblings("span").removeClass("d-none");
                  return false;
               }

               return true;
            }

            // --------------------------GET---------------------------------------
            function getDataForm() {
               let vData = {};
               vData.email = $("#inp-email").val().trim();
               vData.phone = $("#inp-phone").val().trim();
               vData.address = $("#inp-address").val().trim();
               return vData;
            }

            // --------------------------HANDLE------------------------------------
            async function handleLoading() {
               let vUrlStr = new URL(window.location.href);
               let vUserId = vUrlStr.searchParams.get("id");
               let vUser = await callApiUserById(vUserId);
               $("#inp-email").val(vUser.email);
               $("#inp-username").val(vUser.username);
               $("#inp-phone").val(vUser.phone);
               $("#inp-address").val(vUser.address);
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

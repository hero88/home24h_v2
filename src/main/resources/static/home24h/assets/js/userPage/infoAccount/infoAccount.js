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
            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            $("#btn-logout").click(function () {
               localStorage.removeItem("home24h");
               $("#container-loginAndRegister").show();
               $("#container-infoAccount").hide();
               location.reload();
            });

            //------------------------CHANGE PASSWORD --------------------------------------
            $("#btn-changePassword").on("click", function (e) {
               e.preventDefault();
               $("#changePassword-modal").modal("show");
            });

            $("#btn-changePassword-modal").on("click", function () {
               if (validateData()) {
                  let vData = getDataForm();
                  callApiChangePassword(vData);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               handleLoading();
            }
            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ----------------------------------API-----------------------------------------
            //Gọi Api thay đổi password
            function callApiChangePassword(paramData) {
               $.ajax({
                  type: "PUT",
                  headers: gHeader,
                  url: `/user/changePassword`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess();
                  },
                  error: function (xhr) {
                     handleFail(xhr);
                  },
               });
            }

            //Gọi Api thông tin cơ bản user
            function callApiBasicInfoUser(paramData) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/user/basicInfoUser`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //------------------------------GET----------------------------------------
            function getDataForm() {
               let vData = {};
               vData.oldPassword = $("#inp-oldPass").val();
               vData.newPassword = $("#inp-newPass").val();
               return vData;
            }

            //------------------------------VALIDATE----------------------------------------
            //Kiểm tra dữ liệu create
            function validateData() {
               let vOldPassword = $("#inp-oldPass");
               let vNewPassword = $("#inp-newPass");

               //Kiểm tra pass cũ
               vOldPassword.on("input", function () {
                  vOldPassword.siblings(".note-error").addClass("d-none");
               });

               if (vOldPassword.val() == "") {
                  vOldPassword.siblings(".note-error").removeClass("d-none");
                  vOldPassword.focus();
                  return false;
               }

               //Kiểm tra pass mới
               vNewPassword.on("input", function () {
                  if ($(this).val() !== "") {
                     vNewPassword.siblings(".note-error").addClass("d-none");
                  }
               });

               if (vNewPassword.val() == "") {
                  vNewPassword.siblings(".note-error").removeClass("d-none");
                  vNewPassword.focus();

                  return false;
               }

               return true;
            }

            //------------------------------LOAD----------------------------------------
            function loadData(paramData) {
               $("#inp-username").val(paramData.username);
               $("#inp-email").val(paramData.email);
            }

            //------------------------------HANDLE----------------------------------------
            async function handleLoading() {
               let vInfo = await callApiBasicInfoUser();
               loadData(vInfo);
            }

            function handleSuccess() {
               $("#changePassword-modal").modal("hide");
               $("#inp-oldPass").val("");
               $("#inp-newPass").val("");

               toastr.success("Change Password Success");
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

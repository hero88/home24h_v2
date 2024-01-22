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
      $(document).ready(function () {
         /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
         /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
         onPageLoading();

         //-----------------------------------REGISTER--------------------------------------------
         $("#btn-login").on("click", function () {
            if (validateData()) {
               let vData = getDataSignIn();
               callApiSignIn(vData)
                  .then(function (response) {
                     localStorage.setItem("home24h", JSON.stringify(response));
                     location.href = "../home/home.html";
                  })
                  .catch(function (xhr) {
                     toastr.error(xhr.responseJSON.message);
                  });
            }
         });

         /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
         function onPageLoading() {}
         /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
         // ----------------------------------API-----------------------------------------
         //Gọi API tạo user
         function callApiSignIn(paramData) {
            return new Promise(function (resolve, reject) {
               $.ajax({
                  type: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  url: `/user/signin`,
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

         function getDataSignIn() {
            var vData = {};
            vData.username = $("#inp-username").val().trim();
            vData.password = $("#inp-password").val().trim();
            return vData;
         }

         //------------------------------VALIDATE----------------------------------------
         //Kiểm tra dữ liệu register
         function validateData() {
            let vUsername = $("#inp-username");
            let vPassword = $("#inp-password");

            vUsername.on("input", function () {
               vUsername.siblings("span").addClass("d-none");
            });

            if (vUsername.val().length < 5 || vUsername.val().length > 20) {
               vUsername.siblings("span").removeClass("d-none");
               return false;
            }

            vPassword.on("input", function () {
               vPassword.siblings("span").addClass("d-none");
            });

            if (vPassword.val().length < 5 || vPassword.val().length > 20) {
               vPassword.siblings("span").removeClass("d-none");
               return false;
            }

            return true;
         }
      });

      return;
   }

   const gHeader = {
      Authorization: "Bearer " + gInfoUser.accessToken,
   };
   try {
      await callApiUserAccess(gHeader);
      window.location.href = `../../UserPage/home/home.html`;
   } catch (error) {
      $(document).ready(function () {
         /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
         /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
         onPageLoading();

         //-----------------------------------REGISTER--------------------------------------------
         $("#btn-login").on("click", function () {
            if (validateData()) {
               let vData = getDataSignIn();
               callApiSignIn(vData)
                  .then(function (response) {
                     localStorage.setItem("home24h", JSON.stringify(response));
                     location.href = "../home/home.html";
                  })
                  .catch(function (xhr) {
                     toastr.error(xhr.responseJSON.message);
                  });
            }
         });

         /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
         function onPageLoading() {}
         /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
         // ----------------------------------API-----------------------------------------
         //Gọi API tạo user
         function callApiSignIn(paramData) {
            return new Promise(function (resolve, reject) {
               $.ajax({
                  type: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  url: `/user/signin`,
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

         function getDataSignIn() {
            var vData = {};
            vData.username = $("#inp-username").val().trim();
            vData.password = $("#inp-password").val().trim();
            return vData;
         }

         //------------------------------VALIDATE----------------------------------------
         //Kiểm tra dữ liệu register
         function validateData() {
            let vUsername = $("#inp-username");
            let vPassword = $("#inp-password");

            vUsername.on("input", function () {
               vUsername.siblings("span").addClass("d-none");
            });

            if (vUsername.val().length < 5 || vUsername.val().length > 20) {
               vUsername.siblings("span").removeClass("d-none");
               return false;
            }

            vPassword.on("input", function () {
               vPassword.siblings("span").addClass("d-none");
            });

            if (vPassword.val().length < 5 || vPassword.val().length > 20) {
               vPassword.siblings("span").removeClass("d-none");
               return false;
            }

            return true;
         }
      });
   }
}

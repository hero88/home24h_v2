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
         $("#btn-register").on("click", function () {
            if (validateData()) {
               let vData = getDataRegister();

               callApiCreateUser(vData)
                  .then(function (response) {
                     countDownSecond(4);
                  })
                  .catch(function (xhr) {
                     if (xhr.status == 400) {
                        toastr.error(xhr.responseJSON.message);
                     } else {
                        toastr.error(xhr.responseText);
                     }
                  });
            }
         });

         /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
         function onPageLoading() {
            handleLoading();
         }
         /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
         // ----------------------------------API-----------------------------------------
         //Gọi API all Secret Question
         function callApiAllSecretQuestion() {
            return new Promise(function (resolve, reject) {
               $.ajax({
                  type: "GET",
                  url: `/enum/eSecretQuestion/all`,
                  success: function (res) {
                     resolve(res);
                  },
                  error: function (xhr) {
                     reject(xhr);
                  },
               });
            });
         }

         //Gọi API tạo user
         function callApiCreateUser(paramData) {
            return new Promise(function (resolve, reject) {
               $.ajax({
                  type: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  url: `/user/signup`,
                  success: function (res) {
                     resolve(res);
                  },
                  error: function (xhr) {
                     reject(xhr);
                  },
               });
            });
         }

         // ------------------------------ LOAD ----------------------------------------------
         //Load SecretQuestion vào select
         function loadDataToSelectQuestion(paramData) {
            paramData.forEach(function (element) {
               $("#select-secretQuestion").append(`
                  <option value="${element.value}">${element.name}</option>
              `);
            });
         }

         //------------------------------GET----------------------------------------

         function getDataRegister() {
            var vData = {};
            vData.username = $("#inp-username").val().trim();
            vData.email = $("#inp-email").val().trim();
            vData.password = $("#inp-password").val().trim();
            vData.confirmPassword = $("#inp-confirmPassword").val().trim();
            vData.secretQuestion = $("#select-secretQuestion").val();
            vData.secretAnswer = $("#inp-secretAnswer").val().trim();
            return vData;
         }

         //------------------------------VALIDATE----------------------------------------
         //Kiểm tra dữ liệu register
         function validateData() {
            let vUsername = $("#inp-username");
            let vEmail = $("#inp-email");
            let vPassword = $("#inp-password");
            let vConfirm = $("#inp-confirmPassword");
            let secretAnswer = $("#inp-secretAnswer");

            vUsername.on("input", function () {
               vUsername.siblings("span").addClass("d-none");
            });

            if (vUsername.val().length < 5 || vUsername.val().length > 20) {
               vUsername.siblings("span").removeClass("d-none");
               return false;
            }

            vEmail.on("input", function () {
               vEmail.siblings("span").addClass("d-none");
            });

            if (vEmail.val() == "") {
               vEmail.siblings("span").removeClass("d-none");
               return false;
            }

            vPassword.on("input", function () {
               vPassword.siblings("span").addClass("d-none");
            });

            if (vPassword.val().length < 5 || vPassword.val().length > 20) {
               vPassword.siblings("span").removeClass("d-none");
               return false;
            }

            vConfirm.on("input", function () {
               vConfirm.siblings("span").addClass("d-none");
            });

            if (vConfirm.val().length < 5 || vConfirm.val().length > 20 || vConfirm.val() != vPassword.val()) {
               vConfirm.siblings("span").removeClass("d-none");
               return false;
            }

            secretAnswer.on("input", function () {
               secretAnswer.siblings("span").addClass("d-none");
            });

            if (secretAnswer.val() == "") {
               secretAnswer.siblings("span").removeClass("d-none");
               return false;
            }

            return true;
         }

         //------------------------------HANDLE----------------------------------------
         async function handleLoading() {
            let vSecretQuestion = await callApiAllSecretQuestion();
            loadDataToSelectQuestion(vSecretQuestion);
         }

         function countDownSecond(paramSecond) {
            $("#overlay").removeClass("d-none");

            setTimeout(function () {
               $("#overlay").addClass("active");
            }, 100);

            $("#countDown-second").html(paramSecond);
            let vCountDown = setInterval(function () {
               paramSecond--;
               $("#countDown-second").html(paramSecond);
               if (paramSecond === -1) {
                  clearInterval(vCountDown);
                  $("#overlay").addClass("d-none");

                  window.location.href = "../login/login.html";
               }
            }, 1000);
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
         $("#btn-register").on("click", function () {
            if (validateData()) {
               let vData = getDataRegister();

               callApiCreateUser(vData)
                  .then(function (response) {
                     countDownSecond(4);
                  })
                  .catch(function (xhr) {
                     if (xhr.status == 400) {
                        toastr.error(xhr.responseJSON.message);
                     } else {
                        toastr.error(xhr.responseText);
                     }
                  });
            }
         });

         /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
         function onPageLoading() {
            handleLoading();
         }
         /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
         // ----------------------------------API-----------------------------------------
         //Gọi API all Secret Question
         function callApiAllSecretQuestion() {
            return new Promise(function (resolve, reject) {
               $.ajax({
                  type: "GET",
                  url: `/enum/eSecretQuestion/all`,
                  success: function (res) {
                     resolve(res);
                  },
                  error: function (xhr) {
                     reject(xhr);
                  },
               });
            });
         }

         //Gọi API tạo user
         function callApiCreateUser(paramData) {
            return new Promise(function (resolve, reject) {
               $.ajax({
                  type: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  url: `/user/signup`,
                  success: function (res) {
                     resolve(res);
                  },
                  error: function (xhr) {
                     reject(xhr);
                  },
               });
            });
         }

         // ------------------------------ LOAD ----------------------------------------------
         //Load SecretQuestion vào select
         function loadDataToSelectQuestion(paramData) {
            paramData.forEach(function (element) {
               $("#select-secretQuestion").append(`
                  <option value="${element.value}">${element.name}</option>
              `);
            });
         }

         //------------------------------GET----------------------------------------

         function getDataRegister() {
            var vData = {};
            vData.username = $("#inp-username").val().trim();
            vData.email = $("#inp-email").val().trim();
            vData.password = $("#inp-password").val().trim();
            vData.confirmPassword = $("#inp-confirmPassword").val().trim();
            vData.secretQuestion = $("#select-secretQuestion").val();
            vData.secretAnswer = $("#inp-secretAnswer").val().trim();
            return vData;
         }

         //------------------------------VALIDATE----------------------------------------
         //Kiểm tra dữ liệu register
         function validateData() {
            let vUsername = $("#inp-username");
            let vEmail = $("#inp-email");
            let vPassword = $("#inp-password");
            let vConfirm = $("#inp-confirmPassword");
            let secretAnswer = $("#inp-secretAnswer");

            vUsername.on("input", function () {
               vUsername.siblings("span").addClass("d-none");
            });

            if (vUsername.val().length < 5 || vUsername.val().length > 20) {
               vUsername.siblings("span").removeClass("d-none");
               return false;
            }

            vEmail.on("input", function () {
               vEmail.siblings("span").addClass("d-none");
            });

            if (vEmail.val() == "") {
               vEmail.siblings("span").removeClass("d-none");
               return false;
            }

            vPassword.on("input", function () {
               vPassword.siblings("span").addClass("d-none");
            });

            if (vPassword.val().length < 5 || vPassword.val().length > 20) {
               vPassword.siblings("span").removeClass("d-none");
               return false;
            }

            vConfirm.on("input", function () {
               vConfirm.siblings("span").addClass("d-none");
            });

            if (vConfirm.val().length < 5 || vConfirm.val().length > 20 || vConfirm.val() != vPassword.val()) {
               vConfirm.siblings("span").removeClass("d-none");
               return false;
            }

            secretAnswer.on("input", function () {
               secretAnswer.siblings("span").addClass("d-none");
            });

            if (secretAnswer.val() == "") {
               secretAnswer.siblings("span").removeClass("d-none");
               return false;
            }

            return true;
         }

         //------------------------------HANDLE----------------------------------------
         async function handleLoading() {
            let vSecretQuestion = await callApiAllSecretQuestion();
            loadDataToSelectQuestion(vSecretQuestion);
         }

         function countDownSecond(paramSecond) {
            $("#overlay").removeClass("d-none");

            setTimeout(function () {
               $("#overlay").addClass("active");
            }, 100);

            $("#countDown-second").html(paramSecond);
            let vCountDown = setInterval(function () {
               paramSecond--;
               $("#countDown-second").html(paramSecond);
               if (paramSecond === -1) {
                  clearInterval(vCountDown);
                  $("#overlay").addClass("d-none");

                  window.location.href = "../login/login.html";
               }
            }, 1000);
         }
      });
   }
}

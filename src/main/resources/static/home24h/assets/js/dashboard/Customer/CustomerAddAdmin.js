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
                  callApiCreateCustomer(vData);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api tạo Customer
            function callApiCreateCustomer(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/customer/post`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     handleSuccess();
                  },
                  error: function (xhr) {
                     handleFaile(xhr);
                  },
               });
            }

            // ------------------------------ GET ----------------------------------------------
            function getDataForm() {
               let vData = {};
               vData.contactName = $("#inp-contactName").val().trim();
               vData.contactTitle = $("#inp-contactTitle").val().trim();
               vData.address = $("#inp-address").val().trim();
               vData.mobile = $("#inp-mobile").val();
               vData.email = $("#inp-email").val().trim();
               vData.note = $("#inp-note").val().trim();
               return vData;
            }

            // ------------------------------ VALIDATE ----------------------------------------------
            function validateData() {
               let vMobile = $("#inp-mobile");

               vMobile.on("input", function () {
                  $(".note-error").addClass("d-none");
               });

               if (vMobile.val() == "") {
                  $(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function handleFaile(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
               } else {
                  console.log(paramError.responseText);
               }
            }

            function handleSuccess() {
               $("#inp-contactName").val("");
               $("#inp-contactTitle").val("");
               $("#inp-address").val("");
               $("#inp-mobile").val("");
               $("#inp-email").val("");
               $("#inp-note").val("");

               toastr.success("Tạo Thành Công");
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

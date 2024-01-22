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
                  callApiCreateUtilities(vData);
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

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api tạo Utilities
            function callApiCreateUtilities(paramData) {
               $.ajax({
                  type: "POST",
                  headers: gHeader,
                  url: `/utilities/post`,
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
               vData.name = $("#inp-name").val().trim();
               vData.description = $("#inp-description").val().trim();
               vData.address = $("#inp-address").val().trim();
               //Lấy tên hình ảnh để lưu vào DB
               let vUrlPhoto = $("#inp-filePhoto").val();
               if (vUrlPhoto == "") {
                  vData.photo = null;
               } else {
                  vData.photo = vUrlPhoto.split("\\").pop();
               }
               return vData;
            }

            // ------------------------------ VALIDATE ----------------------------------------------
            function validateData() {
               let vName = $("#inp-name");

               vName.on("input", function () {
                  $(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  $(".note-error").removeClass("d-none");
                  return false;
               }

               return true;
            }

            function handleFaile(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
               } else {
                  console.log(paramError);
               }
            }

            function handleSuccess() {
               $("#inp-name").val("");
               $("#inp-description").val("");
               $("#inp-address").val("");
               $("#inp-filePhoto").val("");
               $("#wrapper-photo").empty();

               toastr.success("Tạo Thành Công");
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

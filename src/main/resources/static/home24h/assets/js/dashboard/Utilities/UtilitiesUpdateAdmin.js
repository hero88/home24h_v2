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
            var gUtilitiesIdClick;

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/home/home.html`;
            });

            // --------------------- UPDATE ------------------------------------
            $("#btn-update").on("click", function () {
               let vData = getDataForm();
               if (validateData()) {
                  callApiUpdateUtilities(vData);
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
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               //Lấy id Utilities trên Url
               let vUrl = window.location.href;
               let vUrlString = new URL(vUrl);
               gUtilitiesIdClick = vUrlString.searchParams.get("id");
               //gọi Api Utilities by Id
               callApiUtilitiesById(gUtilitiesIdClick);
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api update Utilities
            function callApiUpdateUtilities(paramData) {
               $.ajax({
                  type: "PUT",
                  header: gHeader,
                  url: `/utilities/put/${gUtilitiesIdClick}`,
                  contentType: "application/json",
                  data: JSON.stringify(paramData),
                  success: function (res) {
                     toastr.success("Cập nhật Thành Công");
                  },
                  error: function (xhr) {
                     handleFaile(xhr);
                  },
               });
            }

            //Gọi API Utilities bới Id
            function callApiUtilitiesById(paramId) {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/utilities/get/${paramId}`,
                  success: function (res) {
                     loadDataToForm(res);
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
               let vUrlPhoto = $("#wrapper-photo img").attr("src");
               vData.photo = vUrlPhoto.split("/").pop();
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

            // ------------------------------ LOAD ----------------------------------------------
            function loadDataToForm(paramData) {
               $("#inp-name").val(paramData.name);
               $("#inp-description").val(paramData.description);
               $("#inp-address").val(paramData.address);
               $("#wrapper-photo").append(`
               <img src="/images/${paramData.photo}" class="img-fluid">
            `);
            }

            function handleFaile(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
                  console.log;
               } else {
                  console.log(xhr);
               }
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

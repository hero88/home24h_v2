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
// async function checkToken() {
//    const gInfoUser = JSON.parse(localStorage.getItem("home24h"));
//    if (gInfoUser == null) {
//       window.location.href = `../../UserPage/home/home.html`;
//    } else {
//       const gHeader = {
//          Authorization: "Bearer " + gInfoUser.accessToken,
//       };
//       try {
//          await callApiAdminOrModeratorAccess(gHeader);
//       } catch (error) {
//          window.location.href = `../../UserPage/home/home.html`;
//       }
//    }
// }

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
            var gContractorId;

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/home/home.html`;
            });

            // --------------------- ADD ------------------------------------
            $("#btn-update").on("click", function () {
               let vData = getDataForm();
               if (validateData()) {
                  callApiUpdateContactor(vData);
               }
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);

               //Lấy id contractor trên Url
               let vUrl = window.location.href;
               let vUrlString = new URL(vUrl);
               gContractorId = vUrlString.searchParams.get("id");
               //gọi Api contractor by Id
               callApiContractorById(gContractorId);
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api tạo Contractor
            function callApiUpdateContactor(paramData) {
               $.ajax({
                  type: "PUT",
                  headers: gHeader,
                  url: `/contractor/put/${gContractorId}`,
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

            //Gọi API contractor bới Id
            function callApiContractorById(paramId) {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/contractor/get/${paramId}`,
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
               vData.phone = $("#inp-phone").val().trim();
               vData.phone2 = $("#inp-phone2").val().trim();
               vData.fax = $("#inp-fax").val().trim();
               vData.email = $("#inp-email").val().trim();
               vData.website = $("#inp-website").val().trim();
               vData.note = $("#inp-note").val().trim();
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
               $("#inp-phone").val(paramData.phone);
               $("#inp-phone2").val(paramData.phone2);
               $("#inp-fax").val(paramData.fax);
               $("#inp-email").val(paramData.email);
               $("#inp-website").val(paramData.website);
               $("#inp-note").val(paramData.note);
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

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
            var gRegionLinkIdClick;
            let  gImageCreate = [];
            let gImageNameStrOld = [];

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
                  callApiUpdateRegionLink(vData);
               }
            });

            // --------------------- PHOTO ------------------------------------
            //Khi click sự kiện thay đổi hình ảnh
            $("#inp-filePhoto").on("change", function () {
               let fileInput = $(this)[0];
               if(fileInput.files.length  > 0){                
                  let selectedFile = fileInput.files[0];
                  if(selectedFile.type.startsWith('image/')){
                     gImageCreate = [];
                     $("#wrapper-photo").empty();

                     let reader = new FileReader();
                     reader.onload = function(e) {
                        // Hiển thị hình ảnh trong một thẻ img
                        $("#wrapper-photo").append(`
                        <img src="${e.target.result}" class="img-fluid">
                     `);
                     };
                     reader.readAsDataURL(selectedFile);
                     gImageCreate.push(selectedFile)
                  }
               }
            });
            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               //Lấy id regionlink trên Url
               let vUrl = window.location.href;
               let vUrlString = new URL(vUrl);
               gRegionLinkIdClick = vUrlString.searchParams.get("id");
               //gọi Api RegionLink by Id
               callApiRegionLinkById(gRegionLinkIdClick);
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api update RegionLink
            function callApiUpdateRegionLink(paramData) {

               let vFormData = new FormData();
               for(let key in paramData){
                  vFormData.append(key, paramData[key])
               }

               if(gImageCreate[0]){
                  vFormData.append("imageCreate", gImageCreate[0]);
                  vFormData.append("imgeNameStrOldRemove", gImageNameStrOld);
               }

               $.ajax({
                  type: "PUT",
                  headers: gHeader,
                  url: `/regionLink/put/${gRegionLinkIdClick}`,
                  data: vFormData,
                  processData: false, // Không xử lý dữ liệu
                  contentType: false, // Không đặt loại nội dung
                  success: function (res) {
                     toastr.success("Cập nhật Thành Công");
                  },
                  error: function (xhr) {
                     handleFaile(xhr);
                  },
               });
            }

            //Gọi API RegionLink bới Id
            function callApiRegionLinkById(paramId) {
               $.ajax({
                  type: "GET",
                  headers: gHeader,
                  url: `/regionLink/get/${paramId}`,
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
               gImageNameStrOld.push(paramData.photo);
            }

            function handleFaile(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
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

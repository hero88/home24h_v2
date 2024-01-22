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
            let vId;
            let  gImageCreate = [];
            let gImageNameStrOld = [];

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
                  callApiUpdateLayout(vData);
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
               handleLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------
            //Gọi Api tạo RegionLink
            function callApiUpdateLayout(paramData) {

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
                  url: `/layout/put/${vId}/${paramData.projectId}`,
                  data: vFormData,
                  processData: false, // Không xử lý dữ liệu
                  contentType: false, // Không đặt loại nội dung
                  success: function (res) {
                     gImageNameStrOld = res.photo;
                     gImageCreate = [];
                     handleSuccess();
                  },
                  error: function (xhr) {
                     handleFaile(xhr);
                  },
               });
            }

            function callApiAllProject() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/project/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            function callApiLayoutById(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/layout/get/${paramId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            // ------------------------------ GET ----------------------------------------------
            function getDataForm() {
               let vData = {};
               vData.name = $("#inp-name").val().trim();
               vData.description = $("#inp-description").val().trim();
               vData.projectId = $("#select-project").val();
               return vData;
            }

            // ------------------------------ VALIDATE ----------------------------------------------
            function validateData() {
               let vName = $("#inp-name");
               let vProject = $("#select-project");

               vName.on("input", function () {
                  $(".note-error").addClass("d-none");
               });

               if (vName.val() == "") {
                  vName.siblings("span").removeClass("d-none");
                  return false;
               }

               vProject.on("change", function () {
                  if (vProject.val() != 0) {
                     $(".note-error").addClass("d-none");
                  }
               });

               if (vProject.val() == "0") {
                  vProject.siblings("span").removeClass("d-none");
                  return false;
               }

               return true;
            }

            // ------------------------------ HANDLE ----------------------------------------------
            async function handleLoading() {
               let vUrlStr = new URL(window.location.href);
               vId = vUrlStr.searchParams.get("id");
               let [vProject, vLayoutById] = await Promise.all([callApiAllProject(), callApiLayoutById(vId)]);

               vProject.forEach((element) =>
                  $("#select-project").append(`
                    <option value="${element.id}">${element.name}</option>
               `)
               );

               $("#inp-name").val(vLayoutById.name);
               $("#inp-description").val(vLayoutById.description);
               $("#select-project option")
                  .filter(function () {
                     return $(this).text() === vLayoutById.projectName;
                  })
                  .prop("selected", true);
               $("#wrapper-photo").append(`
                  <img src="/images/${vLayoutById.photo}" style="max-width:400px"/>
                `);

               gImageNameStrOld.push(vLayoutById.photo);
            }

            function handleFaile(paramError) {
               if (paramError.status == "400") {
                  toastr.error(paramError.responseText);
                  console.log;
               } else {
                  console.log(paramError.responseText);
               }
            }

            function handleSuccess() {
               toastr.success("Cập Nhật Thành Công");
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

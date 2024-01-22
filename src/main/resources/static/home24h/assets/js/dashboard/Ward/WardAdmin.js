const gLocalhostUrl = "http://localhost:8080";
// var gHeader;

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
            var vTable = $("#ward-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            let gWardIdClick;

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/home/home.html`;
            });

            // --------------------- SEARCH --------------------------------
            $("#select-province").on("change", async function () {
               let vProvinceId = $(this).val();

               let vSelectDistrict = $("#select-district");
               vSelectDistrict.empty();
               vSelectDistrict.append(`
                       <option value="0">Chọn Quận/Huyện</option>
                  `);
               let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
               loadSelectDistrict(vDistrict);

               vTable = loadTable(getDataFindToUrl());
            });

            $("#select-district").on("change", async function () {
               vTable = loadTable(getDataFindToUrl());
            });

            // --------------------- UPDATE --------------------------------
            $("#ward-table").on("click", ".btn-update", function (event) {
               getDataRow(this);
               window.location.href = `../WardAdmin/WardUpdateAdmin.html?wardId=${gWardIdClick}`;
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#ward-table").on("click", ".btn-delete", function (event) {
               getDataRow(this);
               $("#deleteWard-modal").modal("show");
            });

            //Khi ấn nút xóa trên modal
            $("#btn-delete-modal").on("click", function () {
               callApiDeleteWard(gWardIdClick).then(function (res) {
                  toastr.success("Xóa Thành Công");
                  $("#deleteWard-modal").modal("hide");
                  vTable.ajax.reload(null, false);
               });
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               handleLoading();
               //    vTable = loadTable(getDataFindToUrl());
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------

            function callApiDeleteWard(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "DELETE",
                     url: `/ward/delete/${paramId}`,
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

            function callApiAllProvince() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     url: `/province/get/allProvince`,
                     type: "GET",
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi danh sách District by ProvinceId
            function callApiDistrictByProvinceId(paramProvinceId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/district/get/${paramProvinceId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            // ----------------------------------------------------------------------------------------

            function loadTable(url) {
               vTable.destroy();
               return $("#ward-table").DataTable({
                  processing: true,
                  serverSide: true,
                  autoWidth: false,
                  searching: false,

                  ajax: {
                     url: url,
                     data: function (d) {
                        d.size = d.length;
                        d.page = Math.floor(d.start / d.length);
                        return d;
                     },
                     beforeSend: function (xhr) {
                        for (key in gHeader) {
                           xhr.setRequestHeader(key, gHeader[key]);
                        }
                     },

                     dataType: "json",
                     dataSrc: function (json) {
                        json.recordsFiltered = json.totalElements;
                        json.recordsTotal = json.totalElements;

                        return json.content;
                     },
                  },

                  columns: [
                     { data: "id" },
                     { data: "provinceName" },
                     { data: "districtName" },
                     { data: "name" },
                     { data: "prefix" },
                     { data: "Cập Nhật" },
                  ],
                  columnDefs: [
                     { targets: [0, 1, 2, 3, 4, 5], class: "text-center" },

                     {
                        targets: 5,
                        defaultContent: `<i class=" fa-sharp fa-solid fa-pen-to-square btn-update text-info" title="Sửa" style="cursor: pointer"></i>&nbsp;&nbsp;&nbsp;
                            <i class=" fa-solid fa-trash btn-delete text-danger" title="Xóa" style="cursor: pointer"></i>`,
                     },
                  ],
               });
            }

            // -----------------------------------------------------------------

            //Lấy id của Row trên table
            function getDataRow(paramBtn) {
               let vTrClick = $(paramBtn).closest("tr");
               let vDataRow = vTable.row(vTrClick).data();
               gWardIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vProvinceId = $("#select-province").val();
               let vDistrictId = $("#select-district").val();
               let vUrl = `/ward/get/allDetailWard?provinceId=${vProvinceId}&districtId=${vDistrictId}`;
               return vUrl;
            }

            // --------------------------LOAD-----------------------------------
            function loadSelectProvince(paramData) {
               paramData.forEach((element) => {
                  $("#select-province").append(`
                        <option value="${element.id}">${element.name}</option>
                    `);
               });
            }

            function loadSelectDistrict(paramData) {
               paramData.forEach((element) => {
                  $("#select-district").append(`
                         <option value="${element.id}">${element.name}</option>
                     `);
               });
            }

            // --------------------------HANDLE-----------------------------------
            async function handleLoading() {
               let vProvince = await callApiAllProvince();
               loadSelectProvince(vProvince);
               vTable = loadTable(getDataFindToUrl());
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

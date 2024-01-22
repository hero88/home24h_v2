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
            var vTable = $("#province-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            let gProvinceIdClick;

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/home/home.html`;
            });

            // --------------------- SEARCH --------------------------------
            $("#inp-searchName").on("input", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            $("#sort-table").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            // --------------------- UPDATE --------------------------------
            $("#province-table").on("click", ".btn-update", function (event) {
               getDataRow(this);
               window.location.href = `../ProvinceAdmin/ProvinceUpdateAdmin.html?provinceId=${gProvinceIdClick}`;
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#province-table").on("click", ".btn-delete", function (event) {
               getDataRow(this);
               $("#deleteProvince-modal").modal("show");
            });

            //Khi ấn nút xóa trên modal
            $("#btn-delete-modal").on("click", function () {
               callApiDeleteProvince(gProvinceIdClick).then(function (res) {
                  toastr.success("Xóa Thành Công");
                  $("#deleteProvince-modal").modal("hide");
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

            function callApiDeleteProvince(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "DELETE",
                     url: `/province/delete/${paramId}`,
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

            function callApiListSort() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     url: `/enum/eSort/all`,
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

            // ----------------------------------------------------------------------------------------

            function loadTable(url) {
               vTable.destroy();
               return $("#province-table").DataTable({
                  processing: false,
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
                     { data: "totalProject" },
                     { data: "totalRealestates" },
                     { data: "name" },
                     { data: "code" },
                     { data: "Cập Nhật" },
                  ],
                  columnDefs: [
                     { targets: [0, 1, 2, 3, 4, 5], class: "text-center" },
                     {
                        targets: 1,
                        render: function (data, type, row, meta) {
                           return `<a   href="../ProjectAdmin/ProjectAdmin.html?provinceId=${row.id}" class="btn btn-info">${data}</a>`;
                        },
                     },

                     {
                        targets: 2,
                        render: function (data, type, row, meta) {
                           return `<a  href="../RealestateAdmin/realestateAdmin.html?provinceId=${row.id}" class="btn btn-info">${data}</a>`;
                        },
                     },

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
               gProvinceIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vName = $("#inp-searchName").val();
               let vSort = $("#sort-table").val();
               let vUrl = `/province/get/allDetailProvince?name=${vName}&sort=${vSort}`;
               return vUrl;
            }

            // --------------------------LOAD-----------------------------------
            function loadSelectSort(paramData) {
               paramData.forEach((element) => {
                  $("#sort-table").append(`
                        <option value="${element.value}">${element.name}</option>
                    `);
               });
            }

            // --------------------------HANDLE-----------------------------------
            async function handleLoading() {
               let vListSort = await callApiListSort();
               loadSelectSort(vListSort);
               vTable = loadTable(getDataFindToUrl());
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

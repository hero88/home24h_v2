const gLocalhostUrl = "http://localhost:8080";
// var gHeader;

checkToken();

//gọi API kiểm tra quyền đăng nhập
function callApiAdminAccess(paramHeader) {
   return new Promise(function (resolve, reject) {
      $.ajax({
         type: "GET",
         async: false,
         headers: paramHeader,
         url: `/users/admin`,
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
         await callApiAdminAccess(gHeader);
         $(document).ready(function () {
            var vTable = $("#user-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            let gUserIdClick;
            let gDataAllRole;

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

            $("#select-searchRole").on("change", function () {
               console.log(123);
               vTable = loadTable(getDataFindToUrl());
            });

            // --------------------- UPDATE --------------------------------
            $("#user-table").on("click", ".btn-update", function (event) {
               getDataRow(this);
               window.location.href = `../UserAdmin/UserUpdateAdmin.html?id=${gUserIdClick}`;
            });

            $("#user-table").on("change", ".select-userRole", function (event) {
               getDataRow(this);

               let vRole = $(this).val();
               callApiUpdateRole(vRole).then(function (res) {
                  toastr.success("Cập Nhật Thành Công");
                  vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
               });
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#user-table").on("click", ".btn-delete", function (event) {
               getDataRow(this);
               $("#deleteUser-modal").modal("show");
            });

            //Khi ấn nút xóa trên modal
            $("#btn-delete-modal").on("click", async function () {
               callApiDeleteUser().then(function (res) {
                  $("#deleteUser-modal").modal("hide");
                  toastr.success("Xóa Thành Công");
                  vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
               });
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               handeLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------

            function callApiDeleteUser() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     url: `/user/delete/${gUserIdClick}`,
                     headers: gHeader,
                     type: "DELETE",
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            function callApiAllRole() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     url: `/enum/eRole/all`,
                     headers: gHeader,
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

            function callApiUpdateRole(paramRole) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     url: `/user/updateRole/${gUserIdClick}?roleUpdate=${paramRole}`,
                     headers: gHeader,
                     type: "PUT",
                     contentType: "application/json",
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
               return $("#user-table").DataTable({
                  processing: false,
                  serverSide: true,
                  autoWidth: true,
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
                     { data: "username" },
                     { data: "email" },
                     { data: "phone" },
                     { data: "address" },
                     { data: "userRole" },
                     { data: "Cập Nhật" },
                  ],
                  columnDefs: [
                     { targets: [0, 1, 2, 3, 4, 5, 6], class: "text-center" },

                     {
                        targets: 5,
                        render: function (data, type, row, meta) {
                           let vOption;
                           gDataAllRole.forEach(function (element) {
                              let selected = element.value === data ? "selected" : "";
                              vOption += `<option value="${element.value}" ${selected}>${element.name}</option>`;
                           });
                           let vSelect = `<select class="form-control select-userRole" style="width:150px">${vOption}</select>`;

                           return vSelect;
                        },
                     },

                     {
                        targets: 6,
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
               gUserIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vName = $("#inp-searchName").val();
               let vRole = $("#select-searchRole").val();
               let vUrl = `/user/get/allUser?name=${vName}&roleStr=${vRole}`;
               return vUrl;
            }

            // -----------------------------------------------------------------
            async function handeLoading() {
               let vAllRole = await callApiAllRole();
               gDataAllRole = vAllRole;
               vAllRole.forEach((element) =>
                  $("#select-searchRole").append(`
                    <option value="${element.value}">${element.name}</option>
               `)
               );
               vTable = loadTable(getDataFindToUrl());
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

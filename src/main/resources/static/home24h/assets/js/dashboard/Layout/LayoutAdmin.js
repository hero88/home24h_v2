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
            var vTable = $("#layout-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            var gLayoutIdClick;

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/home/home.html`;
            });

            // --------------------- SEARCH --------------------------------
            $("#select-searchProject").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            // --------------------- UPDATE --------------------------------
            $("#layout-table").on("click", ".btn-update", function (event) {
               event.stopPropagation();
               getDataRow(this);
               window.location.href = `../LayoutAdmin/LayoutUpdateAdmin.html?id=${gLayoutIdClick}`;
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#layout-table").on("click", ".btn-delete", function (event) {
               event.stopPropagation();
               getDataRow(this);
               $("#deleteLayout-modal").modal("show");
            });

            // --------------------- DETAIL --------------------------------
            //Khi click vào tr trên table
            $("#layout-table").on("click", "tr", function () {
               var vRowTable = vTable.row($(this));

               //Nếu hàng con đã hiển thị thì ẩn nó đi
               if (vRowTable.child.isShown()) {
                  vRowTable.child.hide();
                  $(this).removeClass("shown");
               } else {
                  $(this).addClass("shown");
                  vRowTable.child(showInfoInRowChild(vRowTable.data())).show();
               }
            });

            //Khi ấn nút xóa trên modal
            $("#btn-delete-modal").on("click", function () {
               callApiDeleteLayout();
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               callApiAllProject();

               vTable = loadTable(getDataFindToUrl());
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------

            function callApiDeleteLayout() {
               $.ajax({
                  url: `/layout/delete/${gLayoutIdClick}`,
                  headers: gHeader,
                  type: "DELETE",
                  success: function (res) {
                     $("#deleteLayout-modal").modal("hide");
                     toastr.success("Xóa Thành Công");
                     vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
                  },
                  error: function (xhr) {
                     console.log(xhr);
                  },
               });
            }

            function callApiAllProject() {
               $.ajax({
                  url: `/project/get/all`,
                  headers: gHeader,
                  type: "GET",
                  success: function (res) {
                     loadSelectProject(res);
                  },
                  error: function (xhr) {
                     console.log(xhr);
                  },
               });
            }

            // -----------------------------------LOAD----------------------------------------------------

            function loadTable(url) {
               var currentPageStartIndex = 0;
               console.log(url);

               vTable.destroy();
               return $("#layout-table").DataTable({
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
                        console.log(json);
                        json.recordsFiltered = json.totalElements;
                        json.recordsTotal = json.totalElements;
                        json.start = currentPageStartIndex;

                        return json.content;
                     },
                  },

                  columns: [
                     { data: "id" },
                     { data: "name" },
                     { data: "projectName" },
                     { data: "photo" },
                     { data: "Cập Nhật" },
                  ],
                  columnDefs: [
                     { targets: [0, 1, 2, 3, 4], class: "text-center" },
                     {
                        targets: 0,
                        render: function (data, type, row, meta) {
                           // Sử dụng meta.row để lấy chỉ số của hàng
                           return currentPageStartIndex + meta.row + 1;
                        },
                     },
                     {
                        targets: 3,
                        render: function (data) {
                           return `<img src="/images/${data}" style="width:100px">`;
                        },
                     },
                     {
                        targets: 4,
                        defaultContent: `
                           <div>
                           <button class="btn mb-1 btn-update" style="background-color:#FFA500; color: white; width:clamp(60px, 130px, 200px)">Cập Nhật</button>
                           </div>
                           <div>
                           <button class="btn mt-1 btn-delete" style="background-color:#DC143C; color:white; width:clamp(60px, 130px, 200px) !important">Xóa</button>
                           </div>`,
                     },
                  ],

                  preDrawCallback: function (settings) {
                     var api = new $.fn.dataTable.Api(settings);
                     currentPageStartIndex = api.page.info().start;
                  },
               });
            }

            function loadSelectProject(paramData) {
               paramData.forEach((element) =>
                  $("#select-searchProject").append(`
                  <option value="${element.id}">${element.name}</option>
               `)
               );
            }

            //Show thông tin hàng con trong table
            function showInfoInRowChild(paramObj) {
               return `
                     <table class="table" style="background-color: white">
                     <tbody>
                        <tr>
                           <td>Mô Tả</td> 
                           <td> ${paramObj.description}</td>
                        </tr>
                        </tbody>
                     </table>          
                  `;
            }

            // -----------------------------------------------------------------

            //Lấy id của Row trên table
            function getDataRow(paramBtn) {
               let vTrClick = $(paramBtn).closest("tr");
               let vDataRow = vTable.row(vTrClick).data();
               gLayoutIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vProjectId = $("#select-searchProject").val();
               let vUrl = `/layout/get/allLayout/${vProjectId}`;
               return vUrl;
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

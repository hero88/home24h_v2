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
            var vTable = $("#designUnit-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            var gDesignUnitIdClick;

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

            // --------------------- UPDATE --------------------------------
            $("#designUnit-table").on("click", ".btn-update", function (event) {
               event.stopPropagation();

               getDataRow(this);
               window.location.href = `../DesignUnitAdmin/DesignUnitUpdateAdmin.html?id=${gDesignUnitIdClick}`;
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#designUnit-table").on("click", ".btn-delete", function (event) {
               event.stopPropagation();
               getDataRow(this);
               $("#deleteDesignUnit-modal").modal("show");
            });

            // --------------------- DETAIL --------------------------------
            //Khi ấn nút xóa trên table
            $("#designUnit-table").on("click", "tr", function () {
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
               callApiDeleteDesignUnit();
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);

               vTable = loadTable(getDataFindToUrl());
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------

            function callApiDeleteDesignUnit() {
               $.ajax({
                  url: `/designUnit/delete/${gDesignUnitIdClick}`,
                  headers: gHeader,
                  type: "DELETE",
                  success: function (res) {
                     $("#deleteDesignUnit-modal").modal("hide");
                     toastr.success("Xóa Thành Công");
                     vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
                  },
                  error: function (xhr) {
                     console.log(xhr);
                  },
               });
            }

            // ----------------------------------------------------------------------------------------

            function loadTable(url) {
               var currentPageStartIndex = 0;
               console.log(url);

               vTable.destroy();
               return $("#designUnit-table").DataTable({
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
                        console.log(json);
                        json.recordsFiltered = json.totalElements;
                        json.recordsTotal = json.totalElements;
                        json.start = currentPageStartIndex;
                        json.start = currentPageStartIndex;

                        return json.content;
                     },
                  },

                  columns: [
                     { data: "id" },
                     { data: "name" },
                     { data: "address" },
                     { data: "phone" },
                     { data: "phone2" },
                     { data: "fax" },
                     { data: "email" },
                     { data: "Cập Nhật" },
                  ],
                  columnDefs: [
                     { targets: [0, 1, 2, 3, 4, 5, 6, 7], class: "text-center" },
                     {
                        targets: 0,
                        render: function (data, type, row, meta) {
                           // Sử dụng meta.row để lấy chỉ số của hàng
                           return currentPageStartIndex + meta.row + 1;
                        },
                     },
                     {
                        targets: 7,
                        defaultContent: `
                           <div>
                           <button class="btn mb-1 btn-update" style="background-color:#FFA500; color: white; width:clamp(60px, 50%, 200px)">Cập Nhật</button>
                           </div>
                           <div>
                           <button class="btn mt-1 btn-delete" style="background-color:#DC143C; color:white; width:clamp(60px, 50%, 200px) !important">Xóa</button>
                           </div>`,
                     },
                  ],

                  preDrawCallback: function (settings) {
                     var api = new $.fn.dataTable.Api(settings);
                     currentPageStartIndex = api.page.info().start;
                  },
               });
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
               gDesignUnitIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vName = $("#inp-searchName").val();
               let vUrl = `/designUnit/get/allDesignUnit?name=${vName}`;
               return vUrl;
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

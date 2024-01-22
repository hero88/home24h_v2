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
            var vTable = $("#project-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            var gProjectIdClick;

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

            //Khi select Province thay đổi
            $("#select-searchProvince").on("change", async function () {
               vTable = loadTable(getDataFindToUrl());

               $("#select-searchDistrict").empty();
               $("#select-searchDistrict").append(`
                              <option value="0">Tất Cả Quận</option>`);

               let vProvinceId = $(this).val();
               if (vProvinceId != 0) {
                  let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
                  loadSelect(vDistrict, "select-searchDistrict");
               }
            });

            //Khi select District thay đổi
            $("#select-searchDistrict").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            // --------------------- UPDATE --------------------------------
            $("#project-table").on("click", ".btn-update", function (event) {
               event.stopPropagation();
               getDataRow(this);
               window.location.href = `../ProjectAdmin/ProjectUpdateAdmin.html?id=${gProjectIdClick}`;
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#project-table").on("click", ".btn-delete", function (event) {
               event.stopPropagation();
               getDataRow(this);
               $("#deleteProject-modal").modal("show");
            });

            //Khi ấn nút xóa trên modal
            $("#btn-delete-modal").on("click", function () {
               callApiDeleteProject();
            });

            // --------------------- DETAIL --------------------------------
            //Khi click vào tr trên table
            $("#project-table").on("click", "tr", function () {
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

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               $(".info").find("a").html(gInfoUser.username);
               handleLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------

            function callApiDeleteProject() {
               $.ajax({
                  url: `/project/delete/${gProjectIdClick}`,
                  headers: gHeader,
                  type: "DELETE",
                  success: function (res) {
                     $("#deleteProject-modal").modal("hide");
                     toastr.success("Xóa Thành Công");
                     vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
                  },
                  error: function (xhr) {
                     console.log(xhr);
                  },
               });
            }

            //Gọi tất cả All Province
            function callApiAllProvince() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/province/get/allProvince`,
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

            // ---------------------------------LOAD-------------------------------------------------------

            function loadTable(url) {
               var currentPageStartIndex = 0;

               vTable.destroy();
               return $("#project-table").DataTable({
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
                        json.start = currentPageStartIndex;

                        return json.content;
                     },
                  },

                  columns: [
                     { data: "id" },
                     { data: "name" },
                     { data: "provinceName" },
                     { data: "districtName" },
                     { data: "wardName" },
                     { data: "acreage" },
                     { data: "constructArea" },
                     { data: "numApartment" },
                     { data: "investorName" },
                     { data: "contractorName" },
                     { data: "designUnitName" },
                     { data: "totalRealestates" },
                     { data: "Cập Nhật" },
                  ],
                  columnDefs: [
                     { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], class: "text-center" },
                     {
                        targets: 0,
                        render: function (data, type, row, meta) {
                           // Sử dụng meta.row để lấy chỉ số của hàng
                           return currentPageStartIndex + meta.row + 1;
                        },
                     },
                     {
                        targets: 12,
                        defaultContent: `<i class=" fa-sharp fa-solid fa-pen-to-square btn-update text-info" title="Sửa" style="cursor: pointer"></i>&nbsp;&nbsp;&nbsp;
                       <i class=" fa-solid fa-trash btn-delete text-danger" title="Xóa" style="cursor: pointer"></i>`,
                     },
                  ],

                  preDrawCallback: function (settings) {
                     var api = new $.fn.dataTable.Api(settings);
                     currentPageStartIndex = api.page.info().start;
                  },
               });
            }

            function loadSelect(paramData, paramAppend) {
               paramData.forEach((element) =>
                  $(`#${paramAppend}`).append(`
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

            // --------------------------GET---------------------------------------

            //Lấy id của Row trên table
            function getDataRow(paramBtn) {
               let vTrClick = $(paramBtn).closest("tr");
               let vDataRow = vTable.row(vTrClick).data();
               gProjectIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vName = $("#inp-searchName").val().trim();
               let vProvinceId = $("#select-searchProvince").val();
               let vDistrictId = $("#select-searchDistrict").val();
               let vUrl = `/project/get/allProject?name=${vName}&provinceId=${vProvinceId}&districtId=${vDistrictId}`;
               return vUrl;
            }

            // --------------------------HANDLE---------------------------------------
            async function handleLoading() {
               let [vProvince] = await Promise.all([callApiAllProvince()]);
               loadSelect(vProvince, "select-searchProvince");

               let vUrlStr = new URL(window.location.href);
               let vProvinceId = vUrlStr.searchParams.get("provinceId");
               let vDistrictId = vUrlStr.searchParams.get("districtId");
               if (vProvinceId != null) {
                  $("#select-searchProvince").val(vProvinceId);
                  let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
                  loadSelect(vDistrict, "select-searchDistrict");

                  if (vDistrictId != null) {
                     $("#select-searchDistrict").val(vDistrictId);
                  }
               }

               vTable = loadTable(getDataFindToUrl());
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

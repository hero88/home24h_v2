//---------------------- INPUT NUMBER --------------------------
function validateInputMax1Decimal(input) {
   var decimalValue = input.value;

   // Kiểm tra xem giá trị có phải là số thập phân với tối đa 2 chữ số phần thập phân hay không? Nếu không thì thực hiện code
   if (!/^\d+(\.\d{0,1})?$/.test(decimalValue)) {
      // Xóa chữ số thập phân thứ ba và sau đó cập nhật lại giá trị nhập vào
      input.value = decimalValue.slice(0, decimalValue.indexOf(".") + 2);
   }
}

function isPositiveDecimal(event) {
   var charCode = event.which ? event.which : event.keyCode;
   var inputValue = event.target.value;

   // Kiểm tra xem ký tự được nhập có phải là số (0-9), dấu chấm (.) và là ký tự đầu tiên
   if (
      (charCode >= 48 && charCode <= 57) || // Số từ 0 đến 9
      (charCode === 46 && inputValue.indexOf(".") === -1) || // Dấu chấm (.) chỉ được nhập một lần
      charCode === 8 // Phím xóa (Backspace)
   ) {
      return true; // Cho phép nhập ký tự
   }

   return false; // Không cho phép nhập ký tự
}

function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

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

// Kiểm tra token User có quyên đăng nhập không ?
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
            var vTable = $("#realestates-table").DataTable({});

            /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
            var gRealestatesIdClick;
            let vDataStatus;

            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            //Sự kiện khi click Đăng xuất
            $("#logout").on("click", function () {
               localStorage.removeItem("home24h");
               window.location.href = `../../UserPage/Home/Home.html`;
            });

            // --------------------- SEARCH --------------------------------
            //Khi select Status thay đổi
            $("#select-searchStatus").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            //Khi select Request thay đổi
            $("#select-searchRequest").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            //Khi select Type thay đổi
            $("#select-searchType").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            //Khi select Province thay đổi
            $("#select-searchProvince").on("change", async function () {
               vTable = loadTable(getDataFindToUrl());

               $("#select-searchDistrict").empty();
               $("#select-searchDistrict").append(`
                  <option value="0">Chọn Quận/Huyện</option>`);

               $("#select-searchWard").empty();
               $("#select-searchWard").append(`
                  <option value="0">Chọn Phường/Xã</option>`);

               let vProvinceId = $(this).val();
               if (vProvinceId != 0) {
                  let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
                  loadAllDistrictByProvinceId(vDistrict);
               }
            });

            //Khi select District thay đổi
            $("#select-searchDistrict").on("change", async function () {
               vTable = loadTable(getDataFindToUrl());

               $("#select-searchWard").empty();
               $("#select-searchWard").append(`
                  <option value="0">Chọn Phường/Xã</option>`);

               let vDistrictId = $(this).val();
               if (vDistrictId != 0) {
                  let vWard = await callApiWardByDistrictId(vDistrictId);
                  loadAllWardByDistrictId(vWard);
               }
            });

            //Khi select Ward thay đổi
            $("#select-searchWard").on("change", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            //Khi input MinPrice thay đổi
            $("#inp-searchMinPrice").on("input", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            //Khi input MinPrice thay đổi
            $("#inp-searchMaxPrice").on("input", function () {
               vTable = loadTable(getDataFindToUrl());
            });

            // --------------------- SELECT STATUS TABLE --------------------------------
            $("#realestates-table").on("click", ".select-status", function (e) {
               e.stopPropagation();
            });

            $("#realestates-table").on("change", ".select-status", function (e) {
               getDataRow(this);
               let vStatus = $(this).val();
               callApiUpdateStatus(vStatus, gRealestatesIdClick)
                  .then(function (res) {
                     toastr.success("Cập Nhật Thành Công");
                     vTable.ajax.reload(null, false);
                  })
                  .catch(function (xhr) {
                     console.log(xhr);
                  });
            });

            // --------------------- UPDATE --------------------------------
            $("#realestates-table").on("click", ".btn-update", function (event) {
               event.stopPropagation();
               getDataRow(this);
               window.location.href = `../RealestateAdmin/RealestateUpdateAdmin.html?id=${gRealestatesIdClick}`;
            });

            // --------------------- DELETE --------------------------------
            //Khi ấn nút xóa trên table
            $("#realestates-table").on("click", ".btn-delete", function (event) {
               event.stopPropagation();
               getDataRow(this);
               $("#deleteRealestate-modal").modal("show");
            });

            //Khi ấn nút xóa trên modal
            $("#btn-delete-modal").on("click", async function () {
               await callApiDeleteRealestates();
               $("#deleteRealestate-modal").modal("hide");
               toastr.success("Xóa BĐS Thành Công");
               vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
            });

            // --------------------- DETAIL --------------------------------
            //Khi ấn nút xóa trên table
            $("#realestates-table").on("click", "tr", function () {
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

               // Xử lý khi tải trang, load thông tin vào table theo Search
               handleLoading();
            }

            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // ------------------------------ CALL API ----------------------------------------------

            function callApiDeleteRealestates() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     url: `/realestates/delete/${gRealestatesIdClick}`,
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

            //Gọi Api cập nhật status
            function callApiUpdateStatus(paramStatus, paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     headers: gHeader,
                     url: `/realestates/update/${paramStatus}/${paramId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
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

            //Gọi danh sách Ward by DistrictId
            function callApiWardByDistrictId(paramDistrictId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/ward/get/${paramDistrictId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi danh sách Type
            function callApiAllType() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/enum/eType/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi danh sách Request
            function callApiAllRequest() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/enum/eRequest/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi danh sách Progress
            function callApiAllStatus() {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     url: `/enum/eStatus/get/all`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            // ------------------------------------------HANDLE--------------------------------------------
            async function handleLoading() {
               let [vStatus, vRequest, vType, vProvince] = await Promise.all([
                  callApiAllStatus(),
                  callApiAllRequest(),
                  callApiAllType(),
                  callApiAllProvince(),
               ]);

               vDataStatus = vStatus;

               loadAllStatus(vStatus);
               loadAllRequest(vRequest);
               loadAllType(vType);
               loadAllProvince(vProvince);

               let vUrlStr = new URL(window.location.href);
               let vProvinceId = vUrlStr.searchParams.get("provinceId");
               let vDistrictId = vUrlStr.searchParams.get("districtId");
               if (vProvinceId != null) {
                  $("#select-searchProvince").val(vProvinceId);
                  let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
                  loadAllDistrictByProvinceId(vDistrict);

                  if (vDistrictId != null) {
                     $("#select-searchDistrict").val(vDistrictId);
                     let vWard = await callApiWardByDistrictId(vDistrictId);
                     loadAllWardByDistrictId(vWard);
                  }
               }

               vTable = loadTable(getDataFindToUrl());
            }

            // ------------------------------------------LOAD--------------------------------------------
            //load thông tin vô bảng
            function loadTable(url) {
               var currentPageStartIndex = 0;

               vTable.destroy();
               return $("#realestates-table").DataTable({
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
                        json.start = currentPageStartIndex;

                        return json.content;
                     },
                  },

                  columns: [
                     { data: "id" },
                     { data: "provinceName" },
                     { data: "districtName" },
                     { data: "wardName" },
                     { data: "typeName" },
                     { data: "requestName" },
                     { data: "updateDate" },
                     { data: "customerName" },
                     { data: "acreage" },
                     { data: "price" },
                     { data: "photo" },
                     { data: "status" },
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
                        targets: 9,
                        render: function (data) {
                           return data.toLocaleString() + " đ";
                        },
                     },

                     {
                        targets: 10,
                        render: function (data, type, row, meta) {
                           return `<img src="/images/${data}" style="width:100px">`;
                        },
                     },

                     {
                        targets: 11,
                        render: function (data, type, row, meta) {
                           let vOption;
                           vDataStatus.forEach(function (element) {
                              let selected = element.code === data ? "selected" : "";
                              vOption += `<option value="${element.code}" ${selected}>${element.name}</option>`;
                           });
                           let vSelect = `<select class="form-control select-status" style="width:150px">${vOption}</select>`;

                           return vSelect;
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

            //load danh sách vào status
            function loadAllStatus(paramData) {
               $("#select-searchStatus").empty();
               $("#select-searchStatus").append(`
                  <option value="0">Chọn Trạng Thái</option>`);

               paramData.forEach(function (element) {
                  $("#select-searchStatus").append(`
                     <option value="${element.code}">${element.name}</option>
                  `);
               });
            }

            //load danh sách vào Request
            function loadAllRequest(paramData) {
               $("#select-searchRequest").empty();
               $("#select-searchRequest").append(`
                  <option value="0">Chọn Nhu Cầu</option>`);

               paramData.forEach(function (element) {
                  $("#select-searchRequest").append(`
                     <option value="${element.code}">${element.name}</option>
                  `);
               });
            }

            //load danh sách vào Type
            function loadAllType(paramData) {
               $("#select-searchType").empty();
               $("#select-searchType").append(`
                  <option value="0">Chọn Loại Tin</option>`);

               paramData.forEach(function (element) {
                  $("#select-searchType").append(`
                     <option value="${element.code}">${element.name}</option>
                  `);
               });
            }

            //load danh sách vào Province
            function loadAllProvince(paramData) {
               paramData.forEach(function (element) {
                  $("#select-searchProvince").append(`
                     <option value="${element.id}">${element.name}</option>
                  `);
               });
            }

            //load danh sách vào District
            function loadAllDistrictByProvinceId(paramData) {
               paramData.forEach(function (element) {
                  $("#select-searchDistrict").append(`
                    <option value="${element.id}">${element.name}</option>
                  `);
               });
            }

            //load danh sách vào Ward
            function loadAllWardByDistrictId(paramData) {
               paramData.forEach(function (element) {
                  $("#select-searchWard").append(`
                     <option value="${element.id}">${element.name}</option>
                  `);
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
               gRealestatesIdClick = vDataRow.id;
               return vDataRow;
            }

            //Lấy thông tin tìm kiếm
            function getDataFindToUrl() {
               let vStatusId = $("#select-searchStatus").val();
               let vRequestId = $("#select-searchRequest").val();
               let vTypeId = $("#select-searchType").val();
               let vProvinceId = $("#select-searchProvince").val();
               let vDistrictId = $("#select-searchDistrict").val();
               let vWardId = $("#select-searchWard").val();
               let vMinPriceSplit = $("#inp-searchMinPrice").val();
               let vMinPrice = vMinPriceSplit.replace(/,/g, "");
               let vMaxPriceSplit = $("#inp-searchMaxPrice").val();
               let vMaxPrice = vMaxPriceSplit.replace(/,/g, "");
               let vUrl = `/relestates/get/search?statusId=${vStatusId}&requestId=${vRequestId}&typeId=${vTypeId}&provinceId=${vProvinceId}&districtId=${vDistrictId}&wardId=${vWardId}&minPrice=${vMinPrice}&maxPrice=${vMaxPrice}`;
               return vUrl;
            }
         });
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

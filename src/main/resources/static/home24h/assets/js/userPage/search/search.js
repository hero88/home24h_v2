const gLocalhostUrl = "http://localhost:8080";

//---------------------- INPUT NUMBER --------------------------
function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

$(document).ready(function () {
   const gInfoUser = JSON.parse(localStorage.getItem("home24h"));

   if (gInfoUser) {
      $("#container-loginAndRegister").hide();
      $(".a-info").text("Hi, " + gInfoUser.username);
      $("#container-infoAccount").show();
      gInfoUser.roles.forEach(function (role) {
         if (role == "ROLE_ADMIN" || role == "ROLE_MODERATOR") {
            $("#container-infoAccount .dashboardPage").show();
            return false;
         }
      });
   }

   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   let vDataSearch;
   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   $("#btn-logout").click(function () {
      localStorage.removeItem("home24h");
      $("#container-loginAndRegister").show();
      $("#container-infoAccount").hide();

      location.reload();
   });

   //-----------------------------------SEARCH--------------------------------------------
   //Khi click vào search
   $("#btn-search").on("click", async function () {
      let vData = getDataSearch();
      let vRealestates = await callApiRealestatesByCondition(vData);
      loadDataSearch(vRealestates);
   });

   //Khi thay đổi province
   $("#select-search-province").on("change", async function () {
      $("#select-search-district").empty();
      $("#select-search-district").append(`
         <option value="0">Select District</option>`);

      $("#select-search-ward").empty();
      $("#select-search-ward").append(`
         <option value="0">Select Ward</option>`);

      let vProvinceId = $(this).val();
      if (vProvinceId != 0) {
         let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
         loadDataToSelectDistrict(vDistrict);
      }
   });

   //Khi thay đổi district
   $("#select-search-district").on("change", async function () {
      $("#select-search-ward").empty();
      $("#select-search-ward").append(`
      <option value="0">Select Ward</option>`);

      let vDistrictId = $(this).val();
      if (vDistrictId != 0) {
         let vWard = await callApiWardByDistrictId(vDistrictId);
         loadDataToSelectWard(vWard);
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      handleLoading();
   }
   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ----------------------------------API-----------------------------------------
   function callApiRealestatesByCondition(paramData, paramPage) {
      paramPage = paramPage || 0;
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/relestates/get/searchUserPage?requestId=${paramData.requestId}&typeId=${paramData.typeId}&provinceId=${paramData.provinceId}&districtId=${paramData.districtId}&wardId=${paramData.wardId}&minPrice=${paramData.minPrice}&maxPrice=${paramData.maxPrice}&size=6&page=${paramPage}`,
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

   //Gọi API all province
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

   //Gọi API all Request
   function callApiAllRequest() {
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/enum/eRequest/get/all`,
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

   //Gọi API all Request
   function callApiAllType() {
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/enum/eType/get/all`,
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

   // ------------------------------ LOAD ----------------------------------------------
   //Tải tất cả request vào select
   function loadSelectRequest(paramData) {
      paramData.forEach(function (element) {
         $("#select-search-request").append(`
          <option value="${element.code}">${element.name}</option>
        `);
      });
   }

   //Tải tất cả type vào select
   function loadSelectType(paramData) {
      paramData.forEach(function (element) {
         $("#select-search-type").append(`
             <option value="${element.code}">${element.name}</option>
           `);
      });
   }

   //Tải tất cả province vào select
   function loadSelectProvince(paramData) {
      paramData.forEach(function (element) {
         $("#select-search-province").append(`
            <option value="${element.id}">${element.name}</option>
         `);
      });
   }

   //Tải tất cả District vào select
   function loadDataToSelectDistrict(paramData) {
      paramData.forEach(function (element) {
         $("#select-search-district").append(`
            <option value="${element.id}">${element.name}</option>
         `);
      });
   }

   //Tải tất cả Ward vào select
   function loadDataToSelectWard(paramData) {
      paramData.forEach(function (element) {
         $("#select-search-ward").append(`
            <option value="${element.id}">${element.name}</option>
         `);
      });
   }

   function loadDataSearch(paramObj) {
      $("#wrapper-numberResult").html(`${paramObj.totalElements}`);
      $("#wrapper-resultRealestates").empty();
      if (paramObj.content.length > 0) {
         for (var bI = 0; bI < paramObj.content.length; bI++) {
            let vRealestates = paramObj.content[bI];
            let vRealestatesPrice = convertVND(vRealestates.price);
            $("#wrapper-resultRealestates").append(`
               <div class="col-sm-6 col-md-6 col-lg-4 col-12 mt-3" >
                  <a href="../detail/detailRealestates.html?id=${vRealestates.id}">

                     <div class="card" style="border-radius: 20px; height: 28rem;">
                        <div style="position:relative">
                           <img class="card-img-top p-2" style="border-radius: 20px; height: 250px; width: 100%; object-fit: cover;" src="/images/${vRealestates.photo}" alt="Card image cap">
                           <span class="p-1" style="font-size: 13px; background-color:#FFFDFC; position:absolute; bottom: 20px; right: 20px">${vRealestates.requestName}</span>
                        </div>
                        <div class="card-body">
                           <div>
                              <h5 class="card-title py-0" style="font-weight: bold; color:#b39359">${vRealestates.title}</h5>
                           </div>
                           <ul class="list-group">
                              <li class="list-group text-left" style="font-size: 14px;">Address: ${vRealestates.wardName}, ${vRealestates.districtName}, ${vRealestates.provinceName}</li>
                              <li class="list-group text-left" style="font-size: 14px;">Add: ${vRealestates.createDate}</li>
                              <li class="list-group" style="font-size: 15px;">
                                 <div class="form-inline d-flex justify-content-between">
                                    <span><i class="fa-solid fa-bed"></i> ${vRealestates.bedRoom}</span>
                                    <span><i class="fa-solid fa-restroom"></i> ${vRealestates.bathRoom}</span>
                                    <span><i class="fa-solid fa-rug"></i> ${vRealestates.acreage}m<sup>2</sup></span>
                                 </div>
                              </li>
                           </ul>
                        </div>
                        <div class="card-body py-0 text-left">
                           <p style="font-weight: bold;">Price: <span style="color:red">${vRealestatesPrice}</span></p>
                        </div>
                     </div>
                  </a>
               </div>
              `);
         }
      }
      // Hiển thị phân trang
      // Nếu tổng trang trên 1 thì hiển thị phân trang
      if (paramObj.totalPages > 1) {
         let pagination = $(`
            <div class="col-12 text-center my-5">
               <ul class='pagination justify-content-center'></ul>
            </div>

         `);

         for (let bU = 0; bU < paramObj.totalPages; bU++) {
            let pageNumber = bU + 1;
            let isActive = bU == paramObj.number;
            let pageItemClass = isActive ? "active" : "";
            let pageItem = $(
               `<li class="page-item ${pageItemClass}"><a class="page-link" href="#" >${pageNumber}</a></li>`
            );
            pageItem.find("a").on("click", async function (event) {
               event.preventDefault();
               let vRealestates = await callApiRealestatesByCondition(vDataSearch, bU);
               loadDataSearch(vRealestates);
            });
            pageItem.appendTo(pagination.find("ul"));
         }
         $("#wrapper-resultRealestates").append(pagination);
      }
   }

   //------------------------------GET----------------------------------------

   function getDataSearch() {
      var vSearch = {};
      vSearch.requestId = $("#select-search-request").val();
      vSearch.typeId = $("#select-search-type").val();
      let vMinPrice = $("#inp-search-minPrice").val().trim();
      vSearch.minPrice = vMinPrice.replace(/,/g, "");
      vMaxPrice = $("#inp-search-maxPrice").val().trim();
      vSearch.maxPrice = vMaxPrice.replace(/,/g, "");
      vSearch.provinceId = $("#select-search-province").val();
      vSearch.districtId = $("#select-search-district").val();
      vSearch.wardId = $("#select-search-ward").val();
      vDataSearch = vSearch;
      return vSearch;
   }

   //------------------------------HANDLE----------------------------------------
   //Xử lý khi mới load trang
   async function handleLoading() {
      let [vRequest, vType, vProvince] = await Promise.all([
         callApiAllRequest(),
         callApiAllType(),
         callApiAllProvince(),
      ]);

      loadSelectProvince(vProvince);
      loadSelectRequest(vRequest);
      loadSelectType(vType);

      let vUrlStr = window.location.href;
      let vUrl = new URL(vUrlStr);
      let [vRequestId, vTypeId, vMinPrice, vMaxPrice, vProvinceId, vDistrictId, vWardId] = [
         "requestId",
         "typeId",
         "minPrice",
         "maxPrice",
         "provinceId",
         "districtId",
         "wardId",
      ].map((param) => vUrl.searchParams.get(param));

      $("#select-search-request").val(vRequestId);

      $("#select-search-type").val(vTypeId);

      $("#inp-search-minPrice").val(vMinPrice);

      $("#inp-search-maxPrice").val(vMaxPrice);

      $("#select-search-province").val(vProvinceId);

      let vDistrict = await callApiDistrictByProvinceId(vProvinceId);
      loadDataToSelectDistrict(vDistrict);
      $("#select-search-district").val(vDistrictId);

      let vWard = await callApiWardByDistrictId(vDistrictId);
      loadDataToSelectWard(vWard);
      $("#select-search-ward").val(vWardId);

      let vData = getDataSearch();
      let vRealestates = await callApiRealestatesByCondition(vData);
      loadDataSearch(vRealestates);
   }

   function convertVND(paramValue) {
      let vLengthNumber = paramValue.toString().length;
      let resultFinal;

      if (vLengthNumber <= 5) {
         let result = paramValue / 1000;
         resultFinal = result + " nghìn";
      }

      if (vLengthNumber <= 9 && vLengthNumber > 5) {
         let result = paramValue / 1000000;
         let formattedResult = result % 1 === 0 ? result : result.toFixed(1);
         resultFinal = formattedResult + " triệu";
      }

      if (vLengthNumber > 9) {
         let result = paramValue / 1000000000;
         let formattedResult = result % 1 === 0 ? result : result.toFixed(2);
         resultFinal = formattedResult + " tỷ";
      }
      return resultFinal;
   }
});

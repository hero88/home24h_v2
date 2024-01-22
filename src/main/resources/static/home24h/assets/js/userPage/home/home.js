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
   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   swiperSlideNoPagination();
   onPageLoading();

   $("#btn-logout").click(function () {
      localStorage.removeItem("home24h");
      $("#container-loginAndRegister").show();
      $("#container-infoAccount").hide();

      location.reload();
   });

   //-----------------------------------SEARCH--------------------------------------------
   //Khi click vào search
   $("#btn-search").on("click", function () {
      let vData = getDataSearch();
      window.location.href = `../search/search.html?requestId=${vData.requestId}&typeId=${vData.typeId}&provinceId=${vData.provinceId}&districtId=${vData.districtId}&wardId=${vData.wardId}&minPrice=${vData.minPrice}&maxPrice=${vData.maxPrice}`;
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

   // ----------------------------------NEW ADD PROPERTIES-----------------------------------
   $(".main-newAdded-properties").on("click", async function (event) {
      event.preventDefault();
      $(".main-newAdded-properties").removeClass("activeProperties");
      let vDataTarget = $(this).attr("data-target");
      $(this).addClass("activeProperties");
      let vRealestates = await callApiAllRealestateByProperties(vDataTarget);
      loadDataToSectionNewAdded(vRealestates);
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      handleLoading();
   }
   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ----------------------------------API-----------------------------------------
   function callApiAllRealestateByProperties(paramProperties) {
      let vUrl;
      if (paramProperties === "allProperties") {
         vUrl = `/realestates/get/requestFromUserPage`;
      }
      if (paramProperties === "forRent") {
         vUrl = `/realestates/get/requestFromUserPage?requestId=2`;
      }
      if (paramProperties === "forBuy") {
         vUrl = `/realestates/get/requestFromUserPage?&requestId=1`;
      }

      return new Promise(function (resolve, reject) {
         $.ajax({
            url: vUrl,
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

   //Tải tất cả dữ liệu vào new Added
   function loadDataToSectionNewAdded(paramObj) {
      $("#newAdded-realestates").empty();
      let index = 0;

      function addItemWithDelay() {
         if (index < paramObj.length) {
            let vPrice = convertVND(paramObj[index].price);

            const newItem = $(`
            <div class="col-sm-6 col-md-6 col-lg-4 col-12 mt-3 newAdded-item" style="display: none;">
               <a href="../detail/detailRealestates.html?id=${paramObj[index].id}">

                  <div class="card" style="border-radius: 20px; height: 28rem;">
                     <div style="position:relative">
                        <img class="card-img-top p-2" style="border-radius: 20px; height: 250px; width: 100%; object-fit: cover;" src="/images/${paramObj[index].photo}" alt="Card image cap">
                        <span class="p-1" style="font-size: 13px; background-color:#FFFDFC; position:absolute; bottom: 20px; right: 20px">${paramObj[index].requestName}</span>
                     </div>
                     <div class="card-body">
                        <div>
                           <h5 class="card-title py-0" style="font-weight: bold; color:#b39359">${paramObj[index].title}</h5>
                        </div>
                        <ul class="list-group">
                        <li class="list-group text-left" style="font-size: 14px;">Address: ${paramObj[index].wardName}, ${paramObj[index].districtName}, ${paramObj[index].provinceName}</li>
                        <li class="list-group text-left" style="font-size: 14px;">Add: ${paramObj[index].createDate}</li>
                        <li class="list-group" style="font-size: 15px;">
                           <div class="form-inline d-flex justify-content-between">
                              <span><i class="fa-solid fa-bed"></i> ${paramObj[index].bedRoom}</span>
                              <span><i class="fa-solid fa-restroom"></i> ${paramObj[index].bathRoom}</span>
                              <span><i class="fa-solid fa-rug"></i> ${paramObj[index].acreage}m<sup>2</sup></span>
                           </div>
                        </li>
                        </ul>
                     </div>
                     <div class="card-body py-0 text-left">
                        <p style="font-weight: bold;">Price: <span style="color:red">${vPrice}</span></p>
                     </div>
                  </div>

               </a>
            </div>
          `);

            newItem.appendTo("#newAdded-realestates").fadeIn(500);
            index++;
            setTimeout(addItemWithDelay, 500);
         }
      }

      addItemWithDelay();
   }

   //Tải tất cả dữ liệu vào BestChoice
   function loadDataToSectionBestChoice(paramObj) {
      for (var bI = 0; bI < paramObj.length; bI++) {
         let vPrice = convertVND(paramObj[bI].price);
         $("#swiperBestChoice").append(`
               <div class="swiper-slide bestChoice">
                  <a href="../detail/detailRealestates.html?id=${paramObj[bI].id}">
                     <div class="card" style="border-radius: 20px; height: 28rem;">
                        <div style="position:relative">
                           <img class="card-img-top p-2" style="border-radius: 20px; height: 250px; width: 100%; object-fit: cover;" src="/images/${paramObj[bI].photo}" alt="Card image cap">
                           <span class="p-1" style="font-size: 13px; background-color:#FFFDFC; position:absolute; bottom: 20px; right: 20px">${paramObj[bI].requestName}</span>
                        </div>
                        <div class="card-body">
                           <div>
                              <h5 class="card-title py-0" style="font-weight: bold; color:#b39359">${paramObj[bI].title}</h5>
                           </div>
                           <ul class="list-group">
                              <li class="list-group text-left" style="font-size: 14px;">Address: ${paramObj[bI].wardName}, ${paramObj[bI].districtName}, ${paramObj[bI].provinceName}</li>
                              <li class="list-group text-left" style="font-size: 14px;">Add: ${paramObj[bI].createDate}</li>
                              <li class="list-group" style="font-size: 15px;">
                                 <div class="form-inline d-flex justify-content-between">
                                    <span><i class="fa-solid fa-bed"></i> ${paramObj[bI].bedRoom}</span>
                                    <span><i class="fa-solid fa-restroom"></i> ${paramObj[bI].bathRoom}</span>
                                    <span><i class="fa-solid fa-rug"></i> ${paramObj[bI].acreage}m<sup>2</sup></span>
                                 </div>
                              </li>
                           </ul>
                        </div>
                        <div class="card-body py-0 text-left">
                           <p style="font-weight: bold;">Price: <span style="color:red">${vPrice}</span></p>
                        </div>
                     </div>
                  </a>
               </div>`);
      }
   }

   //------------------------------GET----------------------------------------

   function getDataSearch() {
      var vSearch = {};
      vSearch.requestId = $("#select-search-request").val();
      vSearch.typeId = $("#select-search-type").val();
      vSearch.minPrice = $("#inp-search-minPrice").val().trim();
      vSearch.maxPrice = $("#inp-search-maxPrice").val().trim();
      vSearch.provinceId = $("#select-search-province").val();
      vSearch.districtId = $("#select-search-district").val();
      vSearch.wardId = $("#select-search-ward").val();
      vDataSearch = vSearch;
      return vSearch;
   }

   //------------------------------HANDLE----------------------------------------
   //Xử lý khi mới load trang
   async function handleLoading() {
      let [vRequest, vType, vProvince, vRealestatesAll] = await Promise.all([
         callApiAllRequest(),
         callApiAllType(),
         callApiAllProvince(),
         //Gọ API vào NewAdd theo allProperties
         callApiAllRealestateByProperties("allProperties"),
      ]);

      loadSelectProvince(vProvince);
      loadSelectRequest(vRequest);
      loadSelectType(vType);
      loadDataToSectionNewAdded(vRealestatesAll);
      loadDataToSectionBestChoice(vRealestatesAll);
      swiperSlide();
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

   function swiperSlideNoPagination() {
      var swiperNoPagination = new Swiper(".swiper-container.outPartner", {
         pagination: {
            el: null,
         },
         breakpoints: {
            320: {
               slidesPerView: 3,
               spaceBetween: 10,
            },
            768: {
               slidesPerView: 5,
               spaceBetween: 50,
            },
         },
      });
   }

   function swiperSlide() {
      var swiper = new Swiper(".swiper-container.bestChoice", {
         pagination: {
            el: ".swiper-pagination.bestChoice",
            clickable: true,
         },
         breakpoints: {
            320: {
               slidesPerView: 1,
               spaceBetween: 10,
            },
            480: {
               slidesPerView: 2,
               spaceBetween: 20,
            },
            1200: {
               slidesPerView: 3,
               spaceBetween: 70,
            },
         },
      });
   }
});

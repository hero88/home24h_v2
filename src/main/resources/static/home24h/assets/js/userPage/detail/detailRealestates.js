const gLocalhostUrl = "http://localhost:8080";
const gLocalhost = "http://localhost";

//---------------------- INPUT NUMBER --------------------------
function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

$(document).ready(function () {
   const gInfoUser = JSON.parse(localStorage.getItem("home24h"));
   const gHeader = gInfoUser ? { Authorization: "Bearer " + gInfoUser.accessToken } : null;

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

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      handleLoading();
   }
   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ----------------------------------API-----------------------------------------
   //Gọi API BestChoice
   function callApiRealestatesSwiper() {
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/realestates/get/requestFromUserPage`,
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

   //Gọi Api  Utilities
   function callApiUtiliesRealestates(paramStr) {
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/utilities/get/listUitilitiesById?paramUtilitiesStr=${paramStr}`,
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

   //Gọi Api  RegionLink
   function callApiRegionLinkRealestates(paramStr) {
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/regionLink/get/listRegionLinkById?paramRegionLinkId=${paramStr}`,
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

   //Gọi API realestates theo Id
   function callApiRealestatesById(paramId) {
      return new Promise(function (resolve, reject) {
         $.ajax({
            url: `/realestates/get/realestatesUser/${paramId}`,
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
   //Tải dữ liệu realestates vào bds
   function loadSwiperRealestates(paramObj) {
      for (let bI = 0; bI < paramObj.length; bI += 2) {
         let vPrice1 = convertVND(paramObj[bI].price);
         let vPrice2 = convertVND(paramObj[bI + 1].price);
         $("#swiperBestChoice").append(`


            <div class="swiper-slide bestChoice">
                <div class="container-cardBestChoice">
                    <a href="../detail/detailRealestates.html?id=${paramObj[bI].id}">
                        <div class="card" style="border-radius: 20px; height: 28rem; ">
                            <div style="position:relative">
                                <img class="card-img-top p-2" style="border-radius: 20px; height: 250px; width: 100%; object-fit: cover;" 
                                    src="/images/${paramObj[bI].photo}" alt="Card image cap">
                                <span class="p-1" style="font-size: 13px; background-color:#FFFDFC; position:absolute; bottom: 20px; right: 20px">${
                                   paramObj[bI].requestName
                                }</span>
                            </div>
                            <div class="card-body">
                                <div>
                                    <h5 class="card-title py-0" style="font-weight: bold; color:#b39359">${
                                       paramObj[bI].title
                                    }</h5>
                                </div>
                                <ul class="list-group">
                                    <li class="list-group text-left" style="font-size: 14px;">Address: ${
                                       paramObj[bI].wardName
                                    }, ${paramObj[bI].districtName}, ${paramObj[bI].provinceName}</li>
                                    <li class="list-group text-left" style="font-size: 14px;">Add: ${
                                       paramObj[bI].createDate
                                    }</li>
                                    <li class="list-group" style="font-size: 15px;">
                                        <div class="form-inline d-flex justify-content-between">
                                            <span><i class="fa-solid fa-bed"></i> ${paramObj[bI].bedRoom}</span>
                                            <span><i class="fa-solid fa-restroom"></i> ${paramObj[bI].bathRoom}</span>
                                            <span><i class="fa-solid fa-rug"></i> ${
                                               paramObj[bI].acreage
                                            }m<sup>2</sup></span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body py-0 text-left">
                                <p style="font-weight: bold;">Price: <span style="color:red">${vPrice1}</span></p>
                            </div>
                        </div>
                    </a>

                    <a href="../detail/detailRealestates.html?id=${paramObj[bI + 1].id}">
                        <div class="card my-2" style="border-radius: 20px; height: 28rem;">
                            <div style="position:relative">
                                <img class="card-img-top p-2" style="border-radius: 20px; height: 250px; width: 100%; object-fit: cover;" 
                                src="/images/${paramObj[bI + 1].photo}" alt="Card image cap">
                                <span class="p-1" style="font-size: 13px; background-color:#FFFDFC; position:absolute; bottom: 20px; right: 20px">${
                                   paramObj[bI + 1].requestName
                                }</span>
                            </div>
                            <div class="card-body">
                                <div>
                                    <h5 class="card-title py-0" style="font-weight: bold; color:#b39359">${
                                       paramObj[bI + 1].title
                                    }</h5>
                                </div>
                                <ul class="list-group">
                                    <li class="list-group text-left" style="font-size: 14px;">Address: ${
                                       paramObj[bI + 1].wardName
                                    }, ${paramObj[bI + 1].districtName}, ${paramObj[bI + 1].provinceName}</li>
                                    <li class="list-group text-left" style="font-size: 14px;">Add: ${
                                       paramObj[bI + 1].createDate
                                    }</li>
                                    <li class="list-group" style="font-size: 15px;">
                                        <div class="form-inline d-flex justify-content-between">
                                            <span><i class="fa-solid fa-bed"></i> ${paramObj[bI + 1].bedRoom}</span>
                                            <span><i class="fa-solid fa-restroom"></i> ${
                                               paramObj[bI + 1].bathRoom
                                            }</span>
                                            <span><i class="fa-solid fa-rug"></i> ${
                                               paramObj[bI + 1].acreage
                                            }m<sup>2</sup></span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body py-0 text-left">
                                <p style="font-weight: bold;">Price: <span style="color:red">${vPrice2}</span></p>
                            </div>
                        </div>
                    </a>


                </div>
            </div>`);
      }
   }

   //Tải dữ liệu realestates
   async function loadDataRealestates(paramData) {
      console.log(paramData);
      //Tải hình ảnh vào thẻ img
      $("#img-mainRealestates").attr("src", `/images/${paramData.photo}`);
      //Tải tên tiêu đề bds
      $("#title-mainRealestates").html(`${paramData.title}`);

      //Tải địa chỉ nhà
      $("#address-mainRealestates").html(
         `${paramData.wardName}, ${paramData.districtName}, ${paramData.provinceName},`
      );
      //Tải thông tin tiết nhà
      $("#detail-mainRealestates").append(`
        <div class=" d-flex">
            <h6 style="font-weight:bold">Giá:</h6> &nbsp
            <h6 style="color:red">${paramData.price.toLocaleString()} đ</h6>
        </div>
      `);

      function appendDetailInfo(title, value, plus) {
         plus = plus || "";
         if (value !== null && value !== 0 && value !== "") {
            $("#detail-mainRealestates").append(`
            <div class="d-flex">
                <h6 style="font-weight:bold">${title}:</h6> &nbsp
                <h6>${value} ${plus}</h6>
            </div>                
          `);
         }
      }
      appendDetailInfo("Nhu cầu", paramData.requestName);
      appendDetailInfo("Loại tin", paramData.typeName);
      appendDetailInfo("Diện tích", paramData.acreage, "m<sup>2</sup>");
      appendDetailInfo("Dài", paramData.longX, "m");
      appendDetailInfo("Ngang", paramData.widthY, "m");
      appendDetailInfo("Phòng ngủ", paramData.bedRoom);
      appendDetailInfo("Phòng vệ sinh", paramData.bathRoom);
      appendDetailInfo("Mã Căn Hộ", paramData.apartCode);
      appendDetailInfo("Hướng nhà", paramData.directionName);
      appendDetailInfo("Tầng", paramData.numberFloors);
      appendDetailInfo("Tổng Tầng", paramData.totalFloors);
      appendDetailInfo("Diện tích tim tường", paramData.wallArea, "m");
      appendDetailInfo("Mô tả", paramData.description);

      if (paramData.detailProject != null) {
         $("#detail-projectRealestates").append(`
            <div class="d-flex">
                <h6 style="font-weight:bold">Tên Dự Án:</h6> &nbsp
                <h6>${paramData.detailProject.name}</h6>
            </div>                
        `);

         if (paramData.detailProject.investorId != null) {
            $("#detail-projectRealestates").append(`
                <div class="d-flex">
                    <h6 style="font-weight:bold">Chủ Thầu:</h6> &nbsp
                    <h6>${paramData.detailProject.investorName}</h6>
                </div>                
            `);
         }

         if (paramData.detailProject.contractorId != null) {
            $("#detail-projectRealestates").append(`
                <div class="d-flex">
                    <h6 style="font-weight:bold">Thầu Xây Dụng:</h6> &nbsp
                    <h6>${paramData.detailProject.contractorName}</h6>
                </div>                
            `);
         }

         if (paramData.detailProject.designUnitId != null) {
            $("#detail-projectRealestates").append(`
                <div class="d-flex">
                    <h6 style="font-weight:bold">Đơn Vị Thiết Kế:</h6> &nbsp
                    <h6>${paramData.detailProject.designUnitName}</h6>
                </div>                
            `);
         }

         if (paramData.detailProject.utilities != "") {
            $("#detail-uitilitiesRealestates").append(`
                <ul class="ul-utilities"></ul>
            `);

            //Gọi API tất cả utilies
            let vUtilities = await callApiUtiliesRealestates(paramData.detailProject.utilities);
            vUtilities.forEach(function (element) {
               $("#detail-uitilitiesRealestates .ul-utilities").append(`
                    <li class="d-flex align-items-center  mt-2">
                        <img class="mr-2" src="/images/Default/check.png" style="width:20px;height:20px">
                        <span>${element.name}</span>
                    </li>
               `);
            });
         }

         if (paramData.detailProject.layouts.length > 0) {
            let vDataLayout = paramData.detailProject.layouts;
            vDataLayout.forEach((element) =>
               $(".wrapper-layout").append(`
               <div>
                  <div class="image-wrapper mb-5">
                     <img src="/images/${element.photo}">
                  </div>
               </div>
            `)
            );
         }

         if (paramData.detailProject.regionLink != "") {
            $("#detail-regionLinkRealestates").append(`
                <div class="swiper-container regionLink">
                    <div class="swiper-wrapper" id="swiperRegionLink"></div>
                    <div class="swiper-pagination regionLink"></div>
                </div>
            `);
            //Gọi API tất cả utilies
            let vRegionLink = await callApiRegionLinkRealestates(paramData.detailProject.regionLink);

            for (let bI = 0; bI < vRegionLink.length; bI++) {
               $("#swiperRegionLink").append(`
                    <div class="swiper-slide regionLink">
                        <div style="width:200px; height:220px">
                            <div>
                                <img src="/images/${vRegionLink[bI].photo}" style="width:100%; max-width:200px; height: 150px;  object-fit: cover;">
                            </div>
                            <div class="text-center">
                                <span>${vRegionLink[bI].name}</span>
                            </div>                        
                        </div>                           
                    </div>
                `);
            }
            swiperSlideRegionLink();
         }
      }
   }

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

   //------------------------------GET----------------------------------------
   //Lấy Id của realestates từ Url
   function getIdFormUrl() {
      let vUrlString = window.location.href;
      let vUrl = new URL(vUrlString);
      let vId = vUrl.searchParams.get("id");
      return vId;
   }

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

   // function getInfiLocalStorage(name) {
   //    if (localStorage.getItem(name) !== null) {
   //       return JSON.parse(localStorage.getItem(name));
   //    } else {
   //       return false;
   //    }
   // }

   //------------------------------HANDLE----------------------------------------
   //Xử lý khi mới load trang
   async function handleLoading() {
      let [vRequest, vType, vProvince, vRealestatesSwiper] = await Promise.all([
         callApiAllRequest(),
         callApiAllType(),
         callApiAllProvince(),
         callApiRealestatesSwiper(),
      ]);

      //Tải vào select Province
      loadSelectProvince(vProvince);

      //Tải vào select Request
      loadSelectRequest(vRequest);

      //Tải vào select Type
      loadSelectType(vType);

      //Lấy id của realestates từ Url
      let vRealestatesId = getIdFormUrl();

      //Gọi Api Realestates dựa vào id
      let vRealestates = await callApiRealestatesById(vRealestatesId);

      //load thông tin realestates
      loadDataRealestates(vRealestates);

      //load Realestates vào swiper
      loadSwiperRealestates(vRealestatesSwiper);
      swiperSlideRealestates();
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

   function swiperSlideRealestates() {
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
         },
      });
   }

   function swiperSlideRegionLink() {
      var swiper = new Swiper(".swiper-container.regionLink", {
         pagination: {
            el: ".swiper-pagination.regionLink",
            clickable: true,
         },
         breakpoints: {
            320: {
               slidesPerView: 2,
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

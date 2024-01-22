const gLocalhostUrl = "http://localhost:8080";

checkToken();

//gọi API kiểm tra quyền đăng nhập
function callApiUserAccess(paramHeader) {
   return new Promise(function (resolve, reject) {
      $.ajax({
         type: "GET",
         async: false,
         headers: paramHeader,
         url: `/users/userAccess`,
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
         await callApiUserAccess(gHeader);
         $(document).ready(function () {
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
            let vRealestatesClick;
            /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
            onPageLoading();

            $("#btn-logout").click(function () {
               localStorage.removeItem("home24h");
               $("#container-loginAndRegister").show();
               $("#container-infoAccount").hide();
               location.reload();
            });

            $("#tabs a").click(function (e) {
               e.preventDefault();
               let vStatus = $(this).parent().data("target"); //lấy giá trị của data-target trên li

               window.location.href = `../myRealestates/myRealestates.html?status=${vStatus}`;

               // Di chuyển đến div có id là "abc"
               let targetDiv = document.getElementById("wrapperStatusTab");
               if (targetDiv) {
                  targetDiv.scrollIntoView({ behavior: "smooth", block: "start" });
               }
            });

            //Khi click vào  Delete
            $("#wrapperRealestates").on("click", ".fa-delete", function () {
               vRealestatesClick = $(this);
               $("#deleteRealestates-modal").modal("show");
            });

            //Khi click vào delete trong modal
            $("#btn-delete-modal").on("click", async function () {
               debugger;
               let vId = vRealestatesClick.data("target");

               await callApiDeleteRealestates(vId);
               let vParams = getParamUrl();

               let vRealestates = await callApiByStatus(vParams);
               if (vRealestates.content.length == 0 && vParams.page > 0) {
                  vParams.page = parseInt(vParams.page) - 1;
                  window.location.href = `../myRealestates/myRealestates.html?status=${vParams.status}&page=${vParams.page}`;
               }

               loadRealestates(vRealestates);

               // vRealestates.remove();
               $("#deleteRealestates-modal").modal("hide");
               toastr.success("Delete Success");
            });

            /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
            function onPageLoading() {
               handleLoading();
            }
            /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
            // -----------------------------API--------------------------------------------
            //Gọi API của User Id theo status
            function callApiByStatus(paramData) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "GET",
                     headers: gHeader,
                     url: `/realestates/get/realestatesByUserId?status=${paramData.status}&page=${paramData.page}&size=${paramData.size}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //Gọi API xóa Realestates ở Web User
            function callApiDeleteRealestates(paramId) {
               return new Promise(function (resolve, reject) {
                  $.ajax({
                     type: "PUT",
                     headers: gHeader,
                     url: `/realestates/deleteOnUser/${paramId}`,
                     success: function (res) {
                        resolve(res);
                     },
                     error: function (xhr) {
                        reject(xhr);
                     },
                  });
               });
            }

            //------------------------------GET--------------------------------------------
            //Lấy thông số trang trên Url
            function getParamUrl() {
               let vUrl = window.location.href;
               let vUrlStr = new URL(vUrl);
               let vParams = {
                  status: vUrlStr.searchParams.get("status") || "approval",
                  page: vUrlStr.searchParams.get("page") || "",
                  size: vUrlStr.searchParams.get("size") || "",
               };
               return vParams;
            }

            //------------------------------VALIDATE----------------------------------------

            //------------------------------LOAD--------------------------------------------
            //Tải dữ liệu vào realestates
            function loadRealestates(paramData) {
               $("#wrapperRealestates").empty();
               let vStatus = $("#current").data("target");

               for (let bI = 0; bI < paramData.content.length; bI++) {
                  let vRealestates = paramData.content[bI];
                  let vPrice = convertVND(vRealestates.price);
                  $("#wrapperRealestates").append(`
                    <div class="row my-card" >
                       <div class="col-xl-3 col-md-4 col-sm-6 col-12">
                          <div class="my-card-img">
                             <img src="/images/${vRealestates.photo}" alt="Img" />
                          </div>
                       </div>

                       <div class="col-xl-9 col-md-8 col-sm-6 col-12 my-card-info mt-2">
                          <div class="my-card-title">
                             <h5>${vRealestates.title}</h5>
                          </div>

                          <div>
                             <ul>
                                <li>Address: ${vRealestates.wardName}, ${vRealestates.districtName}, ${
                     vRealestates.provinceName
                  }</li>
                                <li>Add: ${vRealestates.createDate}</li>
                                <li>
                                   <div class="d-flex justify-content-between">
                                      <span><i class="fa-solid fa-bed"></i>${vRealestates.bedRoom}</span>
                                      <span><i class="fa-solid fa-restroom"></i>${vRealestates.bathRoom}</span>
                                      <span><i class="fa-solid fa-rug"></i>${vRealestates.acreage}<sup>2</sup></span>
                                   </div>
                                </li>
                             </ul>
                          </div>

                          <div class="d-flex justify-content-between">
                             <div>
                                <h5 style="font-weight: bold">Giá: <span style="color: red">${vPrice}</span></h5>
                             </div>
                             <div class="actionIcon">
                             ${
                                vStatus !== "pendingDelete"
                                   ? `
                                 <a href="../updateRealestates/updateRealestates.html?id=${vRealestates.id}">
                                    <i class="fa-solid fa-pen-to-square mr-2 text-primary" title="Edit" style="cursor: pointer"></i>
                                 </a>
                                 <i class="fa-solid fa-trash text-danger fa-delete" title="Delete" style="cursor: pointer" data-target=${vRealestates.id}></i>`
                                   : ""
                             }
                                   </div>
                          </div>
                       </div>
                    </div>
                  `);
               }
               // Hiển thị phân trang
               // Nếu tổng trang trên 1 thì hiển thị phân trang
               if (paramData.totalPages > 1) {
                  let pagination = $(`
                  <div class="col-12 text-center my-5">
                     <ul class='pagination justify-content-center'></ul>
                  </div>`);

                  for (let bU = 0; bU < paramData.totalPages; bU++) {
                     let pageNumber = bU + 1;
                     let isActive = bU == paramData.number;
                     let pageItemClass = isActive ? "active" : "";
                     let pageItem = $(
                        `<li class="page-item ${pageItemClass}"><a class="page-link" href="../myRealestates/myRealestates.html?status=${vStatus}&page=${bU}" >${pageNumber}</a></li>`
                     );
                     pageItem.appendTo(pagination.find("ul"));
                  }
                  $("#wrapperRealestates").append(pagination);
               }
            }

            //------------------------------HANDLE------------------------------------------
            async function handleLoading() {
               //Lấy thông số param trên url
               let vParams = getParamUrl();

               //Gán id current vào thẻ li chọn
               $("#tabs li").each(function () {
                  var dataTarget = $(this).data("target");
                  if (dataTarget == vParams.status) {
                     $(this).attr("id", "current");
                  }
               });

               let vRealestates = await callApiByStatus(vParams);
               loadRealestates(vRealestates);
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
      } catch (error) {
         window.location.href = `../../UserPage/home/home.html`;
      }
   }
}

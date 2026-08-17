export default class ProductUIComponent {
    #productSearchInput;
    #searchProductBtn;
    #barcodeInput;
    #lookupBarcodeBtn;
    #FilterByNutriScore;
    #productCategories;
    #container;
    #searchValue;
    #barcodeValue;
    #nutriScoreFilters;
    #productDetailModal;
    #data = [];
    #api = `https://nutriplan-api.vercel.app/api/products/`;

    constructor() {
        this.#productSearchInput = document.getElementById("product-search-input");
        this.#searchProductBtn = document.getElementById("search-product-btn");
        this.#barcodeInput = document.getElementById("barcode-input");
        this.#lookupBarcodeBtn = document.getElementById("lookup-barcode-btn");
        this.#FilterByNutriScore = document.getElementById("FilterByNutriScore");
        this.#productCategories = document.getElementById("product-categories");
        this.#container = document.getElementById("products-grid");
        this.#productDetailModal = document.getElementById("product-detail-modal");
        this.#showEmptyResult();
        this.#setProductCategories();
        this.#ititEvent();
        this.#nutriScoreFilters = document.querySelectorAll(".nutri-score-filter");
        this.donMSG = document.getElementById("logDonMSG");
    }

    #createCatgoriesBtn(catgory, theme) {
        return `
              <button
                data-id="${catgory.id}"
                class="product-category-btn px-4 py-2 ${theme} text-white rounded-lg text-lg whitespace-nowrap font-semibold hover:shadow-lg transition-all"
              >
                <i class="fa-solid fa-basket-shopping mr-1.5"></i>${catgory.name}
              </button>
    `;
    }
    async #setProductCategories() {
        const catgories = await this.#getProducts({
            value: "",
            type: "categories",
        });
        let htmlBlock = "";
        const theme = [
            "bg-gradient-to-r from-amber-500 to-orange-500",
            "bg-gradient-to-r from-blue-500 to-cyan-500",
            "bg-gradient-to-r from-purple-500 to-pink-500",
            "bg-gradient-to-r from-sky-400 to-blue-500",
            "bg-gradient-to-r from-red-500 to-rose-500",
            "bg-gradient-to-r from-green-500 to-emerald-500",
            "bg-gradient-to-r from-amber-600 to-yellow-500",
            "bg-gradient-to-r from-red-600 to-rose-600",
            "bg-gradient-to-r from-cyan-500 to-blue-600",
            "bg-gradient-to-r from-orange-500 to-red-500",
        ];
        for (let i = 0; i < 10; i++) {
            htmlBlock += this.#createCatgoriesBtn(catgories[i], theme[i]);
        }
        this.#productCategories.innerHTML = htmlBlock;
    }
    #cleanUp = () => {
        this.#productSearchInput.value = "";
        this.#barcodeInput.value = "";
        this.#nutriScoreFilters.forEach((btn) => {
            if (btn.classList.contains("myborder")) {
                btn.classList.remove("myborder");
            }
            if (btn.dataset.grade === "") {
                btn.classList.add("myborder");
            }
        });
        this.#showEmptyResult();
    };
    #ititEvent() {
        window.addEventListener("hashchange", this.#cleanUp);
        this.#productSearchInput.addEventListener("input", (e) => {
            this.#searchValue = e.target.value;
        });
        this.#barcodeInput.addEventListener("input", (e) => {
            this.#barcodeValue = e.target.value;
        });
        this.#searchProductBtn.addEventListener("click", (e) => {
            if (!this.#searchValue) return;
            this.search({ value: this.#searchValue, type: "search" });
        });
        this.#lookupBarcodeBtn.addEventListener("click", (e) => {
            if (!this.#barcodeValue) return;
            this.search({ value: this.#barcodeValue, type: "barcode" });
        });
        this.#productCategories.addEventListener("click", async (ele) => {
            this.#loadingState();
            const btn = ele.target.closest(".product-category-btn");
            if (!btn) return;
            const data = await this.#fetchByCargoryName(btn.dataset.id);
            this.#data = data;
            this.#fetcher(data);
        });
        this.#FilterByNutriScore.addEventListener("click", (ele) => {
            this.#loadingState();
            const btn = ele.target.closest(".nutri-score-filter");
            if (!btn) return;
            this.#nutriScoreFilters.forEach((btn) => {
                if (btn.classList.contains("myborder")) {
                    btn.classList.remove("myborder");
                }
            });
            btn.classList.add("myborder");
            const grade = btn.dataset.grade;
            let filterdData;
            if (grade === "") {
                filterdData = this.#data;
            } else if (grade === "a") {
                filterdData = this.#data.filter((ele) => ele.nutritionGrade === "a");
            } else if (grade === "b") {
                filterdData = this.#data.filter((ele) => ele.nutritionGrade === "b");
            } else if (grade === "c") {
                filterdData = this.#data.filter((ele) => ele.nutritionGrade === "c");
            } else if (grade === "d") {
                filterdData = this.#data.filter((ele) => ele.nutritionGrade === "d");
            } else if (grade === "e") {
                filterdData = this.#data.filter((ele) => ele.nutritionGrade === "e");
            }

            this.#fetcher(filterdData);
        });
    }
    async #fetchByCargoryName(catgory) {
        const api = `${this.#api}search?q=${catgory}&page=1&limit=24`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data.results;
        } catch (e) {
            return [];
        }
    }
    #loadingState() {
        this.#container.innerHTML = `
      <div id="products-loading" class="py-12">
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    `;
    }
    #showEmptyResult() {
        this.#container.innerHTML = `
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <p id="products-count" class="text-sm text-gray-600">No products found in beverages</p>
                </div>
                <div id="products-empty" class="py-12">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="text-3xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box-open" data-prefix="fas" data-icon="box-open" role="img" viewBox="0 0 640 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"></path></svg></i>
                        </div>
                        <p class="text-gray-500 text-lg mb-2">No products to display</p>
                        <p class="text-gray-400 text-sm">Search for a product or browse by category</p>
                    </div>
                </div>
                </div>
    `;
    }
    async #getProducts({ value, type = "search" }) {
        let api;
        if (type === "search") {
            api = `${this.#api}search?q=${value}&page=1&limit=24`;
        } else if (type === "barcode") {
            api = `${this.#api}barcode/${value}`;
        } else if (type === "categories") {
            api = `${this.#api}categories`;
        }
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (type === "search" || type === "categories") {
                return data.results;
            } else if (type === "barcode") {
                return data.result;
            }
        } catch (e) {
            return [];
        }
    }
    #createProductCard(product) {
        let img = `
                <div class="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <i class="text-4xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                </div>
          `;
        if (product.image)
            img = `
          <img
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                  />
        `;
        return `
              <div
                class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-barcode="${product.barcode}"
              >
                <div
                  class="card-img-product-holder relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                  ${img}

                  <!-- Nutri-Score Badge -->
                  <div
                    class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase"
                  >
                    Nutri-Score ${product.nutritionGrade}
                  </div>

                  <!-- NOVA Badge -->
                  <div
                    class="absolute fiter top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    title="NOVA ${product.novaGroup}"
                  >
                    ${product.novaGroup}
                  </div>
                </div>

                <div class="p-4">
                  <p
                    class="text-xs text-emerald-600 font-semibold mb-1 truncate"
                  >
                    ${product.brand}
                  </p>
                  <h3
                    class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
                  >
                    ${product.name}
                  </h3>

                  <div
                    class="flex items-center gap-3 text-xs text-gray-500 mb-3"
                  >
                    <span
                      ><i class="fa-solid fa-weight-scale mr-1"></i>250g</span
                    >
                    <span
                      ><i class="fa-solid fa-fire mr-1"></i>${Math.round(product.nutrients.calories)} kcal/100g</span
                    >
                  </div>

                  <!-- Mini Nutrition -->
                  <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                      <p class="text-xs font-bold text-emerald-700">${product.nutrients.protein.toFixed(2)}g</p>
                      <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                      <p class="text-xs font-bold text-blue-700">${product.nutrients.carbs.toFixed(2)}g</p>
                      <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                      <p class="text-xs font-bold text-purple-700">${product.nutrients.fat.toFixed(2)}g</p>
                      <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                      <p class="text-xs font-bold text-orange-700">${product.nutrients.sugar.toFixed(2)}g</p>
                      <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                  </div>
                </div>
              </div>
    `;
    }
    #showProdactsDetails(product) {
        const grade = product.nutritionGrade;
        let state;
        if (grade === "a" || grade === "b") state = "good";
        else if (grade === "c") state = "normal";
        else state = "bad";

        const novaGroup = product.novaGroup || "Unknown";

        let novaText;

        if (novaGroup === 1) {
            novaText = "Unprocessed or Minimally Processed";
        } else if (novaGroup === 2) {
            novaText = "Processed Culinary Ingredients";
        } else if (novaGroup === 3) {
            novaText = "Processed Foods";
        } else if (novaGroup === 4) {
            novaText = "Ultra-Processed Foods";
        } else {
            novaText = "Unknown";
        }
        let detailimg = `
                <div class="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <i class="text-4xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                </div>
    `;
        if (product.image) {
            detailimg = `
                  <img
                    class="small_img object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                  />
      `;
        }
        this.#productDetailModal.innerHTML = `
      <div id="innerModelPro" class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
            <!-- Header -->
            <div class="flex items-start gap-6 mb-6">
                <div id="imgHolder">
                  ${detailimg}
                </div>
                <div class="flex-1">
                    <p class="text-sm text-emerald-600 font-semibold mb-1">${product.name}</p>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.brand}</h2>
                    <p class="text-sm text-gray-500 mb-3"></p>
                    
                    <div class="flex items-center gap-3">
                        
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: #e63e1120">
                                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: #e63e11">
                                    ${product.nutritionGrade}
                                </span>
                                <div>
                                    <p class="text-xs font-bold" style="color: #e63e11">Nutri-Score</p>
                                    <p class="text-[10px] text-gray-600">${state.toUpperCase()}</p>
                                </div>
                            </div>
                        
                        
                        
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: #e63e1120">
                                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: #e63e11">
                                    ${novaGroup}
                                </span>
                                <div>
                                    <p class="text-xs font-bold" style="color: #e63e11">NOVA</p>
                                    <p class="text-[10px] text-gray-600">${novaText}</p>
                                </div>
                            </div>
                        
                    </div>
                </div>
                <button class="close-product-modal text-gray-400 hover:text-gray-600">
                    <i class="text-2xl" data-fa-i2svg=""><svg class="svg-inline--fa fa-xmark" data-prefix="fas" data-icon="xmark" role="img" viewBox="0 0 384 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"></path></svg></i>
                </button>
            </div>
            
            <!-- Nutrition Facts -->
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="text-emerald-600" data-fa-i2svg=""><svg class="svg-inline--fa fa-chart-pie" data-prefix="fas" data-icon="chart-pie" role="img" viewBox="0 0 576 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M512.4 240l-176 0c-17.7 0-32-14.3-32-32l0-176c0-17.7 14.4-32.2 31.9-29.9 107 14.2 191.8 99 206 206 2.3 17.5-12.2 31.9-29.9 31.9zM222.6 37.2c18.1-3.8 33.8 11 33.8 29.5l0 197.3c0 5.6 2 11 5.5 15.3L394 438.7c11.7 14.1 9.2 35.4-6.9 44.1-34.1 18.6-73.2 29.2-114.7 29.2-132.5 0-240-107.5-240-240 0-115.5 81.5-211.9 190.2-234.8zM477.8 288l64 0c18.5 0 33.3 15.7 29.5 33.8-10.2 48.4-35 91.4-69.6 124.2-12.3 11.7-31.6 9.2-42.4-3.9L374.9 340.4c-17.3-20.9-2.4-52.4 24.6-52.4l78.2 0z"></path></svg></i>
                    Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
                </h3>
                
                <div class="text-center mb-4 pb-4 border-b border-emerald-200">
                    <p class="text-4xl font-bold text-gray-900">${Math.round(product.nutrients.calories)}</p>
                    <p class="text-sm text-gray-500">Calories</p>
                </div>
                
                <div class="grid grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(product.nutrients.protein, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-emerald-600">${product.nutrients.protein.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Protein</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(product.nutrients.carbs, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-blue-600">${product.nutrients.carbs.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(product.nutrients.fat, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-purple-600">${product.nutrients.fat.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Fat</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min(product.nutrients.sugar, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-orange-600">${product.nutrients.sugar.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Sugar</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${product.nutrients.fat.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Saturated Fat</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${product.nutrients.fiber.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Fiber</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${product.nutrients.sodium.toFixed(2)}g</p>
                        <p class="text-xs text-gray-500">Sodium</p>
                    </div>
                </div>
            </div>
            
            <!-- Additional Info -->
            
            <!-- Actions -->
            <div class="flex gap-3">
                <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all" data-barcode="${product.barcode}" >
                    <i class="mr-2" data-fa-i2svg=""><svg class="svg-inline--fa fa-plus" data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"></path></svg></i>Log This Food
                </button>
                <button id="closeProductModal" class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                    Close
                </button>
            </div>
        </div>
      </div>
    `;
        this.#productDetailModal.classList.remove("hidden");
        this.#productDetailModal.classList.add("fixed");
        window.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            if (card) return;
            const ele = e.target.closest("#innerModelPro");
            if (ele) return;
            this.#productDetailModal.innerHTML = "";
            this.#productDetailModal.classList.replace("fixed", "hidden");
        });
        const closeProductModal = document.querySelector("#closeProductModal");
        const canselModalBtn = document.querySelector(".close-product-modal");
        const addProductToLog = document.querySelector(".add-product-to-log");
        const imgHolder = document.getElementById("imgHolder");
        addProductToLog.addEventListener("click", (e) => {
            let dataStorge = JSON.parse(localStorage.getItem("meals"));
            let meals;
            const now = new Date();
            let newMeal = {
                src: "Product",
                id: product.barcode,
                name: product.name,
                img: product.image,
                date: now.toLocaleDateString("en-US"),
                time: now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                brand: product.brand,
                calories: product.nutrients.calories,
                protein: product.nutrients.protein,
                carbs: product.nutrients.carbs,
                fat: product.nutrients.fat,
            };
            if (dataStorge) {
                meals = JSON.stringify([...dataStorge, newMeal]);
            } else {
                meals = JSON.stringify([newMeal]);
            }
            localStorage.setItem("meals", meals);
            this.donMSG.classList.replace("hidden", "fixed");
            this.donMSG.innerHTML = `
          <div
            class="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification"
          >
            ${product.name} taste logged to your daily intake! 📝
          </div>
      `;
            this.#productDetailModal.innerHTML = ``;
            this.#productDetailModal.classList.remove("fixed");
            this.#productDetailModal.classList.add("hidden");
        });
        canselModalBtn.addEventListener("click", this.#closeIt);
        closeProductModal.addEventListener("click", this.#closeIt);
        imgHolder.children[0].addEventListener("error", (e) => {
            imgHolder.innerHTML = `
        <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <i class="text-4xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                </div>
      `;
        });
    }
    #closeIt = () => {
        if (this.donMSG.classList.contains("fixed")) {
            this.donMSG.classList.replace("fixed", "hidden");
        }
        this.#productDetailModal.innerHTML = ``;
        this.#productDetailModal.classList.remove("fixed");
        this.#productDetailModal.classList.add("hidden");
    };
    #fetcher(products) {
        if (!products.length) {
            this.#showEmptyResult();
            return;
        }
        let htmlBlock = "";
        for (let i = 0; i < products.length; i++) {
            htmlBlock += this.#createProductCard(products[i]);
        }
        this.#container.innerHTML = htmlBlock;
        const productCard = document.querySelectorAll(".product-card");
        productCard.forEach((ele) => {
            ele.addEventListener("click", async (e) => {
                const product = await this.#getProducts({
                    value: ele.dataset.barcode,
                    type: "barcode",
                });
                this.#showProdactsDetails(product);
            });
        });
    }
    async search({ value, type }) {
        this.#loadingState();
        const products = await this.#getProducts({ value, type });
        this.#data = products;
        if (!products.length) {
            this.#showEmptyResult();
            return;
        }
        this.#fetcher(products);
    }
}
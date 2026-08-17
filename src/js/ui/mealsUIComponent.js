import Meals from "./mealsComponent.js";
import MealCategories from "./mealCategoriesComponent.js";
import MealsArea from "./mealsAreasComponent.js";

export default class MealsUIComponent {
    ACTIVE_DISPLAY_BTN_CLASSES;
    ACTIVE_DISPLAY_ICON_CLASSE;
    IN_ACTIVE_DISPLAY_ICON_CLASSE;
    GRID_VIEW;
    LIST_VIEW;
    CARD_LIST_STYLE;
    LIST_VIEW_IMAGE_CLASSES;
    GRID_VIEW_IMAGE_CLASSE;
    ACTIVE_AREA_CLASSES;
    IN_ACTIVE_AREA_CLASSES;
    categoriesGrid;
    viewAllBtn;
    recipesGrid;
    recipesCount;
    viewToggle;
    viewBtns;
    area;
    searchInput;
    headerTitle;
    headerText;
    goToBtns;
    logMealModal;
    home;
    meal;
    limit;
    collaction;
    method;
    searchType;
    mealarea;
    mealId;
    router;
    meals;
    mealsCategories;
    mealsArea;
    nutriPlanServices;

    constructor(router, nutriPlanServices) {
        this.router = router;
        this.nutriPlanServices = nutriPlanServices;

        this.ACTIVE_DISPLAY_BTN_CLASSES = ["bg-white", "rounded-md", "shadow-sm"];
        this.ACTIVE_DISPLAY_ICON_CLASSE = "text-gray-700";
        this.IN_ACTIVE_DISPLAY_ICON_CLASSE = "text-gray-500";
        this.GRID_VIEW = ["grid-cols-4", "gap-5"];
        this.LIST_VIEW = ["grid-cols-2", "gap-4"];
        this.CARD_LIST_STYLE = ["flex", "flex-row", "h-40"];
        this.LIST_VIEW_IMAGE_CLASSES = ["w-48", "h-full"];
        this.GRID_VIEW_IMAGE_CLASSE = "h-48";
        this.ACTIVE_AREA_CLASSES = [
            "hover:bg-emerald-200",
            "bg-emerald-600",
            "text-white",
        ];
        this.IN_ACTIVE_AREA_CLASSES = [
            "hover:bg-gray-200",
            "bg-gray-100",
            "text-gray-700",
        ];
        this.categoriesGrid = document.getElementById("categories-grid");
        this.viewAllBtn = document.getElementById("viewAllBtn");
        this.recipesGrid = document.getElementById("recipes-grid");
        this.recipesCount = document.getElementById("recipes-count");
        this.viewToggle = document.getElementById("view-toggle");
        this.viewBtns = document.querySelectorAll(".view-btn");
        this.area = document.getElementById("area");
        this.searchInput = document.getElementById("search-input");
        this.goToBtns = document.getElementById("goToBtns");
        this.logMealModal = document.getElementById("log-meal-modal");
        this.home = {
            searchFiltersSection: document.getElementById("search-filters-section"),
            mealCategoriesSection: document.getElementById("meal-categories-section"),
            allRecipesSection: document.getElementById("all-recipes-section"),
            mealDetails: document.getElementById("meal-details"),
        };
        this.meal = "Chicken";
        this.limit;
        this.collaction;
        this.method;
        this.searchType;
        this.mealarea = "";
        this.mealId;
        this.initEvents();
        this.meals = new Meals(this.recipesGrid, this.recipesCount);
        this.mealsCategories = new MealCategories(this.categoriesGrid);
        this.mealsArea = new MealsArea(this.area);
    }

    getMealCardElement = () => {
        const recipeCard = document.querySelectorAll(".recipe-card");
        const cardImages = document.querySelectorAll(".card_image");
        const imageTags = document.querySelectorAll(".image_tags");
        return { recipeCard, cardImages, imageTags };
    };
    setRecipesToGrid = () => {
        const { recipeCard, cardImages, imageTags } = this.getMealCardElement();
        if (!recipeCard) return;
        if (recipeCard[0]?.classList.contains("flex")) {
            recipeCard.forEach((card) => {
                card.classList.remove(...this.CARD_LIST_STYLE);
            });
            cardImages.forEach((img) => {
                img.classList.remove(...this.LIST_VIEW_IMAGE_CLASSES);
                img.classList.add(this.GRID_VIEW_IMAGE_CLASSE);
            });
            imageTags.forEach((tags) => {
                tags.classList.remove("hidden");
            });
        }
    };
    setRecipesToList = () => {
        const { recipeCard, cardImages, imageTags } = this.getMealCardElement();
        if (!recipeCard) return;
        if (!recipeCard[0]?.classList.contains("flex")) {
            recipeCard.forEach((card) => {
                card.classList.add(...this.CARD_LIST_STYLE);
            });
            cardImages.forEach((img) => {
                img.classList.remove(this.GRID_VIEW_IMAGE_CLASSE);
                img.classList.add(...this.LIST_VIEW_IMAGE_CLASSES);
            });
            imageTags.forEach((tags) => {
                tags.classList.add("hidden");
            });
        }
    };
    initializeMeals = async () => {
        let collaction = this.collaction;
        let method = this.method;
        let searchType = this.searchType;
        let meal = this.meal;
        let limit = this.limit;
        let mealarea = this.mealarea;
        this.nutriPlanServices.generateApi({
            collaction,
            method,
            searchType,
            meal,
            limit,
            mealarea,
        });
        const data = await this.nutriPlanServices.getData();

        this.meals.render(data, this.meal);
        if (this.recipesGrid.classList.contains("grid-cols-4")) {
            this.setRecipesToGrid();
        } else if (this.recipesGrid.classList.contains("grid-cols-2")) {
            this.setRecipesToList();
        }
    };
    fetchRandomMeals = async (e, _limit = 25) => {
        await this.meals.showLoadingState();
        const res = await fetch(
            `https://nutriplan-api.vercel.app/api/meals/random?count=${_limit}`,
        );
        const data = (await res.json()).results;
        this.meals.render(data);
        if (this.recipesGrid.classList.contains("grid-cols-4")) {
            this.setRecipesToGrid();
        } else if (this.recipesGrid.classList.contains("grid-cols-2")) {
            this.setRecipesToList();
        }
    };
    fetchAllMealsData = async (_limit = "25") => {
        await this.meals.showLoadingState();
        this.limit = _limit;
        this.collaction = "meals";
        this.method = "search";
        this.searchType = "q";
        await this.initializeMeals();
    };

    fetchMealData = async (e) => {
        const btn = e.target.closest(".category-card");
        if (!btn) return;
        await this.meals.showLoadingState();
        this.meal = btn.dataset.category;

        if (this.mealarea) {
            let data = await this.fetchAreaMeals(this.mealarea);
            this.meals.render(data, this.meal);
        } else {
            this.limit = "20";
            this.collaction = "meals";
            this.method = "filter";
            this.searchType = "category";
            await this.initializeMeals();
        }
    };
    getAllCategories = async () => {
        const categories = await this.nutriPlanServices.getAllCategorys().getData();
        let arr = [];
        categories.forEach((category) => {
            arr.push(category.name);
        });
        return arr;
    };
    getAllAreas = async () => {
        const areas = await this.nutriPlanServices.getAllAreas().getData();
        let arr = [];
        areas.forEach((area) => {
            arr.push(area.name);
        });
        return arr;
    };
    changeMealsDisplayStyle = (e) => {
        const btn = e.target.closest(".view-btn");
        if (!btn) return;
        this.viewBtns.forEach((btn) => {
            if (btn.classList.contains("bg-white")) {
                btn.classList.remove(...this.ACTIVE_DISPLAY_BTN_CLASSES);
                btn.children[0].classList.replace(
                    this.ACTIVE_DISPLAY_ICON_CLASSE,
                    this.IN_ACTIVE_DISPLAY_ICON_CLASSE,
                );
            }
        });
        btn.classList.add(...this.ACTIVE_DISPLAY_BTN_CLASSES);
        btn.children[0].classList.replace(
            this.IN_ACTIVE_DISPLAY_ICON_CLASSE,
            this.ACTIVE_DISPLAY_ICON_CLASSE,
        );
        if (btn.id === "grid-view-btn") {
            this.recipesGrid.classList.remove(...this.LIST_VIEW);
            this.recipesGrid.classList.add(...this.GRID_VIEW);
            this.setRecipesToGrid();
        } else if (btn.id === "list-view-btn") {
            this.recipesGrid.classList.remove(...this.GRID_VIEW);
            this.recipesGrid.classList.add(...this.LIST_VIEW);
            this.setRecipesToList();
        }
    };
    fetchAreaMeals = async (area) => {
        if (area) {
            this.mealarea = area;
            return this.nutriPlanServices.fetchAllAreaMeals({
                area: area,
                meal: this.meal,
            });
        } else {
            this.fetchAllMealsData(this.limit);
        }
    };
    viewAllCurentAreaMeals = async () => {
        let data;
        let area = this.mealarea;

        if (area) {
            data = await this.nutriPlanServices.fetchAllAreaMeals({
                area: area,
                meal: this.meal,
                filter: false,
            });
        } else {
            await this.fetchRandomMeals(this.limit);
            return;
        }

        this.meals.render(data);
    };
    showAreaMeals = async (e) => {
        const btn = e.target.closest(".area-btn");
        if (!btn) return;
        await this.meals.showLoadingState();
        const btns = document.querySelectorAll(".area-btn");
        let area = btn.dataset.area;
        btns.forEach((btn) => {
            if (btn.classList.contains("bg-emerald-600")) {
                btn.classList.remove(...this.ACTIVE_AREA_CLASSES);
                btn.classList.add(...this.IN_ACTIVE_AREA_CLASSES);
            }
        });
        btn.classList.remove(...this.IN_ACTIVE_AREA_CLASSES);
        btn.classList.add(...this.ACTIVE_AREA_CLASSES);
        if (!area) {
            this.fetchRandomMeals();
            this.mealarea = "";
            return;
        }
        const data = await this.fetchAreaMeals(area);
        this.meals.render(data, this.meal);
        if (this.recipesGrid.classList.contains("grid-cols-4")) {
            this.setRecipesToGrid();
        } else if (this.recipesGrid.classList.contains("grid-cols-2")) {
            this.setRecipesToList();
        }
    };
    search = async (e) => {
        await this.meals.showLoadingState();
        let text = e.target.value;
        const data = await this.nutriPlanServices
            .searchMeals(text.trim())
            .getSearchData();
        if (!data.meals) data.meals = [];
        let arr = [];
        data.meals.forEach((e) => arr.push({ idMeal: e.idMeal }));
        let myData = await this.nutriPlanServices.fetchMealsById(arr);
        this.meals.render(myData, text, true);
    };
    showDetails = async (meal) => {
        if (meal === []) return;
        let instructions = meal.instructions.join(" ");
        let arr = instructions.split(" ");
        let time = 0;
        for (let i = 0; i < arr.length; i++) {
            if (!isNaN(+arr[i])) {
                time += +arr[i];
            }
        }

        let videoId = meal.youtube.split("v=")[1];
        let embedUrl = `https://www.youtube.com/embed/${videoId}`;

        let ingredients = meal.ingredients.map(
            (item) => `${item.measure} ${item.ingredient}`,
        );

        this.home.mealDetails.innerHTML = `
        <div class="max-w-7xl mx-auto">
          <!-- Back Button -->
          <button
            id="back-to-meals-btn"
            class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
          >
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Recipes</span>
          </button>

          <!-- Hero Section -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div class="relative h-80 md:h-96">
              <img
                src="${meal.thumbnail}"
                alt="${meal.name}"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              ></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <div class="flex items-center gap-3 mb-3">
                  <span
                    class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full"
                    >${meal.category}</span
                  >
                  <span
                    class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full"
                    >${meal.area}</span
                  >
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                  Teriyaki Chicken Casserole
                </h1>
                <div class="flex items-center gap-6 text-white/90">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-clock"></i>
                    <span>${time === 0 ? "30" : time} min</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-utensils"></i>
                    <span id="hero-servings">4 servings</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-fire"></i>
                    <span id="hero-calories">Calculating...</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 mb-8">
            <button
              id="log-meal-btn"
              class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-white rounded-xl font-semibold transition-all"
              data-meal-id="${meal.id}"
            >
              <div class="loader"></div> Calculating...
            </button>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column - Ingredients & Instructions -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Ingredients -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-list-check text-emerald-600"></i>
                  Ingredients
                  <span class="text-sm font-normal text-gray-500 ml-auto"
                    >9 items</span
                  >
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  ${meal.ingredients
                .map((data) => {
                    return `
                      <div
                        class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                        />
                        <span class="text-gray-700">
                          <span class="font-medium text-gray-900">${data.measure}</span> ${data.ingredient}
                        </span>
                      </div>
                      `;
                })
                .join("")}
                </div>
              </div>

              <!-- Instructions -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                  Instructions
                </h2>
                <div class="space-y-4">
                  ${meal.instructionsList
                .split("\r\n")
                .map((data, index) => {
                    if (!data) return "";
                    return `
                      <div
                    class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                    >
                      ${index + 1}
                    </div>
                    <p class="text-gray-700 leading-relaxed pt-2">
                      ${data}
                    </p>
                  </div>
                      `;
                })
                .join("")}
                </div>
              </div>

              <!-- Video Section -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div
                  class="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                >
                  <iframe
                    src="${embedUrl}"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                    "
                    allowfullscreen
                  >
                  </iframe>
                </div>
              </div>
            </div>

            <!-- Right Column - Nutrition -->
            <div class="space-y-6">
              <!-- Nutrition Facts -->
              <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                  Nutrition Facts
                </h2>
                <div id="nutrition-facts-container">
                    <div class="text-center py-8">
  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
    <i class="animate-pulse text-emerald-600 text-xl" data-fa-i2svg="">
      <svg
        class="svg-inline--fa fa-calculator"
        data-prefix="fas"
        data-icon="calculator"
        role="img"
        viewBox="0 0 384 512"
        aria-hidden="true"
        data-fa-i2svg=""
      >
        <path
          fill="currentColor"
          d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM96 64l192 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32L96 160c-17.7 0-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32zm16 168a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zm80 24a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm128-24a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zM88 352a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm128-24a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zm80 24a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM64 424c0-13.3 10.7-24 24-24l112 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 448c-13.3 0-24-10.7-24-24zm232-24c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24z"
        ></path>
      </svg>
    </i>
  </div>
  <p class="text-gray-700 font-medium mb-1">Calculating Nutrition</p>
  <p class="text-sm text-gray-500">Analyzing ingredients...</p>
  <div class="mt-4 flex justify-center">
    <div class="flex space-x-1">
      <div
        class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
        style="animation-delay: 0ms"
      ></div>
      <div
        class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
        style="animation-delay: 150ms"
      ></div>
      <div
        class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
        style="animation-delay: 300ms"
      ></div>
    </div>
  </div>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  `;
        this.home.mealDetails.classList.remove("hidden");
        const backToMealsBtn = document.getElementById("back-to-meals-btn");
        backToMealsBtn.addEventListener("click", (e) => {
            // history.back(); not working for me as i wish
            window.location.hash = "#/home";
        });
        const nutritions = await this.nutriPlanServices.getNutritions(
            meal.name,
            ingredients,
        );
        const proteinPercentage = Math.min(
            (nutritions.perServing.protein / 50) * 100,
            100,
        );
        const carbsPercentage = Math.min(
            (nutritions.perServing.carbs / 275) * 100,
            100,
        );
        const fatPercentage = Math.min((nutritions.perServing.fat / 78) * 100, 100);
        const fiberPercentage = Math.min(
            (nutritions.perServing.fiber / 28) * 100,
            100,
        );
        const sugarPercentage = Math.min(
            (nutritions.perServing.sugar / 50) * 100,
            100,
        );
        const saturatedFatPercentage = Math.min(
            (nutritions.perServing.saturatedFat / 20) * 100,
            100,
        );
        const logMealBtn = document.getElementById("log-meal-btn");
        document.getElementById("hero-calories").innerText =
            `${nutritions.perServing.calories} cal/serving`;
        logMealBtn.innerHTML = `
              <i class="fa-solid fa-clipboard-list"></i>
              <span>Log This Meal</span>
  `;

        logMealBtn.classList.replace("bg-gray-300", "bg-blue-600");
        logMealBtn.classList.add("hover:bg-blue-700");
        document.getElementById("hero-servings").innerText =
            `${nutritions.servings} servings`;
        document.getElementById("nutrition-facts-container").innerHTML = `
                  <p class="text-sm text-gray-500 mb-4">Per serving</p>
                  <div
                    class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl"
                  >
                    <p class="text-sm text-gray-600">Calories per serving</p>
                    <p class="text-4xl font-bold text-emerald-600">${nutritions.perServing.calories}</p>
                    <p class="text-xs text-gray-500 mt-1">Total: ${nutritions.totals.calories} cal</p>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="text-gray-700">Protein</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutritions.perServing.protein}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-emerald-500 h-2 rounded-full"
                        style="width: ${proteinPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-gray-700">Carbs</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutritions.perServing.carbs}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full"
                        style="width: ${carbsPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span class="text-gray-700">Fat</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutritions.perServing.fat}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-purple-500 h-2 rounded-full"
                        style="width: ${fatPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span class="text-gray-700">Fiber</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutritions.perServing.fiber}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-orange-500 h-2 rounded-full"
                        style="width: ${fiberPercentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span class="text-gray-700">Sugar</span>
                      </div>
                      <span class="font-bold text-gray-900">${nutritions.perServing.sugar}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-pink-500 h-2 rounded-full"
                        style="width: ${sugarPercentage}%"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <span class="text-gray-700">Saturated Fat</span>
                    </div>
                    <span class="font-bold text-gray-900">${nutritions.perServing.saturatedFat}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" style="width: ${saturatedFatPercentage}%"></div>
                    </div>
                  </div>

                  <div class="mt-6 pt-6 border-t border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-900 mb-3">
                      Other
                    </h3>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cholesterol</span>
                        <span class="font-medium">${nutritions.perServing.cholesterol}mg</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Sodium</span>
                        <span class="font-medium">${nutritions.perServing.sodium}mg</span>
                    </div>
                    </div>
                  </div>
  `;
        logMealBtn.addEventListener("click", (e) => {
            const btn = e.target.closest("#log-meal-btn");
            if (!btn) return;
            this.logMealModal.innerHTML = `
            <div id="innerModel" class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-4 mb-6">
          <img
            src="${meal.thumbnail}"
            alt="${meal.name}"
            class="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${meal.name}</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2"
            >Number of Servings</label
          >
          <div class="flex items-center gap-3">
            <button
              id="decrease-servings"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <i class="fa-solid fa-minus text-gray-600" aria-hidden="true" data-icon="minus"></i>
            </button>
            <input
              type="number"
              id="meal-servings"
              value="1"
              min="0.5"
              max="10"
              step="0.5"
              class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2"
            />
            <button
              id="increase-servings"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <i class="fa-solid fa-plus text-gray-600" aria-hidden="true" data-icon="plus"></i>
            </button>
          </div>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">
            Estimated nutrition per serving:
          </p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-emerald-600" id="modal-calories">
                ${nutritions.perServing.calories}
              </p>
              <p class="text-xs text-gray-500">Calories</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600" id="modal-protein">
                ${nutritions.perServing.protein}g
              </p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div>
              <p class="text-lg font-bold text-amber-600" id="modal-carbs">
                ${nutritions.perServing.carbs}g
              </p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div>
              <p class="text-lg font-bold text-purple-600" id="modal-fat">
                ${nutritions.perServing.fat}g
              </p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            id="cancel-log-meal"
            class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            id="confirm-log-meal"
            class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            <i class="fa-solid fa-clipboard-list mr-2" aria-hidden="true"></i>
            Log Meal
          </button>
        </div>
      </div>
    `;

            window.addEventListener("click", (e) => {
                const btn = e.target.closest("#log-meal-btn");
                if (btn) return;
                const ele = e.target.closest("#innerModel");
                if (ele) return;
                this.logMealModal.innerHTML = "";
                this.logMealModal.classList.replace("fixed", "hidden");
            });
            const confirmLogMeal = document.getElementById("confirm-log-meal");
            const cancelLogMeal = document.getElementById("cancel-log-meal");
            const decreaseServingsBtn = document.getElementById("decrease-servings");
            const increaseServingsBtn = document.getElementById("increase-servings");
            const mealServingsCount = document.getElementById("meal-servings");

            let counter = mealServingsCount.value;

            decreaseServingsBtn.addEventListener("click", (e) => {
                if (counter > 0.5) counter = +mealServingsCount.value - 0.5;
                mealServingsCount.value = counter;
                counter = mealServingsCount.value;
            });

            increaseServingsBtn.addEventListener("click", (e) => {
                if (counter < 10) counter = +mealServingsCount.value + 0.5;
                mealServingsCount.value = counter;
                counter = mealServingsCount.value;
            });

            cancelLogMeal.addEventListener("click", (e) => {
                this.logMealModal.classList.replace("fixed", "hidden");
            });
            confirmLogMeal.addEventListener("click", (e) => {
                let dataStorge = JSON.parse(localStorage.getItem("meals"));
                let meals;
                const now = new Date();
                let newMeal = {
                    src: "Recipe",
                    id: meal.id,
                    name: meal.name,
                    img: meal.thumbnail,
                    date: now.toLocaleDateString("en-US"),
                    time: now.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    serving: counter,
                    calories: nutritions.perServing.calories,
                    protein: nutritions.perServing.protein,
                    carbs: nutritions.perServing.carbs,
                    fat: nutritions.perServing.fat,
                };
                if (dataStorge) {
                    meals = JSON.stringify([...dataStorge, newMeal]);
                } else {
                    meals = JSON.stringify([newMeal]);
                }
                localStorage.setItem("meals", meals);
                this.logMealModal.classList.replace("fixed", "hidden");
                Swal.fire({
                    title: `Chicken Handi (${counter} serving) has been added to your daily log.`,
                    icon: "success",
                    html: `<p style="color: green;">+${counter * nutritions.perServing.calories} calories</p>`,
                    timer: 1000,
                    draggable: false,
                });
            });
            this.logMealModal.classList.replace("hidden", "fixed");
        });
    };
    initEvents() {
        this.categoriesGrid.addEventListener("click", this.fetchMealData);
        this.viewAllBtn.addEventListener("click", this.viewAllCurentAreaMeals);
        this.viewToggle.addEventListener("click", this.changeMealsDisplayStyle);
        this.area.addEventListener("click", this.showAreaMeals);
        this.searchInput.addEventListener("input", this.search);
        this.recipesGrid.addEventListener("click", async (e) => {
            const mealCard = e.target.closest(".recipe-card");
            if (!mealCard) return;
            this.mealId = mealCard.dataset.mealId;
            history.replaceState({}, "", "#/meal/");
            this.router();
        });
    }
}
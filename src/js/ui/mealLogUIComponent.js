export default class MealLoge {
    #calories = 2000;
    #protein = 50;
    #carbs = 250;
    #fat = 65;
    #borderT;
    #clearFoodLogBtn;
    #loggedItemsListContainer;
    #meals;
    #mealsCount;
    #totalKcal;
    #totalKcalBar;
    #totaltotalProtein;
    #totaltotalProteinBar;
    #totalCarbs;
    #totalCarbsBar;
    #totalFat;
    #totalFatBar;
    #weeklyChart;
    #today;
    #WeeklyAverage;
    #totalekcal = 0;
    #itemsThisWeek;
    #prsntgeCal;
    #prsntgeProt;
    #prsntgeCarb;
    #prsntgeFat;
    #donMSG;
    #realMeals;
    constructor() {
        this.#borderT = document.querySelector(".border-t h4 span");
        this.#clearFoodLogBtn = document.getElementById("clear-foodlog");
        this.#loggedItemsListContainer =
            document.getElementById("logged-items-list");
        this.#totalKcal = document.getElementById("totalKcal");
        this.#totalKcalBar = document.getElementById("totalKcalBar");
        this.#totaltotalProtein = document.getElementById("totalProtein");
        this.#totaltotalProteinBar = document.getElementById("totalProteinBar");
        this.#totalCarbs = document.getElementById("totalCarbs");
        this.#totalCarbsBar = document.getElementById("totalCarbsBar");
        this.#totalFat = document.getElementById("totalFat");
        this.#totalFatBar = document.getElementById("totalFatBar");
        this.#weeklyChart = document.getElementById("weekly-chart");
        this.#WeeklyAverage = document.getElementById("WeeklyAverage");
        this.#itemsThisWeek = document.getElementById("itemsThisWeek");

        this.#prsntgeCal = document.getElementById("prsntgeCal");
        this.#prsntgeProt = document.getElementById("prsntgeProt");
        this.#prsntgeCarb = document.getElementById("prsntgeCarb");
        this.#prsntgeFat = document.getElementById("prsntgeFat");
        this.#donMSG = document.getElementById("donMSG");
    }
    #createMealCard(meal, index) {
        let mealImg = `
                <div class="v_small_img bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <i class="text-4xl text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-box" data-prefix="fas" data-icon="box" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"></path></svg></i>
                </div>
    `;
        if (meal.img) {
            mealImg = `
        <img src="${meal.img}" alt="${meal.name}" class="w-14 h-14 rounded-xl object-cover">
      `;
        }
        return `
                    <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
                        <div class="flex items-center gap-4">
                            ${mealImg}
                            <div>
                                <p class="font-semibold text-gray-900">Chicken Congee</p>
                                <p class="text-sm text-gray-500">
                                    ${meal.src === "Recipe" ? `${meal.serving} serving` : meal.brand}
                                    <span class="mx-1">•</span>
                                    <span class="${meal.src === "Recipe" ? `text-emerald-600` : `text-blue-600`}">${meal.src}</span>
                                </p>
                                <p class="text-xs text-gray-400 mt-1">${meal.time}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <p class="text-lg font-bold text-emerald-600">${Math.round(meal.calories)}</p>
                                <p class="text-xs text-gray-500">kcal</p>
                            </div>
                            <div class="hidden md:flex gap-2 text-xs text-gray-500">
                                <span class="px-2 py-1 bg-blue-50 rounded">${meal.protein.toFixed(2)}g P</span>
                                <span class="px-2 py-1 bg-amber-50 rounded">${meal.carbs.toFixed(2)}g C</span>
                                <span class="px-2 py-1 bg-purple-50 rounded">${meal.fat.toFixed(2)}g F</span>
                            </div>
                            <button class="remove-foodlog-item text-gray-400 hover:text-red-500 transition-all p-2" data-index="${index}">
                                <i data-fa-i2svg=""><svg class="svg-inline--fa fa-trash-can" data-prefix="fas" data-icon="trash-can" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M136.7 5.9C141.1-7.2 153.3-16 167.1-16l113.9 0c13.8 0 26 8.8 30.4 21.9L320 32 416 32c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 8.7-26.1zM32 144l384 0 0 304c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-304zm88 64c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24z"></path></svg></i>
                            </button>
                        </div>
                    </div>
    `;
    }
    #clear = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                this.#donMSG.innerHTML = `
          <div
            class="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification"
          >
            Item removed from log
          </div>
      `;
                localStorage.removeItem("meals");
                this.getMealsData();
                Swal.fire({
                    title: `Done.`,
                    icon: "success",
                    timer: 1000,
                    draggable: false,
                });
            }
        });
    };
    #delete(btn) {
        this.#donMSG.innerHTML = `
          <div
            class="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification"
          >
            Item removed from log
          </div>
      `;
        if (this.#meals.length <= 1) {
            localStorage.removeItem("meals");
            this.getMealsData();
            return;
        }
        this.#realMeals.splice(btn.dataset.index, 1);
        let newMealsArr = JSON.stringify(this.#realMeals);
        localStorage.setItem("meals", newMealsArr);
        this.getMealsData();
    }
    #initTotaleMealsInfo() {
        let totale = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        };
        let meals = this.#meals;
        if (meals) {
            for (let i = 0; i < meals.length; i++) {
                totale.calories += meals[i].calories;
                totale.protein += meals[i].protein;
                totale.carbs += meals[i].carbs;
                totale.fat += meals[i].fat;
            }
        }

        this.#totalKcal.innerText = `${Math.round(totale.calories)} / ${this.#calories} kcal`;
        this.#totalKcalBar.style.width = `${Math.min((totale.calories / this.#calories) * 100, 100)}%`;
        if (+totale.calories >= this.#calories) {
            this.#totalKcalBar.classList.add("bg-red-500");
            this.#prsntgeCal.classList.add("text-red-500");
        } else {
            this.#totalKcalBar.classList.remove("bg-red-500");
            this.#prsntgeCal.classList.remove("text-red-500");
        }
        this.#totaltotalProtein.innerText = `${totale.protein.toFixed(2)} / ${this.#protein} g`;
        this.#totaltotalProteinBar.style.width = `${Math.min((totale.protein / this.#protein) * 100, 100)}%`;
        if (+totale.protein >= this.#protein) {
            this.#totaltotalProteinBar.classList.add("bg-red-500");
            this.#prsntgeProt.classList.add("text-red-500");
        } else {
            this.#totaltotalProteinBar.classList.remove("bg-red-500");
            this.#prsntgeProt.classList.remove("text-red-500");
        }
        this.#totalCarbs.innerText = `${totale.carbs.toFixed(2)} / ${this.#carbs} g`;
        this.#totalCarbsBar.style.width = `${Math.min((totale.carbs / this.#carbs) * 100, 100)}%`;
        if (+totale.carbs >= this.#carbs) {
            this.#totalCarbsBar.classList.add("bg-red-500");
            this.#prsntgeCarb.classList.add("text-red-500");
        } else {
            this.#totalCarbsBar.classList.remove("bg-red-500");
            this.#prsntgeCarb.classList.remove("text-red-500");
        }
        this.#totalFat.innerText = `${totale.fat.toFixed(2)} / ${this.#fat} g`;
        this.#totalFatBar.style.width = `${Math.min((totale.fat / this.#fat) * 100, 100)}%`;
        if (+totale.fat >= this.#fat) {
            this.#totalFatBar.classList.add("bg-red-500");
            this.#prsntgeFat.classList.add("text-red-500");
        } else {
            this.#totalFatBar.classList.remove("bg-red-500");
            this.#prsntgeFat.classList.remove("text-red-500");
        }

        this.#prsntgeCal.innerText =
            Math.min(Math.round((totale.calories / this.#calories) * 100), 100) + "%";
        this.#prsntgeProt.innerText =
            Math.min(Math.round((totale.protein / this.#protein) * 100), 100) + "%";
        this.#prsntgeCarb.innerText =
            Math.min(Math.round((totale.carbs / this.#carbs) * 100), 100) + "%";
        this.#prsntgeFat.innerText =
            Math.min(Math.round((totale.fat / this.#fat) * 100), 100) + "%";
    }
    #createDaysCard(data) {
        this.#totalekcal += +data.totalCalories;
        const currntDayStyle = "bg-indigo-100 rounded-xl";
        const dayWithCalStyle = data.totalCalories
            ? "text-emerald-600"
            : "text-gray-300";
        return `
                            <div class="text-center ${+data.day === this.#today ? currntDayStyle : ""}">
                                <p class="text-xs text-gray-500 mb-1">${data.weekday}</p>
                                <p class="text-sm font-medium text-gray-900">${data.day}</p>
                                <div class="mt-2 ${dayWithCalStyle}">
                                    <p class="text-lg font-bold">${Math.round(+data.totalCalories)}</p>
                                    <p class="text-xs">kcal</p>
                                </div>
                                
                            </div>
    `;
    }
    #initWeeklyChart() {
        const meals = this.#meals;
        const today = new Date();
        const weekDays = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            let [day, weekday] = date
                .toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                })
                .split(" ");
            const dateString = date.toLocaleDateString("en-US");

            let totalCalories = 0;

            if (meals) {
                for (let j = 0; j < this.#meals.length; j++) {
                    if (this.#meals[j].date === dateString) {
                        totalCalories += this.#meals[j].calories;
                    }
                }
            }

            weekDays.push({
                day,
                weekday,
                totalCalories,
            });
        }
        this.#today = today.getDate();
        let htmlBlock = "";
        for (let i = 0; i < weekDays.length; i++) {
            htmlBlock += this.#createDaysCard(weekDays[i]);
        }
        this.#weeklyChart.innerHTML = htmlBlock;
        if (this.#meals) {
            this.#WeeklyAverage.innerText = Math.round(this.#totalekcal / 7);
            this.#itemsThisWeek.innerText = this.#mealsCount;
        }
    }
    getMealsData() {
        const meals = JSON.parse(localStorage.getItem("meals"));
        if (!meals) {
            this.#meals = [];
            this.#initTotaleMealsInfo();
            this.#initWeeklyChart();
            this.#clearFoodLogBtn.classList.add("hidden");
            this.#borderT.innerText = `(0)`;
            this.#loggedItemsListContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                  <i
                    class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"
                  ></i>
                  <p class="font-medium">No meals logged today</p>
                  <p class="text-sm mb-4">
                    Add meals from the Meals page or scan products
                  </p>
                  <div class="flex justify-center gap-3">
                        <a href="#/home" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                            <i data-fa-i2svg=""><svg class="svg-inline--fa fa-plus" data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"></path></svg></i>
                            Browse Recipes
                        </a>
                        <a href="#/products" class="nav-link inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                            <i data-fa-i2svg=""><svg class="svg-inline--fa fa-barcode" data-prefix="fas" data-icon="barcode" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32L64 64c0-17.7-14.3-32-32-32zm88 0c-13.3 0-24 10.7-24 24l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24zm72 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32zm208-8l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24s-24 10.7-24 24zm-96 0l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24s-24 10.7-24 24z"></path></svg></i>
                            Scan Product
                        </a>
                    </div>
                </div>
      `;
            this.#WeeklyAverage.innerText = "0";
            this.#itemsThisWeek.innerText = "0";
            return;
        }
        this.#realMeals = meals;
        let todayMeals = [];
        let htmlBlock = "";
        for (let i = 0; i < meals.length; i++) {
            if (meals[i].date === new Date().toLocaleDateString("en-US")) {
                htmlBlock += this.#createMealCard(meals[i], i);
                todayMeals.push(meals[i]);
            }
        }
        this.#meals = todayMeals;
        this.#mealsCount = meals.length;
        this.#initTotaleMealsInfo();
        this.#initWeeklyChart();
        this.#clearFoodLogBtn.classList.remove("hidden");
        this.#borderT.innerText = `(${meals.length})`;
        this.#loggedItemsListContainer.innerHTML = htmlBlock;
        const removeFoodlogItem = document.querySelectorAll(".remove-foodlog-item");

        this.#clearFoodLogBtn.removeEventListener("click", this.#clear);
        this.#clearFoodLogBtn.addEventListener("click", this.#clear);
        removeFoodlogItem.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.#delete(btn);
            });
        });
    }
}
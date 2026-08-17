export default class MealCategories {
    #container;
    #category;
    constructor(container) {
        this.#container = container;
    }
    #setThemeClass() {
        const category = this.#category.toLowerCase();
        let cardTheme;
        let iconTheme;
        if (category === "beef" || category === "goat") {
            cardTheme = "from-red-50 to-rose-50 border-red-200 hover:border-red-400";
            iconTheme = "from-red-400 to-rose-500";
        } else if (category === "chicken") {
            cardTheme =
                "from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400";
            iconTheme = "from-amber-400 to-orange-500";
        } else if (category === "dessert") {
            cardTheme =
                "from-pink-50 to-rose-50 border-pink-200 hover:border-pink-400";
            iconTheme = "from-pink-400 to-rose-500";
        } else if (category === "lamb") {
            cardTheme =
                "from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400";
            iconTheme = "from-orange-400 to-amber-500";
        } else if (category === "miscellaneous") {
            cardTheme =
                "from-slate-50 to-gray-50 border-slate-200 hover:border-slate-400";
            iconTheme = "from-slate-400 to-gray-500";
        } else if (category === "pasta") {
            cardTheme =
                "from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-400";
            iconTheme = "from-yellow-400 to-amber-500";
        } else if (category === "pork") {
            cardTheme =
                "from-rose-50 to-red-50 border-rose-200 hover:border-rose-400";
            iconTheme = "from-rose-400 to-red-500";
        } else if (category === "seafood") {
            cardTheme =
                "from-cyan-50 to-blue-50 border-cyan-200 hover:border-cyan-400";
            iconTheme = "from-cyan-400 to-blue-500";
        } else if (category === "side") {
            cardTheme =
                "from-green-50 to-emerald-50 border-green-200 hover:border-green-400";
            iconTheme = "from-green-400 to-emerald-500";
        } else if (category === "vegan") {
            cardTheme =
                "from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-400";
            iconTheme = "from-emerald-400 to-green-500";
        } else if (category === "vegetarian") {
            cardTheme =
                "from-lime-50 to-green-50 border-lime-200 hover:border-lime-400";
            iconTheme = "from-lime-400 to-green-500";
        } else {
            cardTheme =
                "from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-400";
            iconTheme = "from-teal-400 to-cyan-500";
        }
        return { cardTheme, iconTheme };
    }
    #setIconClass() {
        const category = this.#category.toLowerCase();
        if (
            category === "beef" ||
            category === "chicken" ||
            category === "lamb" ||
            category === "goat"
        ) {
            return "fa-drumstick-bite";
        } else if (category === "dessert") {
            return "fa-cake-candles";
        } else if (category === "miscellaneous") {
            return "fa-bowl-rice";
        } else if (category === "pasta") {
            return "fa-bowl-food";
        } else if (category === "pork") {
            return "fa-bacon";
        } else if (category === "seafood") {
            return "fa-fish";
        } else if (category === "side") {
            return "fa-plate-wheat";
        } else if (category === "Vegan") {
            return "fa-leaf";
        } else if (category === "Vegetarian") {
            return "fa-seedling";
        } else {
            return "fa-utensils";
        }
    }
    #createCategoryBtn(category) {
        this.#category = category;
        const { cardTheme, iconTheme } = this.#setThemeClass();
        return `
            <div
              class="category-card bg-gradient-to-br ${cardTheme} rounded-xl p-3 border hover:shadow-md cursor-pointer transition-all group"
              data-category="${category}"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="w-9 h-9 bg-gradient-to-br ${iconTheme} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                >
                  <i class="fa-solid ${this.#setIconClass()} text-sm text-white"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">${category}</h3>
                </div>
              </div>
            </div>
      `;
    }
    render(categories) {
        let htmlBlock = "";
        for (let i = 0; i < categories.length; i++) {
            htmlBlock += this.#createCategoryBtn(categories[i]);
        }
        this.#container.innerHTML = htmlBlock;
    }
}
export default class Meals {
    #container;
    #title;
    constructor(container, title) {
        this.#container = container;
        this.#title = title;
    }
    showLoadingState() {
        this.#container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>`;

        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }
    #createMealCard(meal) {
        let instructions = meal.instructions.join("");

        instructions =
            instructions.length > 100
                ? instructions.slice(0, 100) + "..."
                : instructions;

        return `
            <div
              class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              data-meal-id="${meal.id}"
            >
              <div class="card_image relative h-48 overflow-hidden">
                <img
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src="${meal.thumbnail}"
                  alt="${meal.name}"
                  loading="lazy"
                />
                <div class="image_tags absolute bottom-3 left-3 flex gap-2">
                  <span
                    class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
                  >
                    ${meal.category}
                  </span>
                  ${meal.area
                ? `
                    <span
                    class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
                  >
                    ${meal.area}
                  </span>
                    `
                : ``
            }
                </div>
              </div>
              <div class="p-4">
                <h3
                  class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                >
                  ${meal.name}
                </h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                  ${instructions}
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-gray-900">
                    <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                    ${meal.category}
                  </span>
                  <span class="font-semibold text-gray-500">
                    <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                    ${meal.area || "International"}
                  </span>
                </div>
              </div>
            </div>
      `;
    }
    render(meals, category = " ", isSearch = false) {
        try {
            if (!meals.length) throw new Error();
            let htmlBlock = "";
            for (let i = 0; i < meals.length; i++) {
                htmlBlock += this.#createMealCard(meals[i]);
            }
            if (!isSearch || !category) {
                this.#title.textContent = `Showing ${meals.length} ${category ? category : ""} recipes`;
            } else {
                this.#title.textContent = `Showing ${meals.length} recipes for "${category}"`;
            }
            this.#container.innerHTML = htmlBlock;
        } catch (e) {
            this.#title.textContent = `Showing 0 recipes`;
            this.#container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No recipes found</p>
          <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
        </div>
      `;
        }
    }
}
export default class MealsArea {
    #container;
    constructor(container) {
        this.#container = container;
    }
    #createAreaBtn(area) {
        return `
            <button
              class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
              data-area="${area}"
            >
              ${area}
            </button>
      `;
    }
    render(areas) {
        let htmlBlock = `
            <button
              class="area-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
              data-area=""
            >
              All Cuisines
            </button>
    `;
        for (let i = 0; i < 10; i++) {
            htmlBlock += this.#createAreaBtn(areas[i]);
        }
        this.#container.innerHTML = htmlBlock;
    }
}
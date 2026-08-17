export default class NutriPlanServices {
    #baseApi;
    #api;
    #loader;
    constructor(baseApi, loader) {
        this.#baseApi = baseApi;
        this.#loader = loader;
        this.toggleLoader();
    }
    getAllAreas() {
        this.#api = `${this.#baseApi}meals/areas`;
        return this;
    }
    getAllCategorys() {
        this.#api = `${this.#baseApi}meals/categories`;
        return this;
    }
    toggleLoader() {
        this.#loader.classList.toggle("loading");
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }
    searchMeals(text) {
        this.#api = `https://www.themealdb.com/api/json/v1/1/search.php?s=${text}`;
        return this;
    }
    async fetchMealsById(data) {
        if (typeof data === typeof "") {
            try {
                let res = await fetch(
                    `https://nutriplan-api.vercel.app/api/meals/${data}`,
                );
                let resulte = (await res.json()).result;
                let instructionsRes = await fetch(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data}`,
                );
                let instructions = (await instructionsRes.json()).meals;
                return {
                    ...resulte,
                    instructionsList: instructions[0].strInstructions,
                };
            } catch (e) {
                return [];
            }
        }
        try {
            let arr = await Promise.all(
                data.map(async (e) => {
                    let res = await fetch(
                        `https://nutriplan-api.vercel.app/api/meals/${e.idMeal}`,
                    );
                    return (await res.json()).result;
                }),
            );
            return arr;
        } catch (e) {
            return [];
        }
    }
    async fetchAllAreaMeals({ area, meal, filter = true }) {
        let api = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;
        try {
            const res = await fetch(api);
            const data = (await res.json()).meals;
            if (!data) throw new Error();
            let arr = await this.fetchMealsById(data);
            if (filter) arr = arr.filter((e) => e.category === meal);
            return arr;
        } catch (e) {
            return [];
        }
    }
    async getNutritions(name, ingredients) {
        try {
            const res = await fetch(
                `https://nutriplan-api.vercel.app/api/nutrition/analyze`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": "7GHFJcafuOo0tD1tBUa2LXhIBOsLLKy4ZPebSsCC",
                    },
                    body: JSON.stringify({
                        recipeName: name,
                        ingredients: ingredients,
                    }),
                },
            );
            const data = (await res.json()).data;
            if (!data) throw new Error();
            return data;
        } catch (e) {
            return [];
        }
    }
    generateApi({ collaction, method, searchType, meal, limit }) {
        this.#api = `https://nutriplan-api.vercel.app/api/${collaction}/${method}?${searchType}=${meal}&page=1&limit=${limit}`;
    }
    async getSearchData() {
        try {
            const res = await fetch(this.#api);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data;
        } catch (e) {
            return [];
        }
    }
    async getData() {
        try {
            const res = await fetch(this.#api);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data.results;
        } catch (e) {
            return [];
        }
    }
}
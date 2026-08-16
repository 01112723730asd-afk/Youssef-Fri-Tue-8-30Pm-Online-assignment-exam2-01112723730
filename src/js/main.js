// /**
//  * NutriPlan - Main Entry Point
//  * 
//  * This is the main entry point for the application.
//  * Import your modules and initialize the app here.
//  */



/* =========================================================
   NutriPlan App - نسخة جافا اسكربت مبسطة وواضحة
   (بدون TypeScript وبدون أدوات بناء، أسماء متغيرات واضحة)
   ========================================================= */

/* ============ 1) MealDB API ============ */

const MEALDB_API = "https://www.themealdb.com/api/json/v1/1";

async function searchMealsByName(query) {
    try {
        const res = await fetch(`${MEALDB_API}/search.php?s=${encodeURIComponent(query)}`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error searching meals by name:", err);
        return [];
    }
}

async function searchMealsByFirstLetter(letter) {
    try {
        const res = await fetch(`${MEALDB_API}/search.php?f=${letter}`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error searching meals by letter:", err);
        return [];
    }
}

async function filterMealsByIngredient(ingredient) {
    try {
        const res = await fetch(`${MEALDB_API}/filter.php?i=${encodeURIComponent(ingredient)}`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error filtering meals by ingredient:", err);
        return [];
    }
}

async function filterMealsByCategory(category) {
    try {
        const res = await fetch(`${MEALDB_API}/filter.php?c=${encodeURIComponent(category)}`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error filtering meals by category:", err);
        return [];
    }
}

async function filterMealsByArea(area) {
    try {
        const res = await fetch(`${MEALDB_API}/filter.php?a=${encodeURIComponent(area)}`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error filtering meals by area:", err);
        return [];
    }
}

async function getAllCategories() {
    try {
        const res = await fetch(`${MEALDB_API}/categories.php`);
        const data = await res.json();
        return data.categories || [];
    } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
    }
}

async function getCategoryList() {
    try {
        const res = await fetch(`${MEALDB_API}/list.php?c=list`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error fetching category list:", err);
        return [];
    }
}

async function getAreaList() {
    try {
        const res = await fetch(`${MEALDB_API}/list.php?a=list`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error fetching area list:", err);
        return [];
    }
}

async function getIngredientList() {
    try {
        const res = await fetch(`${MEALDB_API}/list.php?i=list`);
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error("Error fetching ingredient list:", err);
        return [];
    }
}

async function getMealById(id) {
    try {
        const res = await fetch(`${MEALDB_API}/lookup.php?i=${id}`);
        const data = await res.json();
        return data.meals ? data.meals[0] : null;
    } catch (err) {
        console.error("Error fetching meal by ID:", err);
        return null;
    }
}

async function getRandomMeal() {
    try {
        const res = await fetch(`${MEALDB_API}/random.php`);
        const data = await res.json();
        return data.meals ? data.meals[0] : null;
    } catch (err) {
        console.error("Error fetching random meal:", err);
        return null;
    }
}

async function getMultipleRandomMeals(count = 5) {
    try {
        const requests = Array(count).fill().map(() => getRandomMeal());
        const results = await Promise.all(requests);
        return results.filter(meal => meal !== null);
    } catch (err) {
        console.error("Error fetching multiple random meals:", err);
        return [];
    }
}

// يحول بيانات الوجبة القادمة من الـ API (strIngredient1..20) إلى مصفوفة مرتبة
function extractIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push({
                ingredient: ingredient.trim(),
                measure: measure ? measure.trim() : ""
            });
        }
    }
    return ingredients;
}

function getIngredientThumbnail(name, size = "small") {
    const suffix = size === "medium" ? "-medium" : "-small";
    return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}${suffix}.png`;
}

// يحول نص التعليمات الخام إلى مصفوفة خطوات منظفة
function parseInstructions(rawText) {
    if (!rawText) return [];
    return rawText
        .split(/(?:\r\n|\r|\n)+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+[.)]\s*/, ""))
        .filter(line => {
            if (/^step\s*\d+\.?$/i.test(line) || /^\d+\.?$/.test(line)) return false;
            return line.length > 5;
        });
}

const MealDB = {
    searchMealsByName,
    searchMealsByFirstLetter,
    filterMealsByIngredient,
    filterMealsByCategory,
    filterMealsByArea,
    getAllCategories,
    getCategoryList,
    getAreaList,
    getIngredientList,
    getMealById,
    getRandomMeal,
    getMultipleRandomMeals,
    extractIngredients,
    getIngredientThumbnail,
    parseInstructions
};

/* ============ 2) Nutrition API ============ */

const NUTRITION_API = "https://nutriplan-api.vercel.app/api";
const NUTRITION_API_KEY = "xRGnhxcXrKuX8hJpeeQE5Rac9b7dyQDpaMs5fWFL";
const nutritionCache = new Map();

function clearNutritionCache() {
    nutritionCache.clear();
}

async function analyzeRecipe(recipeName, ingredientsList) {
    const cacheKey = `recipe_${recipeName}_${ingredientsList.join("|")}`;
    if (nutritionCache.has(cacheKey)) {
        return nutritionCache.get(cacheKey);
    }

    try {
        const res = await fetch(`${NUTRITION_API}/nutrition/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": NUTRITION_API_KEY
            },
            body: JSON.stringify({
                recipeName: recipeName,
                ingredients: ingredientsList
            })
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            console.error("❌ Nutrition API error:", errorBody);
            throw new Error(errorBody.error?.message || `API error: ${res.status}`);
        }

        const json = await res.json();
        if (!json.success) {
            console.error("❌ API returned failure:", json);
            throw new Error(json.error?.message || json.error || "Analysis failed");
        }

        const data = json.data;
        const result = {
            uri: `nutriplan://nutrition/${Date.now()}`,
            yield: data.servings,
            calories: data.totals.calories,
            totalWeight: data.totalWeight,
            dietLabels: [],
            healthLabels: [],
            cautions: [],
            totals: data.totals,
            perServing: data.perServing,
            totalNutrients: {
                ENERC_KCAL: { label: "Energy", quantity: data.totals.calories, unit: "kcal" },
                FAT: { label: "Fat", quantity: data.totals.fat, unit: "g" },
                FASAT: { label: "Saturated Fat", quantity: data.totals.saturatedFat, unit: "g" },
                CHOCDF: { label: "Carbohydrates", quantity: data.totals.carbs, unit: "g" },
                FIBTG: { label: "Fiber", quantity: data.totals.fiber, unit: "g" },
                SUGAR: { label: "Sugars", quantity: data.totals.sugar, unit: "g" },
                PROCNT: { label: "Protein", quantity: data.totals.protein, unit: "g" },
                CHOLE: { label: "Cholesterol", quantity: data.totals.cholesterol, unit: "mg" },
                NA: { label: "Sodium", quantity: data.totals.sodium, unit: "mg" }
            },
            totalDaily: calculateDailyValues(data.totals),
            ingredients: data.ingredients.map(item => ({
                text: item.original,
                food: item.matched?.description || item.parsed?.foodName,
                grams: item.grams,
                calories: item.nutrition?.calories || 0,
                protein: item.nutrition?.protein || 0,
                fat: item.nutrition?.fat || 0,
                carbs: item.nutrition?.carbs || 0
            }))
        };

        nutritionCache.set(cacheKey, result);
        return result;
    } catch (err) {
        console.error("❌ Error analyzing recipe:", err);
        return getFallbackNutritionData(recipeName, ingredientsList);
    }
}

// يحسب النسبة المئوية من الاحتياج اليومي الموصى به (على أساس نظام 2000 سعرة)
function calculateDailyValues(totals) {
    const dailyTargets = {
        calories: 2000,
        fat: 65,
        saturatedFat: 20,
        carbs: 300,
        fiber: 25,
        protein: 50,
        cholesterol: 300,
        sodium: 2400
    };

    return {
        ENERC_KCAL: { label: "Energy", quantity: Math.round(totals.calories / dailyTargets.calories * 100), unit: "%" },
        FAT: { label: "Fat", quantity: Math.round(totals.fat / dailyTargets.fat * 100), unit: "%" },
        FASAT: { label: "Saturated Fat", quantity: Math.round(totals.saturatedFat / dailyTargets.saturatedFat * 100), unit: "%" },
        CHOCDF: { label: "Carbohydrates", quantity: Math.round(totals.carbs / dailyTargets.carbs * 100), unit: "%" },
        FIBTG: { label: "Fiber", quantity: Math.round(totals.fiber / dailyTargets.fiber * 100), unit: "%" },
        PROCNT: { label: "Protein", quantity: Math.round(totals.protein / dailyTargets.protein * 100), unit: "%" },
        CHOLE: { label: "Cholesterol", quantity: Math.round(totals.cholesterol / dailyTargets.cholesterol * 100), unit: "%" },
        NA: { label: "Sodium", quantity: Math.round(totals.sodium / dailyTargets.sodium * 100), unit: "%" }
    };
}

// بيانات احتياطية تقريبية في حال فشل الـ API
function getFallbackNutritionData(recipeName, ingredientsList) {
    console.warn("⚠️ Using fallback nutrition data");
    const estimatedCalories = ingredientsList.length * 100;

    return {
        uri: `fallback://nutrition/${Date.now()}`,
        yield: 4,
        calories: estimatedCalories,
        totalWeight: ingredientsList.length * 100,
        dietLabels: [],
        healthLabels: [],
        cautions: [],
        totalNutrients: {
            ENERC_KCAL: { label: "Energy", quantity: estimatedCalories, unit: "kcal" },
            FAT: { label: "Fat", quantity: 0, unit: "g" },
            FASAT: { label: "Saturated Fat", quantity: 0, unit: "g" },
            CHOCDF: { label: "Carbohydrates", quantity: 0, unit: "g" },
            FIBTG: { label: "Fiber", quantity: 0, unit: "g" },
            SUGAR: { label: "Sugars", quantity: 0, unit: "g" },
            PROCNT: { label: "Protein", quantity: 0, unit: "g" },
            CHOLE: { label: "Cholesterol", quantity: 0, unit: "mg" },
            NA: { label: "Sodium", quantity: 0, unit: "mg" }
        },
        totalDaily: {},
        ingredients: ingredientsList.map(name => ({
            text: name,
            food: "Unknown",
            grams: 100,
            calories: 100,
            protein: 0,
            fat: 0,
            carbs: 0,
            notFound: true
        }))
    };
}

// يحول بيانات التغذية الخام إلى شكل جاهز للعرض (لكل حصة/وجبة)
function formatNutritionForDisplay(nutritionData) {
    if (!nutritionData) return null;

    const servings = nutritionData.yield || 4;
    const perServing = nutritionData.perServing;
    const totals = nutritionData.totals;

    // الشكل الجديد (من نفس الـ API)
    if (perServing && totals) {
        return {
            servings,
            caloriesPerServing: perServing.calories,
            totalCalories: totals.calories,
            macros: {
                protein: { amount: perServing.protein, dailyValue: Math.round(perServing.protein / 50 * 100) },
                carbs: { amount: perServing.carbs, dailyValue: Math.round(perServing.carbs / 300 * 100) },
                fat: { amount: perServing.fat, dailyValue: Math.round(perServing.fat / 65 * 100) },
                fiber: { amount: perServing.fiber, dailyValue: Math.round(perServing.fiber / 25 * 100) },
                sugar: { amount: perServing.sugar, dailyValue: 0 },
                saturatedFat: { amount: perServing.saturatedFat, dailyValue: Math.round(perServing.saturatedFat / 20 * 100) }
            },
            other: {
                cholesterol: perServing.cholesterol,
                sodium: perServing.sodium
            },
            dietLabels: nutritionData.dietLabels || [],
            healthLabels: nutritionData.healthLabels || []
        };
    }

    // الشكل الاحتياطي (Edamam-like)
    const nutrients = nutritionData.totalNutrients || {};
    const dailyValues = nutritionData.totalDaily || {};

    return {
        servings,
        caloriesPerServing: Math.round((nutritionData.calories || 0) / servings),
        totalCalories: Math.round(nutritionData.calories || 0),
        macros: {
            protein: {
                amount: Math.round((nutrients.PROCNT?.quantity || 0) / servings),
                dailyValue: Math.round((dailyValues.PROCNT?.quantity || 0) / servings)
            },
            carbs: {
                amount: Math.round((nutrients.CHOCDF?.quantity || 0) / servings),
                dailyValue: Math.round((dailyValues.CHOCDF?.quantity || 0) / servings)
            },
            fat: {
                amount: Math.round((nutrients.FAT?.quantity || 0) / servings),
                dailyValue: Math.round((dailyValues.FAT?.quantity || 0) / servings)
            },
            fiber: {
                amount: Math.round((nutrients.FIBTG?.quantity || 0) / servings),
                dailyValue: Math.round((dailyValues.FIBTG?.quantity || 0) / servings)
            },
            sugar: {
                amount: Math.round((nutrients.SUGAR?.quantity || 0) / servings),
                dailyValue: 0
            },
            saturatedFat: {
                amount: Math.round((nutrients.FASAT?.quantity || 0) / servings),
                dailyValue: Math.round((dailyValues.FASAT?.quantity || 0) / servings)
            }
        },
        other: {
            cholesterol: Math.round((nutrients.CHOLE?.quantity || 0) / servings),
            sodium: Math.round((nutrients.NA?.quantity || 0) / servings)
        },
        dietLabels: nutritionData.dietLabels || [],
        healthLabels: nutritionData.healthLabels || []
    };
}

// يجمع إجمالي القيم الغذائية ليوم كامل من قائمة عناصر
function calculateDayTotal(items = []) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    for (const item of items) {
        if (item.nutrition) {
            totals.calories += item.nutrition.calories || 0;
            totals.protein += item.nutrition.protein || 0;
            totals.carbs += item.nutrition.carbs || 0;
            totals.fat += item.nutrition.fat || 0;
            totals.fiber += item.nutrition.fiber || 0;
        }
    }
    return totals;
}

async function getNutritionForItem(itemName) {
    const analysis = await analyzeRecipe("Single Item", [itemName]);
    if (analysis.ingredients && analysis.ingredients.length > 0) {
        const ingredient = analysis.ingredients[0];
        return {
            uri: `nutriplan://item/${Date.now()}`,
            description: ingredient.food,
            calories: ingredient.calories,
            totalWeight: ingredient.grams,
            dietLabels: [],
            healthLabels: [],
            totalNutrients: {
                ENERC_KCAL: { label: "Energy", quantity: ingredient.calories, unit: "kcal" },
                FAT: { label: "Fat", quantity: ingredient.fat, unit: "g" },
                CHOCDF: { label: "Carbohydrates", quantity: ingredient.carbs, unit: "g" },
                PROCNT: { label: "Protein", quantity: ingredient.protein, unit: "g" }
            },
            totalDaily: {},
            ingredients: [{
                text: itemName,
                parsed: [{ quantity: 1, food: ingredient.food, weight: ingredient.grams }]
            }]
        };
    }
    return null;
}

async function searchFoods(query, page = 5) {
    try {
        const res = await fetch(`${NUTRITION_API}/nutrition/search?q=${encodeURIComponent(query)}&page=1`, {
            headers: { "x-api-key": NUTRITION_API_KEY }
        });
        if (!res.ok) throw new Error(`Search API error: ${res.status}`);
        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.error("Error searching foods:", err);
        return [];
    }
}

const NutritionAPI = {
    analyzeRecipe,
    formatNutritionForDisplay,
    calculateDayTotal,
    getNutritionForItem,
    searchFoods,
    clearNutritionCache
};

/* ============ 3) Open Food Facts API (المنتجات المعبأة) ============ */

const OFF_API = "https://world.openfoodfacts.org";

async function searchProducts(options = {}) {
    try {
        const params = new URLSearchParams({
            page: options.page || 1,
            page_size: options.pageSize || 24,
            json: 1,
            ...(options.searchTerms && { search_terms: options.searchTerms }),
            ...(options.categories && { categories_tags_en: options.categories }),
            ...(options.nutritionGrade && { nutrition_grades_tags: options.nutritionGrade })
        });

        const res = await fetch(`${OFF_API}/cgi/search.pl?${params}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        return {
            count: data.count || 0,
            page: data.page || 1,
            pageSize: data.page_size || 24,
            products: (data.products || []).map(normalizeProduct)
        };
    } catch (err) {
        console.error("Error searching products:", err);
        return getMockProducts(options);
    }
}

async function getProductByBarcode(barcode) {
    try {
        const res = await fetch(`${OFF_API}/api/v0/product/${barcode}.json`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.status === 0 ? null : normalizeProduct(data.product);
    } catch (err) {
        console.error("Error fetching product by barcode:", err);
        return null;
    }
}

async function getProductsByCategory(category, page = 1, pageSize = 24) {
    try {
        const res = await fetch(`${OFF_API}/category/${encodeURIComponent(category)}.json?page=${page}&page_size=${pageSize}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return {
            count: data.count || 0,
            page: data.page || 1,
            products: (data.products || []).map(normalizeProduct)
        };
    } catch (err) {
        console.error("Error fetching products by category:", err);
        return { count: 0, page: 1, products: [] };
    }
}

async function getPopularCategories() {
    return [
        { id: "breakfast_cereals", name: "Breakfast Cereals", icon: "fa-wheat-awn" },
        { id: "beverages", name: "Beverages", icon: "fa-bottle-water" },
        { id: "snacks", name: "Snacks", icon: "fa-cookie" },
        { id: "dairy", name: "Dairy Products", icon: "fa-cheese" },
        { id: "fruits", name: "Fruits", icon: "fa-apple-whole" },
        { id: "vegetables", name: "Vegetables", icon: "fa-carrot" },
        { id: "breads", name: "Breads", icon: "fa-bread-slice" },
        { id: "meats", name: "Meats", icon: "fa-drumstick-bite" },
        { id: "frozen_foods", name: "Frozen Foods", icon: "fa-snowflake" },
        { id: "sauces", name: "Sauces & Condiments", icon: "fa-jar" }
    ];
}

// يوحد شكل بيانات المنتج القادمة من Open Food Facts
function normalizeProduct(product) {
    const nutriments = product.nutriments || {};
    return {
        barcode: product.code || product._id,
        name: product.product_name || product.product_name_en || "Unknown Product",
        brand: product.brands || "",
        categories: product.categories || "",
        image: product.image_front_url || product.image_url || null,
        thumbnailImage: product.image_front_small_url || product.image_small_url || null,
        nutritionGrade: product.nutrition_grades || product.nutrition_grade_fr || null,
        novaGroup: product.nova_group || null,
        ecoscore: product.ecoscore_grade || null,
        ingredients: product.ingredients_text || product.ingredients_text_en || "",
        allergens: product.allergens || "",
        quantity: product.quantity || "",
        servingSize: product.serving_size || "",
        nutrition: {
            calories: nutriments["energy-kcal_100g"] || nutriments.energy_100g || 0,
            fat: nutriments.fat_100g || 0,
            saturatedFat: nutriments["saturated-fat_100g"] || 0,
            carbs: nutriments.carbohydrates_100g || 0,
            sugar: nutriments.sugars_100g || 0,
            fiber: nutriments.fiber_100g || 0,
            protein: nutriments.proteins_100g || 0,
            salt: nutriments.salt_100g || 0,
            sodium: nutriments.sodium_100g || 0
        },
        labels: product.labels || "",
        origins: product.origins || "",
        stores: product.stores || ""
    };
}

function getNutriScoreInfo(grade) {
    const grades = {
        a: { label: "Excellent", color: "#038141", description: "Very good nutritional quality" },
        b: { label: "Good", color: "#85bb2f", description: "Good nutritional quality" },
        c: { label: "Average", color: "#fecb02", description: "Average nutritional quality" },
        d: { label: "Poor", color: "#ee8100", description: "Poor nutritional quality" },
        e: { label: "Bad", color: "#e63e11", description: "Bad nutritional quality" }
    };
    return grades[grade?.toLowerCase()] || { label: "Unknown", color: "#999", description: "No score available" };
}

function getNovaGroupInfo(group) {
    const groups = {
        1: { label: "Unprocessed", color: "#038141", description: "Unprocessed or minimally processed foods" },
        2: { label: "Processed Ingredients", color: "#85bb2f", description: "Processed culinary ingredients" },
        3: { label: "Processed", color: "#ee8100", description: "Processed foods" },
        4: { label: "Ultra-processed", color: "#e63e11", description: "Ultra-processed food and drink products" }
    };
    return groups[group] || { label: "Unknown", color: "#999", description: "No classification available" };
}

function calculateNutritionPerServing(product, servingGrams = 100) {
    const ratio = servingGrams / 100;
    const n = product.nutrition;
    return {
        calories: Math.round(n.calories * ratio),
        fat: Math.round(n.fat * ratio * 10) / 10,
        saturatedFat: Math.round(n.saturatedFat * ratio * 10) / 10,
        carbs: Math.round(n.carbs * ratio * 10) / 10,
        sugar: Math.round(n.sugar * ratio * 10) / 10,
        fiber: Math.round(n.fiber * ratio * 10) / 10,
        protein: Math.round(n.protein * ratio * 10) / 10,
        salt: Math.round(n.salt * ratio * 100) / 100,
        sodium: Math.round(n.sodium * ratio)
    };
}

// بيانات وهمية احتياطية في حال فشل الاتصال بـ Open Food Facts
function getMockProducts(options = {}) {
    let mockData = [
        {
            code: "7613034626844", product_name: "Cheerios Original", brands: "Nestlé",
            categories: "Breakfast cereals",
            image_front_url: "https://images.openfoodfacts.org/images/products/761/303/462/6844/front_en.jpg",
            nutrition_grades: "a", nova_group: 4,
            nutriments: { "energy-kcal_100g": 372, fat_100g: 4.2, "saturated-fat_100g": 0.8, carbohydrates_100g: 74, sugars_100g: 4.8, fiber_100g: 8.6, proteins_100g: 8.4, salt_100g: 1.1 }
        },
        {
            code: "5000159484695", product_name: "Nutella", brands: "Ferrero",
            categories: "Spreads, Chocolate spreads",
            image_front_url: "https://images.openfoodfacts.org/images/products/500/015/948/4695/front_en.jpg",
            nutrition_grades: "e", nova_group: 4,
            nutriments: { "energy-kcal_100g": 539, fat_100g: 30.9, "saturated-fat_100g": 10.6, carbohydrates_100g: 57.5, sugars_100g: 56.3, fiber_100g: 0, proteins_100g: 6.3, salt_100g: 0.107 }
        },
        {
            code: "3017620422003", product_name: "Nutella", brands: "Ferrero", categories: "Chocolate spreads",
            nutrition_grades: "e", nova_group: 4,
            nutriments: { "energy-kcal_100g": 539, fat_100g: 31, carbohydrates_100g: 57, sugars_100g: 56, proteins_100g: 6 }
        },
        {
            code: "8410076472458", product_name: "Greek Yogurt", brands: "Danone", categories: "Dairy, Yogurts",
            nutrition_grades: "a", nova_group: 1,
            nutriments: { "energy-kcal_100g": 97, fat_100g: 5, "saturated-fat_100g": 3.3, carbohydrates_100g: 3.6, sugars_100g: 3.6, proteins_100g: 9, salt_100g: 0.1 }
        },
        {
            code: "5449000000996", product_name: "Coca-Cola Original", brands: "Coca-Cola", categories: "Beverages, Sodas",
            nutrition_grades: "e", nova_group: 4,
            nutriments: { "energy-kcal_100g": 42, fat_100g: 0, carbohydrates_100g: 10.6, sugars_100g: 10.6, proteins_100g: 0, salt_100g: 0 }
        }
    ];

    if (options.searchTerms) {
        const term = options.searchTerms.toLowerCase();
        mockData = mockData.filter(p =>
            p.product_name.toLowerCase().includes(term) || p.brands.toLowerCase().includes(term)
        );
    }

    if (options.nutritionGrade) {
        mockData = mockData.filter(p => p.nutrition_grades === options.nutritionGrade.toLowerCase());
    }

    return {
        count: mockData.length,
        page: options.page || 1,
        pageSize: options.pageSize || 24,
        products: mockData.map(normalizeProduct)
    };
}

const OpenFoodFacts = {
    searchProducts,
    getProductByBarcode,
    getProductsByCategory,
    getPopularCategories,
    getNutriScoreInfo,
    getNovaGroupInfo,
    calculateNutritionPerServing
};

/* ============ 4) إدارة الحالة (State) + التخزين المحلي ============ */

const STORAGE_KEYS = {
    SAVED_RECIPES: "nutriplan_saved_recipes",
    DAILY_LOG: "nutriplan_daily_log",
    USER_SETTINGS: "nutriplan_user_settings",
    SHOPPING_LIST: "nutriplan_shopping_list"
};

const DEFAULT_SETTINGS = {
    calorieGoal: 2000,
    proteinGoal: 50,
    carbsGoal: 250,
    fatGoal: 65,
    fiberGoal: 25,
    waterGoal: 2000,
    waterGlassSize: 250,
    weight: 70,
    height: 170,
    age: 30,
    gender: "male",
    activityLevel: "moderate",
    dietaryRestrictions: [],
    allergies: [],
    notifications: true,
    darkMode: false,
    weekStart: "monday",
    measurementUnit: "metric"
};

// الحالة العامة للتطبيق (بديل لأي مكتبة إدارة حالة)
const state = {
    currentPage: "meals",
    searchQuery: "",
    selectedCategory: null,
    selectedArea: null,
    selectedMeal: null,
    categories: [],
    areas: [],
    meals: [],
    featuredMeals: [],
    isLoading: false,
    error: null
};

function initializeState() {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    state.userSettings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_SETTINGS };

    const savedRecipes = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES);
    state.savedRecipes = savedRecipes ? JSON.parse(savedRecipes) : [];

    const dailyLog = localStorage.getItem(STORAGE_KEYS.DAILY_LOG);
    state.dailyLog = dailyLog ? JSON.parse(dailyLog) : {};

    const shoppingList = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    state.shoppingList = shoppingList ? JSON.parse(shoppingList) : [];

    state.streaks = calculateStreaks(state.dailyLog);
    return state;
}

// يحسب أطول سلسلة أيام متتالية تم تسجيل تغذية فيها
function calculateStreaks(dailyLog) {
    const today = new Date();
    let currentStreak = 0;
    let bestStreak = 0;

    for (let i = 0; i < 365; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const dayKey = day.toISOString().split("T")[0];
        const dayLog = dailyLog[dayKey];

        if (dayLog && dayLog.totalCalories > 0) {
            if (i === currentStreak) currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else if (i > 0) {
            break;
        }
    }

    return { nutrition: currentStreak, maxNutrition: bestStreak };
}

function getState() {
    return state;
}

// يحدّث الحالة، ويحفظ في localStorage عند الطلب، ويطلق حدث تغيير
function updateState(changes, persist = false) {
    Object.assign(state, changes);

    if (persist) {
        if (changes.savedRecipes !== undefined) {
            localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(state.savedRecipes));
        }
        if (changes.dailyLog !== undefined) {
            localStorage.setItem(STORAGE_KEYS.DAILY_LOG, JSON.stringify(state.dailyLog));
        }
        if (changes.userSettings !== undefined) {
            localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(state.userSettings));
        }
        if (changes.shoppingList !== undefined) {
            localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(state.shoppingList));
        }
    }

    window.dispatchEvent(new CustomEvent("stateChange", { detail: changes }));
}

function saveRecipe(meal) {
    const alreadySaved = state.savedRecipes.some(r => r.idMeal === meal.idMeal);
    if (!alreadySaved) {
        state.savedRecipes.push({ ...meal, savedAt: new Date().toISOString() });
        updateState({ savedRecipes: state.savedRecipes }, true);
    }
}

function unsaveRecipe(mealId) {
    state.savedRecipes = state.savedRecipes.filter(r => r.idMeal !== mealId);
    updateState({ savedRecipes: state.savedRecipes }, true);
}

function isRecipeSaved(mealId) {
    return state.savedRecipes.some(r => r.idMeal === mealId);
}

function logDailyNutrition(dateKey, entry) {
    if (!state.dailyLog[dateKey]) {
        state.dailyLog[dateKey] = { meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, water: 0 };
    }
    state.dailyLog[dateKey].meals.push(entry);
    state.dailyLog[dateKey].totalCalories += entry.calories || 0;
    state.dailyLog[dateKey].totalProtein += entry.protein || 0;
    state.dailyLog[dateKey].totalCarbs += entry.carbs || 0;
    state.dailyLog[dateKey].totalFat += entry.fat || 0;
    updateState({ dailyLog: state.dailyLog }, true);
}

function logWaterIntake(dateKey, amountMl) {
    if (!state.dailyLog[dateKey]) {
        state.dailyLog[dateKey] = { meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, water: 0, waterLog: [] };
    }
    state.dailyLog[dateKey].water += amountMl;
    state.dailyLog[dateKey].waterLog = state.dailyLog[dateKey].waterLog || [];
    state.dailyLog[dateKey].waterLog.push({ amount: amountMl, time: new Date().toISOString() });
    updateState({ dailyLog: state.dailyLog }, true);
}

function getTodayWaterIntake() {
    const todayKey = getTodayString();
    const todayLog = state.dailyLog[todayKey] || { water: 0, waterLog: [] };
    const goal = state.userSettings.waterGoal;
    const glassSize = state.userSettings.waterGlassSize;

    return {
        current: todayLog.water || 0,
        goal,
        glassSize,
        glasses: Math.floor((todayLog.water || 0) / glassSize),
        targetGlasses: Math.ceil(goal / glassSize),
        percentage: Math.min(100, Math.round((todayLog.water || 0) / goal * 100)),
        log: todayLog.waterLog || []
    };
}

function logWaterGlass() {
    const todayKey = getTodayString();
    const glassSize = state.userSettings.waterGlassSize;
    logWaterIntake(todayKey, glassSize);
    return getTodayWaterIntake();
}

function getDailyProgress(dateKey) {
    const dayLog = state.dailyLog[dateKey] || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, water: 0 };
    const settings = state.userSettings;

    return {
        calories: Math.min(100, Math.round(dayLog.totalCalories / settings.calorieGoal * 100)),
        protein: Math.min(100, Math.round(dayLog.totalProtein / settings.proteinGoal * 100)),
        carbs: Math.min(100, Math.round(dayLog.totalCarbs / settings.carbsGoal * 100)),
        fat: Math.min(100, Math.round(dayLog.totalFat / settings.fatGoal * 100)),
        water: Math.min(100, Math.round(dayLog.water / settings.waterGoal * 100)),
        overall: 0
    };
}

function addToShoppingList(items) {
    items.forEach(item => {
        const exists = state.shoppingList.some(
            existing => existing.ingredient.toLowerCase() === item.ingredient.toLowerCase()
        );
        if (!exists) {
            state.shoppingList.push({
                ...item,
                id: Date.now() + Math.random(),
                checked: false,
                addedAt: new Date().toISOString()
            });
        }
    });
    updateState({ shoppingList: state.shoppingList }, true);
}

function toggleShoppingItem(itemId) {
    const item = state.shoppingList.find(i => i.id === itemId);
    if (item) {
        item.checked = !item.checked;
        updateState({ shoppingList: state.shoppingList }, true);
    }
}

function removeFromShoppingList(itemId) {
    state.shoppingList = state.shoppingList.filter(i => i.id !== itemId);
    updateState({ shoppingList: state.shoppingList }, true);
}

function clearCompletedShoppingItems() {
    state.shoppingList = state.shoppingList.filter(i => !i.checked);
    updateState({ shoppingList: state.shoppingList }, true);
}

function updateUserSettings(newSettings) {
    state.userSettings = { ...state.userSettings, ...newSettings };
    updateState({ userSettings: state.userSettings }, true);
}

function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function getWeeklySummary() {
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        last7Days.push(day.toISOString().split("T")[0]);
    }
    return last7Days.map(dateKey => ({
        date: dateKey,
        dayName: new Date(dateKey).toLocaleDateString("en-US", { weekday: "short" }),
        nutrition: state.dailyLog[dateKey] || { totalCalories: 0 }
    }));
}

function getBMI() {
    const { weight, height } = state.userSettings;
    if (!weight || !height) return null;

    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);

    let category = "Normal";
    if (bmiValue < 18.5) category = "Underweight";
    else if (bmiValue >= 25 && bmiValue < 30) category = "Overweight";
    else if (bmiValue >= 30) category = "Obese";

    return { value: bmiValue.toFixed(1), category };
}

function getTotalStats() {
    const savedRecipesCount = state.savedRecipes?.length || 0;
    const plannedMealsCount = Object.values(state.mealPlan || {}).reduce(
        (sum, day) => sum + Object.keys(day).length, 0
    );
    const shoppingItemsCount = state.shoppingList?.length || 0;
    const workoutsLoggedCount = Object.keys(state.workoutLog || {}).length;

    return {
        savedRecipes: savedRecipesCount,
        plannedMeals: plannedMealsCount,
        shoppingItems: shoppingItemsCount,
        workoutsLogged: workoutsLoggedCount
    };
}

const AppState = {
    initializeState,
    getState,
    updateState,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
    logDailyNutrition,
    logWaterIntake,
    getTodayWaterIntake,
    logWaterGlass,
    getDailyProgress,
    addToShoppingList,
    toggleShoppingItem,
    removeFromShoppingList,
    clearCompletedShoppingItems,
    updateUserSettings,
    getTodayString,
    getWeeklySummary,
    getBMI,
    getTotalStats
};

/* ============ 5) قوالب واجهة المستخدم (HTML Templates) ============ */

function createMealCard(meal) {
    return `
        <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.idMeal}">
            <div class="relative h-48 overflow-hidden">
                <img
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="${meal.strMealThumb}"
                    alt="${meal.strMeal}"
                    loading="lazy"
                />
                <div class="absolute bottom-3 left-3 flex gap-2">
                    ${meal.strCategory ? `
                        <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
                            <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>${meal.strCategory}
                        </span>
                    ` : ""}
                    ${meal.strArea ? `
                        <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
                            <i class="fa-solid fa-globe text-blue-600 mr-1"></i>${meal.strArea}
                        </span>
                    ` : ""}
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    ${meal.strMeal}
                </h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                    ${meal.strInstructions ? meal.strInstructions.substring(0, 100) + "..." : "Delicious recipe to try!"}
                </p>
                <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-gray-900">
                        <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                        ${meal.strCategory || "Various"}
                    </span>
                    <span class="font-semibold text-gray-500">
                        <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                        ${meal.strArea || "International"}
                    </span>
                </div>
            </div>
        </div>
    `;
}

const CATEGORY_STYLES = {
    Beef: { bg: "from-red-50 to-rose-50", border: "border-red-200 hover:border-red-400", iconFrom: "from-red-400", iconTo: "to-rose-500", text: "text-red-600" },
    Chicken: { bg: "from-amber-50 to-orange-50", border: "border-amber-200 hover:border-amber-400", iconFrom: "from-amber-400", iconTo: "to-orange-500", text: "text-amber-600" },
    Dessert: { bg: "from-pink-50 to-rose-50", border: "border-pink-200 hover:border-pink-400", iconFrom: "from-pink-400", iconTo: "to-rose-500", text: "text-pink-600" },
    Lamb: { bg: "from-orange-50 to-amber-50", border: "border-orange-200 hover:border-orange-400", iconFrom: "from-orange-400", iconTo: "to-amber-500", text: "text-orange-600" },
    Miscellaneous: { bg: "from-slate-50 to-gray-50", border: "border-slate-200 hover:border-slate-400", iconFrom: "from-slate-400", iconTo: "to-gray-500", text: "text-slate-600" },
    Pasta: { bg: "from-yellow-50 to-amber-50", border: "border-yellow-200 hover:border-yellow-400", iconFrom: "from-yellow-400", iconTo: "to-amber-500", text: "text-yellow-600" },
    Pork: { bg: "from-rose-50 to-red-50", border: "border-rose-200 hover:border-rose-400", iconFrom: "from-rose-400", iconTo: "to-red-500", text: "text-rose-600" },
    Seafood: { bg: "from-cyan-50 to-blue-50", border: "border-cyan-200 hover:border-cyan-400", iconFrom: "from-cyan-400", iconTo: "to-blue-500", text: "text-cyan-600" },
    Side: { bg: "from-green-50 to-emerald-50", border: "border-green-200 hover:border-green-400", iconFrom: "from-green-400", iconTo: "to-emerald-500", text: "text-green-600" },
    Starter: { bg: "from-teal-50 to-cyan-50", border: "border-teal-200 hover:border-teal-400", iconFrom: "from-teal-400", iconTo: "to-cyan-500", text: "text-teal-600" },
    Vegan: { bg: "from-emerald-50 to-green-50", border: "border-emerald-200 hover:border-emerald-400", iconFrom: "from-emerald-400", iconTo: "to-green-500", text: "text-emerald-600" },
    Vegetarian: { bg: "from-lime-50 to-green-50", border: "border-lime-200 hover:border-lime-400", iconFrom: "from-lime-400", iconTo: "to-green-500", text: "text-lime-600" },
    Breakfast: { bg: "from-amber-50 to-orange-50", border: "border-amber-200 hover:border-amber-400", iconFrom: "from-amber-400", iconTo: "to-orange-500", text: "text-amber-600" },
    Goat: { bg: "from-stone-50 to-amber-50", border: "border-stone-200 hover:border-stone-400", iconFrom: "from-stone-400", iconTo: "to-amber-500", text: "text-stone-600" }
};

const CATEGORY_ICONS = {
    Beef: "fa-drumstick-bite", Chicken: "fa-drumstick-bite", Dessert: "fa-cake-candles",
    Lamb: "fa-drumstick-bite", Pasta: "fa-bowl-food", Pork: "fa-bacon", Seafood: "fa-fish",
    Side: "fa-plate-wheat", Starter: "fa-utensils", Vegan: "fa-leaf", Vegetarian: "fa-seedling",
    Breakfast: "fa-mug-hot", Miscellaneous: "fa-bowl-rice", Goat: "fa-drumstick-bite"
};

function createCategoryCard(category) {
    const style = CATEGORY_STYLES[category.strCategory] || CATEGORY_STYLES.Miscellaneous;
    const icon = CATEGORY_ICONS[category.strCategory] || "fa-utensils";

    return `
        <div class="category-card bg-gradient-to-br ${style.bg} rounded-xl p-3 border ${style.border} hover:shadow-md cursor-pointer transition-all group" data-category="${category.strCategory}">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 bg-gradient-to-br ${style.iconFrom} ${style.iconTo} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <i class="fa-solid ${icon} text-white text-sm"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-gray-900">${category.strCategory}</h3>
                </div>
            </div>
        </div>
    `;
}

function createLoadingSpinner() {
    return `
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    `;
}

function createEmptyState(message, icon = "fa-search") {
    return `
        <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i class="fa-solid ${icon} text-gray-400 text-2xl"></i>
            </div>
            <p class="text-gray-500 text-lg">${message}</p>
        </div>
    `;
}

function createAreaFilters(areas, selectedArea = null) {
    return `
        <button class="area-filter-btn px-4 py-2 ${selectedArea ? "bg-gray-100 text-gray-700" : "bg-emerald-600 text-white"} rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 hover:text-white transition-all" data-area="">
            All Cuisines
        </button>
        ${areas.map(area => `
            <button class="area-filter-btn px-4 py-2 ${selectedArea === area.strArea ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"} rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="${area.strArea}">
                ${area.strArea}
            </button>
        `).join("")}
    `;
}

function createWaterTracker(waterInfo) {
    const { current, goal, glasses, targetGlasses, percentage } = waterInfo;
    const glassesHTML = Array(targetGlasses).fill(0).map((_, i) => `
        <div class="water-glass w-8 h-10 rounded-lg border-2 ${i < glasses ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-gray-50"}
            cursor-pointer hover:scale-110 transition-all flex items-end justify-center overflow-hidden"
            data-glass="${i + 1}">
            ${i < glasses ? '<i class="fa-solid fa-droplet text-white text-xs mb-1"></i>' : ""}
        </div>
    `).join("");

    return `
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <i class="fa-solid fa-droplet text-white"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900">Water Intake</h3>
                        <p class="text-xs text-gray-500">${current}ml / ${goal}ml</p>
                    </div>
                </div>
                <span class="text-2xl font-bold text-blue-600">${percentage}%</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div class="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
            </div>

            <div class="flex items-center gap-2 flex-wrap mb-4">
                ${glassesHTML}
            </div>

            <button id="add-water-btn" class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-plus"></i>
                Add Glass (${waterInfo.glassSize}ml)
            </button>
        </div>
    `;
}

function createSkeletonCard(type = "recipe") {
    if (type === "recipe") {
        return `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div class="h-48 bg-gray-200"></div>
                <div class="p-4">
                    <div class="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                    <div class="flex justify-between">
                        <div class="h-3 bg-gray-200 rounded w-16"></div>
                        <div class="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                </div>
            </div>
        `;
    }
    if (type === "product") {
        return `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div class="h-40 bg-gray-200"></div>
                <div class="p-4">
                    <div class="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div class="h-3 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        `;
    }
    return "";
}

function createProductCard(product) {
    const gradeColors = { a: "bg-green-500", b: "bg-lime-500", c: "bg-yellow-500", d: "bg-orange-500", e: "bg-red-500" };
    const novaColors = { 1: "bg-green-500", 2: "bg-lime-500", 3: "bg-orange-500", 4: "bg-red-500" };
    const gradeColor = gradeColors[product.nutritionGrade?.toLowerCase()] || "bg-gray-400";
    const novaColor = novaColors[product.novaGroup] || "bg-gray-400";

    return `
        <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${product.barcode}">
            <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                ${product.image ? `
                    <img
                        class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                        onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center\\'><i class=\\'fa-solid fa-box text-gray-400 text-2xl\\'></i></div>'"
                    />
                ` : `
                    <div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                        <i class="fa-solid fa-box text-gray-400 text-2xl"></i>
                    </div>
                `}
                ${product.nutritionGrade ? `
                    <div class="absolute top-2 left-2 ${gradeColor} text-white text-xs font-bold px-2 py-1 rounded uppercase">
                        Nutri-Score ${product.nutritionGrade.toUpperCase()}
                    </div>
                ` : ""}
                ${product.novaGroup ? `
                    <div class="absolute top-2 right-2 ${novaColor} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${product.novaGroup}">
                        ${product.novaGroup}
                    </div>
                ` : ""}
            </div>

            <div class="p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand || "Unknown Brand"}</p>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    ${product.name}
                </h3>

                <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    ${product.quantity ? `<span><i class="fa-solid fa-weight-scale mr-1"></i>${product.quantity}</span>` : ""}
                    ${product.nutrition?.calories ? `<span><i class="fa-solid fa-fire mr-1"></i>${Math.round(product.nutrition.calories)} kcal/100g</span>` : ""}
                </div>

                <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                        <p class="text-xs font-bold text-emerald-700">${product.nutrition?.protein?.toFixed(1) || 0}g</p>
                        <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                        <p class="text-xs font-bold text-blue-700">${product.nutrition?.carbs?.toFixed(1) || 0}g</p>
                        <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                        <p class="text-xs font-bold text-purple-700">${product.nutrition?.fat?.toFixed(1) || 0}g</p>
                        <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                        <p class="text-xs font-bold text-orange-700">${product.nutrition?.sugar?.toFixed(1) || 0}g</p>
                        <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createProductDetailContent(product, gradeInfo, novaInfo) {
    return `
        <div class="p-6">
            <div class="flex items-start gap-6 mb-6">
                <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain"/>` : `<i class="fa-solid fa-box text-gray-400 text-4xl"></i>`}
                </div>
                <div class="flex-1">
                    <p class="text-sm text-emerald-600 font-semibold mb-1">${product.brand || "Unknown Brand"}</p>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name}</h2>
                    <p class="text-sm text-gray-500 mb-3">${product.quantity || ""}</p>

                    <div class="flex items-center gap-3">
                        ${product.nutritionGrade ? `
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${gradeInfo.color}20">
                                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${gradeInfo.color}">
                                    ${product.nutritionGrade.toUpperCase()}
                                </span>
                                <div>
                                    <p class="text-xs font-bold" style="color: ${gradeInfo.color}">Nutri-Score</p>
                                    <p class="text-[10px] text-gray-600">${gradeInfo.label}</p>
                                </div>
                            </div>
                        ` : ""}
                        ${product.novaGroup ? `
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${novaInfo.color}20">
                                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${novaInfo.color}">
                                    ${product.novaGroup}
                                </span>
                                <div>
                                    <p class="text-xs font-bold" style="color: ${novaInfo.color}">NOVA</p>
                                    <p class="text-[10px] text-gray-600">${novaInfo.label}</p>
                                </div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                <button class="close-product-modal text-gray-400 hover:text-gray-600">
                    <i class="fa-solid fa-times text-2xl"></i>
                </button>
            </div>

            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                    Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
                </h3>

                <div class="text-center mb-4 pb-4 border-b border-emerald-200">
                    <p class="text-4xl font-bold text-gray-900">${Math.round(product.nutrition?.calories || 0)}</p>
                    <p class="text-sm text-gray-500">Calories</p>
                </div>

                <div class="grid grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition?.protein || 0) / 50 * 100, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-emerald-600">${product.nutrition?.protein?.toFixed(1) || 0}g</p>
                        <p class="text-xs text-gray-500">Protein</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition?.carbs || 0) / 100 * 100, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-blue-600">${product.nutrition?.carbs?.toFixed(1) || 0}g</p>
                        <p class="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition?.fat || 0) / 65 * 100, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-purple-600">${product.nutrition?.fat?.toFixed(1) || 0}g</p>
                        <p class="text-xs text-gray-500">Fat</p>
                    </div>
                    <div class="text-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition?.sugar || 0) / 50 * 100, 100)}%"></div>
                        </div>
                        <p class="text-lg font-bold text-orange-600">${product.nutrition?.sugar?.toFixed(1) || 0}g</p>
                        <p class="text-xs text-gray-500">Sugar</p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${product.nutrition?.saturatedFat?.toFixed(1) || 0}g</p>
                        <p class="text-xs text-gray-500">Saturated Fat</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${product.nutrition?.fiber?.toFixed(1) || 0}g</p>
                        <p class="text-xs text-gray-500">Fiber</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-semibold text-gray-900">${product.nutrition?.salt?.toFixed(2) || 0}g</p>
                        <p class="text-xs text-gray-500">Salt</p>
                    </div>
                </div>
            </div>

            ${product.ingredients ? `
                <div class="bg-gray-50 rounded-xl p-5 mb-6">
                    <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-list text-gray-600"></i>
                        Ingredients
                    </h3>
                    <p class="text-sm text-gray-600 leading-relaxed">${product.ingredients}</p>
                </div>
            ` : ""}

            ${product.allergens ? `
                <div class="bg-red-50 rounded-xl p-5 mb-6 border border-red-200">
                    <h3 class="font-bold text-red-700 mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        Allergens
                    </h3>
                    <p class="text-sm text-red-600">${product.allergens}</p>
                </div>
            ` : ""}

            <div class="flex gap-3">
                <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all" data-barcode="${product.barcode}">
                    <i class="fa-solid fa-plus mr-2"></i>Log This Food
                </button>
                <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                    Close
                </button>
            </div>
        </div>
    `;
}

const PRODUCT_CATEGORY_COLORS = {
    breakfast_cereals: "from-amber-500 to-orange-500",
    beverages: "from-blue-500 to-cyan-500",
    snacks: "from-purple-500 to-pink-500",
    dairy: "from-sky-400 to-blue-500",
    fruits: "from-red-500 to-rose-500",
    vegetables: "from-green-500 to-emerald-500",
    breads: "from-amber-600 to-yellow-500",
    meats: "from-red-600 to-rose-600",
    frozen_foods: "from-cyan-500 to-blue-600",
    sauces: "from-orange-500 to-red-500"
};

function createProductCategoryButton(category) {
    const colorClasses = PRODUCT_CATEGORY_COLORS[category.id] || "from-gray-500 to-gray-600";
    return `
        <button class="product-category-btn flex-shrink-0 px-5 py-3 bg-gradient-to-r ${colorClasses} text-white rounded-xl font-semibold hover:shadow-lg transition-all" data-category="${category.id}">
            <i class="fa-solid ${category.icon} mr-2"></i>${category.name}
        </button>
    `;
}

const Templates = {
    createMealCard,
    createCategoryCard,
    createLoadingSpinner,
    createEmptyState,
    createAreaFilters,
    createWaterTracker,
    createSkeletonCard,
    createProductCard,
    createProductDetailContent,
    createProductCategoryButton
};

/* ============ 6) التطبيق الرئيسي (Router + UI logic) ============ */

class NutriPlanApp {
    constructor() {
        this.state = AppState.initializeState();
        this.currentPage = "meals";
        this.debounceTimer = null;
        this.routes = {
            "": "home",
            home: "meals",
            meals: "meals",
            settings: "settings",
            products: "products"
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupRouting();

        if (window.location.pathname === "/" || window.location.pathname === "") {
            window.history.replaceState({ page: "meals" }, "", "/home");
        }

        await this.loadInitialData();

        const currentRoute = this.getPageFromURL();
        if (currentRoute.type === "meal-detail" && currentRoute.slug) {
            await this.loadMealFromSlug(currentRoute.slug);
        } else {
            this.renderPage(currentRoute.type);
            this.updateActiveNavLink(currentRoute.type);
        }

        this.hideLoadingOverlay();
    }

    setupRouting() {
        window.addEventListener("popstate", () => {
            const route = this.getPageFromURL();
            if (route.type === "meal-detail") {
                this.loadMealFromSlug(route.slug);
            } else {
                this.renderPage(route.type);
                this.updateActiveNavLink(route.type);
            }
        });
    }

    getPageFromURL() {
        const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
        if (path.startsWith("meal/")) {
            return { type: "meal-detail", slug: path.replace("meal/", "") };
        }
        return { type: this.routes[path] || "meals", slug: null };
    }

    async loadMealFromSlug(slug) {
        try {
            const query = slug.replace(/-/g, " ");
            const results = await MealDB.searchMealsByName(query);
            if (results && results.length > 0) {
                const meal = results.find(m => this.slugify(m.strMeal) === slug) || results[0];
                AppState.updateState({ selectedMealId: meal.idMeal });
                this.renderPage("meal-detail");
                this.updateActiveNavLink("meals");
            } else {
                this.navigateTo("meals");
            }
        } catch (err) {
            console.error("Error loading meal from URL:", err);
            this.navigateTo("meals");
        }
    }

    slugify(text) {
        return text.toLowerCase().trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    navigateTo(page) {
        let path;
        if (page === "meals") {
            path = "/home";
        } else {
            path = `/${Object.keys(this.routes).find(key => this.routes[key] === page && key !== "" && key !== "home") || page}`;
        }
        if (window.location.pathname !== path) {
            window.history.pushState({ page }, "", path);
        }
        this.renderPage(page);
        this.updateActiveNavLink(page);
    }

    navigateToMeal(meal) {
        const path = `/meal/${this.slugify(meal.strMeal)}`;
        AppState.updateState({ selectedMealId: meal.idMeal });
        window.history.pushState({ page: "meal-detail", mealId: meal.idMeal }, "", path);
        this.renderPage("meal-detail");
        this.updateActiveNavLink("meals");
    }

    updateActiveNavLink(activePage) {
        document.querySelectorAll("#sidebar nav a").forEach(link => {
            const label = link.querySelector("span")?.textContent?.toLowerCase() || "";
            let page = "meals";
            if (label.includes("meals") || label.includes("recipes")) page = "meals";
            else if (label.includes("settings")) page = "settings";
            else if (label.includes("products") || label.includes("barcode") || label.includes("scan")) page = "products";
            else if (label.includes("food log") || label.includes("log")) page = "foodlog";

            if (page === activePage) {
                link.classList.add("bg-emerald-50", "text-emerald-700");
                link.classList.remove("text-gray-600", "hover:bg-gray-50");
                link.querySelector("span")?.classList.add("font-semibold");
                link.querySelector("span")?.classList.remove("font-medium");
            } else {
                link.classList.remove("bg-emerald-50", "text-emerald-700");
                link.classList.add("text-gray-600", "hover:bg-gray-50");
                link.querySelector("span")?.classList.remove("font-semibold");
                link.querySelector("span")?.classList.add("font-medium");
            }
        });
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById("app-loading-overlay");
        if (overlay) {
            overlay.style.opacity = "0";
            overlay.style.transition = "opacity 0.5s ease-out";
            setTimeout(() => overlay.remove(), 500);
        }
    }

    setupEventListeners() {
        document.querySelectorAll("#sidebar nav a").forEach(link => {
            link.addEventListener("click", e => this.handleNavigation(e));
        });

        const searchInput = document.querySelector('#search-filters-section input[type="text"]');
        if (searchInput) {
            searchInput.addEventListener("input", e => this.handleSearch(e));
            searchInput.addEventListener("keypress", e => {
                if (e.key === "Enter") this.performSearch(e.target.value);
            });
        }

        this.setupViewToggle();
        document.addEventListener("click", e => this.handleGlobalClick(e));
        window.addEventListener("stateChange", e => this.handleStateChange(e));
    }

    setupViewToggle() {
        const gridBtn = document.getElementById("grid-view-btn");
        const listBtn = document.getElementById("list-view-btn");
        if (gridBtn && listBtn) {
            gridBtn.addEventListener("click", () => this.setViewMode("grid"));
            listBtn.addEventListener("click", () => this.setViewMode("list"));
        }
    }

    setViewMode(mode) {
        const gridBtn = document.getElementById("grid-view-btn");
        const listBtn = document.getElementById("list-view-btn");
        const container = document.querySelector("#all-recipes-section .grid");
        if (!container) return;

        if (mode === "grid") {
            gridBtn?.classList.add("bg-white", "shadow-sm");
            gridBtn?.querySelector("i")?.classList.replace("text-gray-500", "text-gray-700");
            listBtn?.classList.remove("bg-white", "shadow-sm");
            listBtn?.querySelector("i")?.classList.replace("text-gray-700", "text-gray-500");

            container.className = "grid grid-cols-4 gap-5";
            container.querySelectorAll(".recipe-card").forEach(card => {
                card.classList.remove("flex", "flex-row", "h-40");
                card.querySelector(".relative")?.classList.remove("w-48", "h-full");
                card.querySelector(".relative")?.classList.add("h-48");
                card.querySelector("img")?.classList.remove("h-full");
                card.querySelector("img")?.classList.add("h-full");
                card.querySelector(".relative > .absolute.bottom-3")?.classList.remove("hidden");
            });
        } else {
            listBtn?.classList.add("bg-white", "shadow-sm");
            listBtn?.querySelector("i")?.classList.replace("text-gray-500", "text-gray-700");
            gridBtn?.classList.remove("bg-white", "shadow-sm");
            gridBtn?.querySelector("i")?.classList.replace("text-gray-700", "text-gray-500");

            container.className = "grid grid-cols-2 gap-4";
            container.querySelectorAll(".recipe-card").forEach(card => {
                card.classList.add("flex", "flex-row", "h-40");
                card.querySelector(".relative")?.classList.add("w-48", "h-full");
                card.querySelector(".relative")?.classList.remove("h-48");
                card.querySelector(".relative > .absolute.bottom-3")?.classList.add("hidden");
            });
        }

        AppState.updateState({ viewMode: mode });
    }

    handleNavigation(e) {
        e.preventDefault();
        const label = e.currentTarget.querySelector("span")?.textContent?.toLowerCase() || "";
        let page = "meals";
        if (label.includes("meals") || label.includes("recipes")) page = "meals";
        else if (label.includes("settings")) page = "settings";
        else if (label.includes("products") || label.includes("barcode") || label.includes("scan")) page = "products";
        else if (label.includes("food log") || label.includes("log")) page = "foodlog";
        this.navigateTo(page);
    }

    handleGlobalClick(e) {
        const recipeCard = e.target.closest(".recipe-card");
        if (recipeCard) this.showMealDetail(recipeCard.dataset.mealId);

        const categoryCard = e.target.closest(".category-card");
        if (categoryCard) this.filterByCategory(categoryCard.dataset.category);

        const areaBtn = e.target.closest(".area-filter-btn");
        if (areaBtn) this.filterByArea(areaBtn.dataset.area);

        if (e.target.closest(".close-detail-btn")) this.closeMealDetail();
    }

    handleSearch(e) {
        const query = e.target.value.trim();
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (query.length >= 2) this.performSearch(query);
            else if (query.length === 0) this.loadAllRecipes();
        }, 300);
    }

    async performSearch(query) {
        AppState.updateState({ isLoading: true, searchQuery: query });
        const grid = document.querySelector("#all-recipes-section .grid");
        if (grid) grid.innerHTML = Templates.createLoadingSpinner();

        try {
            const results = await MealDB.searchMealsByName(query);
            AppState.updateState({ meals: results, isLoading: false });
            this.renderRecipeGrid(results);

            const counter = document.querySelector("#all-recipes-section p.text-gray-600");
            if (counter) counter.textContent = `Showing ${results.length} recipes for "${query}"`;
        } catch (err) {
            console.error("Search error:", err);
            AppState.updateState({ isLoading: false, error: err.message });
        }
    }

    async loadInitialData() {
        try {
            const categories = await MealDB.getAllCategories();
            AppState.updateState({ categories });

            const areas = await MealDB.getAreaList();
            AppState.updateState({ areas });

            const meals = await MealDB.searchMealsByName("chicken");
            AppState.updateState({ meals });
        } catch (err) {
            console.error("Error loading initial data:", err);
        }
    }

    async loadAllRecipes() {
        const results = await MealDB.searchMealsByName("");
        if (results.length === 0) {
            const fallback = await MealDB.searchMealsByName("chicken");
            AppState.updateState({ meals: fallback });
            this.renderRecipeGrid(fallback);
        } else {
            AppState.updateState({ meals: results });
            this.renderRecipeGrid(results);
        }
    }

    renderPage(page) {
        this.currentPage = page;
        const mainContent = document.getElementById("main-content");
        this.updateHeader(page);

        ["shopping-section", "settings-section", "products-section", "meal-detail-section", "foodlog-section"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            });

        switch (page) {
            case "meals": this.showMealsPage(); break;
            case "settings": this.showSettingsPage(); break;
            case "products": this.showProductsPage(); break;
            case "foodlog": this.showFoodLogPage(); break;
            case "meal-detail": this.showMealDetailPage(); break;
        }
    }

    updateHeader(page) {
        const titleEl = document.querySelector("#header h1");
        const subtitleEl = document.querySelector("#header p");
        const headers = {
            meals: { title: "Meals & Recipes", subtitle: "Discover delicious and nutritious recipes tailored for you" },
            settings: { title: "Settings", subtitle: "Customize your goals and preferences" },
            products: { title: "Product Scanner", subtitle: "Search packaged foods by name or barcode" },
            foodlog: { title: "Food Log", subtitle: "Track your daily nutrition and food intake" },
            "meal-detail": { title: "Recipe Details", subtitle: "View full recipe information and nutrition facts" }
        };
        if (titleEl && headers[page]) titleEl.textContent = headers[page].title;
        if (subtitleEl && headers[page]) subtitleEl.textContent = headers[page].subtitle;
    }

    showMealsPage() {
        this.toggleSections(["search-filters-section", "meal-categories-section", "all-recipes-section"], true);
        this.toggleSections(["recipe-detail-modal", "nutritional-insights-section", "meal-planning-section", "community-section"], false);
        this.renderCategories();
        this.renderRecipeGrid(AppState.getState().meals);
        this.renderAreaFilters();
    }

    toggleSections(ids, show) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = show ? "" : "none";
        });
    }

    renderCategories() {
        const section = document.getElementById("meal-categories-section");
        if (!section) return;
        const grid = section.querySelector(".grid");
        if (!grid) return;

        grid.className = "grid grid-cols-6 gap-3";
        const categories = AppState.getState().categories || [];
        grid.innerHTML = categories.slice(0, 12).map(c => Templates.createCategoryCard(c)).join("");
    }

    renderRecipeGrid(meals) {
        const grid = document.querySelector("#all-recipes-section .grid");
        if (!grid) return;

        if (!meals || meals.length === 0) {
            grid.innerHTML = Templates.createEmptyState("No recipes found. Try a different search term.");
            return;
        }

        grid.innerHTML = meals.map(m => Templates.createMealCard(m)).join("");
        const counter = document.querySelector("#all-recipes-section p.text-gray-600");
        if (counter) counter.textContent = `Showing ${meals.length} recipes`;
    }

    renderAreaFilters() {
        const container = document.querySelector("#search-filters-section .flex.items-center.gap-3");
        if (!container) return;

        const areas = AppState.getState().areas || [];
        const selectedArea = AppState.getState().selectedArea;
        container.innerHTML = Templates.createAreaFilters(areas.slice(0, 10), selectedArea);
    }

    async filterByCategory(category) {
        AppState.updateState({ selectedCategory: category, isLoading: true });
        const grid = document.querySelector("#all-recipes-section .grid");
        if (grid) grid.innerHTML = Templates.createLoadingSpinner();

        try {
            const list = await MealDB.filterMealsByCategory(category);
            const fullMeals = await Promise.all(
                list.slice(0, 20).map(m => MealDB.getMealById(m.idMeal))
            );
            const validMeals = fullMeals.filter(m => m);
            AppState.updateState({ meals: validMeals, isLoading: false });
            this.renderRecipeGrid(validMeals);

            const counter = document.querySelector("#all-recipes-section p.text-gray-600");
            if (counter) counter.textContent = `Showing ${validMeals.length} ${category} recipes`;
        } catch (err) {
            console.error("Filter error:", err);
            AppState.updateState({ isLoading: false });
        }
    }

    async filterByArea(area) {
        AppState.updateState({ selectedArea: area, isLoading: true });

        document.querySelectorAll(".area-filter-btn").forEach(btn => {
            if (btn.dataset.area === area) {
                btn.classList.add("bg-emerald-600", "text-white");
                btn.classList.remove("bg-gray-100", "text-gray-700");
            } else {
                btn.classList.remove("bg-emerald-600", "text-white");
                btn.classList.add("bg-gray-100", "text-gray-700");
            }
        });

        const grid = document.querySelector("#all-recipes-section .grid");
        if (grid) grid.innerHTML = Templates.createLoadingSpinner();

        try {
            let meals;
            if (area) {
                const list = await MealDB.filterMealsByArea(area);
                const fullMeals = await Promise.all(list.slice(0, 20).map(m => MealDB.getMealById(m.idMeal)));
                meals = fullMeals.filter(m => m);
            } else {
                meals = await MealDB.searchMealsByName("chicken");
            }

            AppState.updateState({ meals, isLoading: false });
            this.renderRecipeGrid(meals);

            const counter = document.querySelector("#all-recipes-section p.text-gray-600");
            if (counter) counter.textContent = area ? `Showing ${meals.length} ${area} recipes` : `Showing ${meals.length} recipes`;
        } catch (err) {
            console.error("Filter error:", err);
            AppState.updateState({ isLoading: false });
        }
    }

    async showMealDetail(mealId) {
        AppState.updateState({ selectedMealId: mealId, isLoading: true });
        try {
            const meal = await MealDB.getMealById(mealId);
            if (meal) {
                const path = `/meal/${this.slugify(meal.strMeal)}`;
                if (window.location.pathname !== path) {
                    window.history.pushState({ page: "meal-detail", mealId }, "", path);
                }
            }
        } catch (err) {
            console.error("Error fetching meal for URL:", err);
        }
        this.renderPage("meal-detail");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async showMealDetailPage() {
        this.toggleSections([
            "search-filters-section", "featured-recipes-section", "meal-categories-section",
            "all-recipes-section", "recipe-detail-modal", "nutritional-insights-section",
            "meal-planning-section", "community-section"
        ], false);

        let section = document.getElementById("meal-detail-section");
        if (!section) {
            section = document.createElement("section");
            section.id = "meal-detail-section";
            section.className = "px-8 py-6 bg-gray-50 min-h-screen";
            const mainContent = document.getElementById("main-content");
            const footer = document.getElementById("footer");
            mainContent.insertBefore(section, footer);
        }
        section.style.display = "";

        const mealId = AppState.getState().selectedMealId;
        if (!mealId) {
            section.innerHTML = `
                <div class="max-w-6xl mx-auto">
                    <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Back to Recipes</span>
                    </button>
                    ${Templates.createEmptyState("No recipe selected. Please select a recipe to view details.", "fa-utensils")}
                </div>
            `;
            document.getElementById("back-to-meals-btn")?.addEventListener("click", () => this.navigateTo("meals"));
            return;
        }

        try {
            const meal = await MealDB.getMealById(mealId);
            if (!meal) throw new Error("Meal not found");

            const ingredients = MealDB.extractIngredients(meal);
            const instructions = MealDB.parseInstructions(meal.strInstructions);

            AppState.updateState({ selectedMeal: meal, isLoading: false });
            section.innerHTML = this.createMealDetailPageContent(meal, null, ingredients, instructions);
            this.setupMealDetailPageListeners(meal, ingredients);
            this.loadNutritionData(meal, ingredients);
        } catch (err) {
            console.error("Error loading meal detail:", err);
            AppState.updateState({ isLoading: false });
            section.innerHTML = `
                <div class="max-w-6xl mx-auto">
                    <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Back to Recipes</span>
                    </button>
                    ${Templates.createEmptyState("Failed to load recipe details. Please try again.", "fa-exclamation-circle")}
                </div>
            `;
            document.getElementById("back-to-meals-btn")?.addEventListener("click", () => this.navigateTo("meals"));
        }
    }

    async loadNutritionData(meal, ingredients) {
        const container = document.getElementById("nutrition-facts-container");
        if (!container) return;

        try {
            const ingredientStrings = ingredients.map(i => `${i.measure} ${i.ingredient}`);
            const rawNutrition = await NutritionAPI.analyzeRecipe(meal.strMeal, ingredientStrings);
            const formatted = NutritionAPI.formatNutritionForDisplay(rawNutrition);

            const cache = AppState.getState().mealNutritionCache || {};
            cache[meal.idMeal] = formatted;
            AppState.updateState({ mealNutritionCache: cache });

            container.innerHTML = this.createNutritionContent(formatted);

            const heroCalories = document.getElementById("hero-calories");
            const heroServings = document.getElementById("hero-servings");
            if (heroCalories) heroCalories.textContent = `${formatted.caloriesPerServing} cal/serving`;
            if (heroServings) heroServings.textContent = `${formatted.servings} servings`;

            const logBtn = document.getElementById("log-meal-btn");
            if (logBtn) {
                logBtn.disabled = false;
                logBtn.className = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer";
                logBtn.title = "";
                logBtn.innerHTML = `<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>`;
            }
        } catch (err) {
            console.error("Error loading nutrition data:", err);
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fa-solid fa-exclamation-circle text-3xl text-red-400 mb-3"></i>
                    <p class="text-gray-600">Unable to load nutrition data</p>
                    <button id="retry-nutrition-btn" class="mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                        <i class="fa-solid fa-refresh mr-1"></i> Try Again
                    </button>
                </div>
            `;

            const heroCalories = document.getElementById("hero-calories");
            if (heroCalories) heroCalories.textContent = "N/A";

            const logBtn = document.getElementById("log-meal-btn");
            if (logBtn) {
                logBtn.className = "flex items-center gap-2 px-6 py-3 bg-red-100 text-red-500 rounded-xl font-semibold cursor-not-allowed transition-all";
                logBtn.title = 'Nutrition data failed to load. Click "Try Again" in the nutrition section.';
                logBtn.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i><span>Unavailable</span>`;
            }

            document.getElementById("retry-nutrition-btn")?.addEventListener("click", () => {
                container.innerHTML = this.createNutritionLoadingState();
                const heroCal = document.getElementById("hero-calories");
                if (heroCal) heroCal.textContent = "Calculating...";

                const retryLogBtn = document.getElementById("log-meal-btn");
                if (retryLogBtn) {
                    retryLogBtn.disabled = true;
                    retryLogBtn.className = "flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all";
                    retryLogBtn.title = "Waiting for nutrition data...";
                    retryLogBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Calculating...</span>`;
                }
                this.loadNutritionData(meal, ingredients);
            });
        }
    }

    createNutritionLoadingState() {
        return `
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                    <i class="fa-solid fa-calculator text-emerald-600 text-xl animate-pulse"></i>
                </div>
                <p class="text-gray-700 font-medium mb-1">Calculating Nutrition</p>
                <p class="text-sm text-gray-500">Analyzing ingredients...</p>
                <div class="mt-4 flex justify-center">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createNutritionContent(nutrition) {
        const bar = (colorClass, widthPct) =>
            `<div class="w-full bg-gray-100 rounded-full h-2"><div class="${colorClass} h-2 rounded-full" style="width: ${Math.min(widthPct, 100)}%"></div></div>`;

        return `
            <p class="text-sm text-gray-500 mb-4">Per serving</p>

            <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Calories per serving</p>
                <p class="text-4xl font-bold text-emerald-600">${nutrition.caloriesPerServing}</p>
                <p class="text-xs text-gray-500 mt-1">Total: ${nutrition.totalCalories} cal</p>
            </div>

            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-emerald-500"></div><span class="text-gray-700">Protein</span></div>
                    <span class="font-bold text-gray-900">${nutrition.macros.protein.amount}g</span>
                </div>
                ${bar("bg-emerald-500", nutrition.macros.protein.dailyValue)}

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-gray-700">Carbs</span></div>
                    <span class="font-bold text-gray-900">${nutrition.macros.carbs.amount}g</span>
                </div>
                ${bar("bg-blue-500", nutrition.macros.carbs.dailyValue)}

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span class="text-gray-700">Fat</span></div>
                    <span class="font-bold text-gray-900">${nutrition.macros.fat.amount}g</span>
                </div>
                ${bar("bg-purple-500", nutrition.macros.fat.dailyValue)}

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-orange-500"></div><span class="text-gray-700">Fiber</span></div>
                    <span class="font-bold text-gray-900">${nutrition.macros.fiber.amount}g</span>
                </div>
                ${bar("bg-orange-500", nutrition.macros.fiber.dailyValue)}

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-pink-500"></div><span class="text-gray-700">Sugar</span></div>
                    <span class="font-bold text-gray-900">${nutrition.macros.sugar.amount}g</span>
                </div>
                ${bar("bg-pink-500", Math.round(nutrition.macros.sugar.amount / 50 * 100))}

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-red-500"></div><span class="text-gray-700">Saturated Fat</span></div>
                    <span class="font-bold text-gray-900">${nutrition.macros.saturatedFat.amount}g</span>
                </div>
                ${bar("bg-red-500", nutrition.macros.saturatedFat.dailyValue)}
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex justify-between"><span class="text-gray-600">Cholesterol</span><span class="font-medium">${nutrition.other.cholesterol}mg</span></div>
                    <div class="flex justify-between"><span class="text-gray-600">Sodium</span><span class="font-medium">${nutrition.other.sodium}mg</span></div>
                </div>
            </div>
        `;
    }

    createMealDetailPageContent(meal, nutrition, ingredients, instructions) {
        return `
            <div class="max-w-6xl mx-auto">
                <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back to Recipes</span>
                </button>

                <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div class="relative h-80 md:h-96">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover"/>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 right-0 p-8">
                            <div class="flex items-center gap-3 mb-3">
                                ${meal.strCategory ? `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory}</span>` : ""}
                                ${meal.strArea ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea}</span>` : ""}
                                ${meal.strTags ? meal.strTags.split(",").slice(0, 2).map(tag => `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${tag.trim()}</span>`).join("") : ""}
                            </div>
                            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.strMeal}</h1>
                            <div class="flex items-center gap-6 text-white/90">
                                <span class="flex items-center gap-2"><i class="fa-solid fa-clock"></i><span>30 min</span></span>
                                <span class="flex items-center gap-2"><i class="fa-solid fa-utensils"></i><span id="hero-servings">${nutrition?.servings || 4} servings</span></span>
                                <span class="flex items-center gap-2"><i class="fa-solid fa-fire"></i><span id="hero-calories">${nutrition ? nutrition.caloriesPerServing + " cal/serving" : "Calculating..."}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-3 mb-8">
                    <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all" data-meal-id="${meal.idMeal}" disabled title="Waiting for nutrition data...">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>Calculating...</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-8">
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-list-check text-emerald-600"></i>
                                Ingredients
                                <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
                            </h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                ${ingredients.map(item => `
                                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                                        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"/>
                                        <span class="text-gray-700"><span class="font-medium text-gray-900">${item.measure}</span> ${item.ingredient}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                                Instructions
                            </h2>
                            <div class="space-y-4">
                                ${instructions.map((step, index) => `
                                    <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
                                        <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
                                    </div>
                                `).join("")}
                            </div>
                        </div>

                        ${meal.strYoutube ? `
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-video text-red-500"></i>
                                Video Tutorial
                            </h2>
                            <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                                <iframe
                                    src="https://www.youtube.com/embed/${meal.strYoutube.split("v=")[1]}"
                                    class="absolute inset-0 w-full h-full"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                        ` : ""}
                    </div>

                    <div class="space-y-6">
                        <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                                Nutrition Facts
                            </h2>
                            <div id="nutrition-facts-container">
                                ${nutrition ? this.createNutritionContent(nutrition) : this.createNutritionLoadingState()}
                            </div>
                        </div>

                        ${meal.strSource ? `
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h3 class="text-sm font-semibold text-gray-900 mb-2">Recipe Source</h3>
                            <a href="${meal.strSource}" target="_blank" class="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-2">
                                <i class="fa-solid fa-external-link"></i>
                                View Original Recipe
                            </a>
                        </div>
                        ` : ""}
                    </div>
                </div>
            </div>
        `;
    }

    setupMealDetailPageListeners(meal, ingredients) {
        document.getElementById("back-to-meals-btn")?.addEventListener("click", () => this.navigateTo("meals"));
        document.getElementById("add-to-plan-detail-btn")?.addEventListener("click", () => {
            AppState.updateState({ selectedMeal: meal });
            this.showMealPlanModal(meal.idMeal);
        });
        document.getElementById("log-meal-btn")?.addEventListener("click", () => this.showLogMealModal(meal));
    }

    closeMealDetail() {
        this.navigateTo("meals");
        AppState.updateState({ selectedMeal: null, selectedMealId: null });
    }

    showNotification(message, type = "info") {
        const colors = { success: "bg-emerald-500", error: "bg-red-500", info: "bg-blue-500", warning: "bg-amber-500" };
        const toast = document.createElement("div");
        toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    handleStateChange(e) { /* hook متاح لأي تحديثات إضافية عند تغيّر الحالة */ }

    showSettingsPage() {
        this.toggleSections([
            "search-filters-section", "featured-recipes-section", "meal-categories-section",
            "all-recipes-section", "nutritional-insights-section"
        ], false);
        this.renderSettingsSection();
    }

    renderSettingsSection() {
        let section = document.getElementById("settings-section");
        if (!section) {
            section = document.createElement("section");
            section.id = "settings-section";
            section.className = "px-8 py-8 bg-gray-50 min-h-screen";
            const mainContent = document.getElementById("main-content");
            const footer = document.getElementById("footer");
            mainContent.insertBefore(section, footer);
        }
        section.style.display = "";

        const settings = AppState.getState().userSettings;
        const activityLevels = ["sedentary", "light", "moderate", "active", "very_active"];

        section.innerHTML = `
            <div class="max-w-3xl mx-auto">
                <div class="space-y-6">
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">Profile</h3>
                        <p class="text-sm text-gray-500 mb-4">Your personal information</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input type="number" id="setting-age" value="${settings.age || 30}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select id="setting-gender" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    <option value="male" ${settings.gender === "male" ? "selected" : ""}>Male</option>
                                    <option value="female" ${settings.gender === "female" ? "selected" : ""}>Female</option>
                                    <option value="other" ${settings.gender === "other" ? "selected" : ""}>Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                <input type="number" id="setting-weight" value="${settings.weight}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                <input type="number" id="setting-height" value="${settings.height}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">Nutrition Goals</h3>
                        <p class="text-sm text-gray-500 mb-4">Set your daily nutrition targets</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Daily Calories</label>
                                <input type="number" id="setting-calories" value="${settings.calorieGoal}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                                <input type="number" id="setting-protein" value="${settings.proteinGoal}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                                <input type="number" id="setting-carbs" value="${settings.carbsGoal}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                                <input type="number" id="setting-fat" value="${settings.fatGoal}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">Hydration</h3>
                        <p class="text-sm text-gray-500 mb-4">Set your water intake goals</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Daily Water Goal (ml)</label>
                                <input type="number" id="setting-water" value="${settings.waterGoal}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Glass Size (ml)</label>
                                <input type="number" id="setting-glass" value="${settings.waterGlassSize}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">Activity Level</h3>
                        <p class="text-sm text-gray-500 mb-4">How active are you on a typical day?</p>
                        <div class="grid grid-cols-5 gap-3" id="activity-level-selector">
                            ${activityLevels.map(level => `
                                <button class="activity-level-btn px-4 py-3 rounded-xl text-center transition-all ${settings.activityLevel === level ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}" data-level="${level}">
                                    <i class="fa-solid ${this.getActivityIcon(level)} text-lg mb-1"></i>
                                    <p class="text-xs font-medium capitalize">${level.replace("_", " ")}</p>
                                </button>
                            `).join("")}
                        </div>
                    </div>

                    <button id="save-settings-btn" class="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                        <i class="fa-solid fa-check"></i>
                        Save Settings
                    </button>

                    <div class="bg-red-50 rounded-2xl p-6 border border-red-200">
                        <h3 class="text-lg font-bold text-red-700 mb-1">Danger Zone</h3>
                        <p class="text-sm text-red-600 mb-4">These actions cannot be undone</p>
                        <button id="reset-data-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
                            Reset All Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupSettingsListeners();
    }

    getActivityIcon(level) {
        const icons = {
            sedentary: "fa-couch",
            light: "fa-person-walking",
            moderate: "fa-person-running",
            active: "fa-person-biking",
            very_active: "fa-person-swimming"
        };
        return icons[level] || "fa-person";
    }

    setupSettingsListeners() {
        document.querySelectorAll(".activity-level-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".activity-level-btn").forEach(b => {
                    b.classList.remove("bg-emerald-600", "text-white");
                    b.classList.add("bg-gray-100", "text-gray-700");
                });
                btn.classList.add("bg-emerald-600", "text-white");
                btn.classList.remove("bg-gray-100", "text-gray-700");
            });
        });

        document.getElementById("save-settings-btn")?.addEventListener("click", () => {
            const newSettings = {
                age: parseInt(document.getElementById("setting-age")?.value) || 30,
                gender: document.getElementById("setting-gender")?.value || "male",
                weight: parseInt(document.getElementById("setting-weight")?.value) || 70,
                height: parseInt(document.getElementById("setting-height")?.value) || 170,
                calorieGoal: parseInt(document.getElementById("setting-calories")?.value) || 2000,
                proteinGoal: parseInt(document.getElementById("setting-protein")?.value) || 50,
                carbsGoal: parseInt(document.getElementById("setting-carbs")?.value) || 250,
                fatGoal: parseInt(document.getElementById("setting-fat")?.value) || 65,
                waterGoal: parseInt(document.getElementById("setting-water")?.value) || 2000,
                waterGlassSize: parseInt(document.getElementById("setting-glass")?.value) || 250,
                activityLevel: document.querySelector(".activity-level-btn.bg-emerald-600")?.dataset.level || "moderate"
            };
            AppState.updateUserSettings(newSettings);
            this.showNotification("Settings saved successfully!", "success");
        });

        document.getElementById("reset-data-btn")?.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    showProductsPage() {
        this.toggleSections([
            "search-filters-section", "featured-recipes-section", "meal-categories-section",
            "all-recipes-section", "meal-planning-section", "nutritional-insights-section"
        ], false);
        this.renderProductsSection();
    }

    async renderProductsSection() {
        let section = document.getElementById("products-section");
        if (!section) {
            section = document.createElement("section");
            section.id = "products-section";
            section.className = "px-8 py-8 bg-gray-50 min-h-screen";
            const mainContent = document.getElementById("main-content");
            const footer = document.getElementById("footer");
            mainContent.insertBefore(section, footer);
        }
        section.style.display = "";

        const categories = await OpenFoodFacts.getPopularCategories();

        section.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
                    <h2 class="text-2xl font-bold mb-2"><i class="fa-solid fa-barcode mr-2"></i>Product Search & Barcode Scanner</h2>
                    <p class="opacity-90 mb-4">Search for packaged food products to view nutrition information</p>

                    <div class="flex gap-3">
                        <div class="flex-1 relative">
                            <input type="text" id="product-search-input" placeholder="Search by product name (e.g., Cheerios, Nutella, Coca-Cola...)"
                                class="w-full px-5 py-3.5 pr-12 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"/>
                            <i class="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <button id="search-product-btn" class="px-6 py-3.5 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-gray-100 transition-all">Search</button>
                    </div>

                    <div class="flex items-center gap-4 mt-4">
                        <div class="flex-1 h-px bg-white/30"></div>
                        <span class="text-sm opacity-80">or</span>
                        <div class="flex-1 h-px bg-white/30"></div>
                    </div>

                    <div class="mt-4 flex gap-3">
                        <div class="flex-1 relative">
                            <input type="text" id="barcode-input" placeholder="Enter barcode number (e.g., 7613034626844)"
                                class="w-full px-5 py-3.5 pr-12 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"/>
                            <i class="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <button id="lookup-barcode-btn" class="px-6 py-3.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all">
                            <i class="fa-solid fa-search mr-2"></i>Lookup
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-4 mb-6">
                    <span class="text-sm font-medium text-gray-700">Filter by Nutri-Score:</span>
                    <div class="flex gap-2">
                        <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200" data-grade="">All</button>
                        <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-green-100 text-green-700 hover:bg-green-200" data-grade="a">A</button>
                        <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-lime-100 text-lime-700 hover:bg-lime-200" data-grade="b">B</button>
                        <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200" data-grade="c">C</button>
                        <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-orange-100 text-orange-700 hover:bg-orange-200" data-grade="d">D</button>
                        <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-red-100 text-red-700 hover:bg-red-200" data-grade="e">E</button>
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">Browse by Category</h3>
                    <div class="flex gap-3 overflow-x-auto pb-2">
                        ${categories.map(c => Templates.createProductCategoryButton(c)).join("")}
                    </div>
                </div>

                <div class="flex items-center justify-between mb-4">
                    <p id="products-count" class="text-sm text-gray-600">Search for products to see results</p>
                </div>

                <div class="grid grid-cols-4 gap-5" id="products-grid"></div>

                <div id="products-loading" class="hidden py-12">${Templates.createLoadingSpinner()}</div>

                <div id="products-empty" class="py-12">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fa-solid fa-box-open text-gray-400 text-3xl"></i>
                        </div>
                        <p class="text-gray-500 text-lg mb-2">No products to display</p>
                        <p class="text-gray-400 text-sm">Search for a product or browse by category</p>
                    </div>
                </div>
            </div>
        `;

        this.setupProductsListeners();
    }

    setupProductsListeners() {
        document.getElementById("search-product-btn")?.addEventListener("click", () => {
            const query = document.getElementById("product-search-input")?.value.trim();
            if (query) this.searchProducts(query);
        });

        document.getElementById("product-search-input")?.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                const query = e.target.value.trim();
                if (query) this.searchProducts(query);
            }
        });

        document.getElementById("lookup-barcode-btn")?.addEventListener("click", () => {
            const barcode = document.getElementById("barcode-input")?.value.trim();
            if (barcode) this.lookupBarcode(barcode);
        });

        document.getElementById("barcode-input")?.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                const barcode = e.target.value.trim();
                if (barcode) this.lookupBarcode(barcode);
            }
        });

        document.querySelectorAll(".nutri-score-filter").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".nutri-score-filter").forEach(b => b.classList.remove("ring-2", "ring-gray-900"));
                btn.classList.add("ring-2", "ring-gray-900");
                const grade = btn.dataset.grade;
                const query = document.getElementById("product-search-input")?.value.trim() || "";
                if (query) this.searchProducts(query, grade);
            });
        });

        document.querySelectorAll(".product-category-btn").forEach(btn => {
            btn.addEventListener("click", () => this.searchProductsByCategory(btn.dataset.category));
        });

        document.getElementById("products-grid")?.addEventListener("click", e => {
            const card = e.target.closest(".product-card");
            if (card) this.showProductDetail(card.dataset.barcode);
        });
    }

    async searchProducts(query, grade = "") {
        const grid = document.getElementById("products-grid");
        const loading = document.getElementById("products-loading");
        const empty = document.getElementById("products-empty");
        const counter = document.getElementById("products-count");
        if (!grid) return;

        loading.classList.remove("hidden");
        empty.classList.add("hidden");
        grid.innerHTML = "";

        try {
            const options = { searchTerms: query, pageSize: 24 };
            if (grade) options.nutritionGrade = grade;

            const result = await OpenFoodFacts.searchProducts(options);
            loading.classList.add("hidden");

            if (result.products.length > 0) {
                grid.innerHTML = result.products.map(p => Templates.createProductCard(p)).join("");
                counter.textContent = `Found ${result.count} products for "${query}"`;
            } else {
                empty.classList.remove("hidden");
                counter.textContent = `No products found for "${query}"`;
            }

            AppState.updateState({ searchedProducts: result.products });
        } catch (err) {
            console.error("Product search error:", err);
            loading.classList.add("hidden");
            empty.classList.remove("hidden");
            counter.textContent = "Error searching products";
            this.showNotification("Failed to search products. Please try again.", "error");
        }
    }

    async searchProductsByCategory(category) {
        const grid = document.getElementById("products-grid");
        const loading = document.getElementById("products-loading");
        const empty = document.getElementById("products-empty");
        const counter = document.getElementById("products-count");
        if (!grid) return;

        loading.classList.remove("hidden");
        empty.classList.add("hidden");
        grid.innerHTML = "";

        try {
            const result = await OpenFoodFacts.getProductsByCategory(category);
            loading.classList.add("hidden");

            if (result.products.length > 0) {
                grid.innerHTML = result.products.map(p => Templates.createProductCard(p)).join("");
                counter.textContent = `Found ${result.count} products in ${category.replace(/_/g, " ")}`;
            } else {
                empty.classList.remove("hidden");
                counter.textContent = `No products found in ${category.replace(/_/g, " ")}`;
            }

            AppState.updateState({ searchedProducts: result.products });
        } catch (err) {
            console.error("Category search error:", err);
            loading.classList.add("hidden");
            empty.classList.remove("hidden");
            this.showNotification("Failed to load category products.", "error");
        }
    }

    async lookupBarcode(barcode) {
        const loading = document.getElementById("products-loading");
        const grid = document.getElementById("products-grid");
        const empty = document.getElementById("products-empty");
        const counter = document.getElementById("products-count");

        loading.classList.remove("hidden");
        grid.innerHTML = "";
        empty.classList.add("hidden");

        try {
            const product = await OpenFoodFacts.getProductByBarcode(barcode);
            loading.classList.add("hidden");

            if (product) {
                grid.innerHTML = Templates.createProductCard(product);
                counter.textContent = `Found product: ${product.name}`;
                AppState.updateState({ searchedProducts: [product] });
                this.showProductDetail(barcode);
            } else {
                empty.classList.remove("hidden");
                counter.textContent = `No product found with barcode: ${barcode}`;
                this.showNotification("Product not found in database", "error");
            }
        } catch (err) {
            console.error("Barcode lookup error:", err);
            loading.classList.add("hidden");
            empty.classList.remove("hidden");
            this.showNotification("Failed to lookup barcode.", "error");
        }
    }

    async showProductDetail(barcode) {
        let product = AppState.getState().searchedProducts?.find(p => p.barcode === barcode);
        if (!product) product = await OpenFoodFacts.getProductByBarcode(barcode);

        if (!product) {
            this.showNotification("Product not found", "error");
            return;
        }

        const gradeInfo = OpenFoodFacts.getNutriScoreInfo(product.nutritionGrade);
        const novaInfo = OpenFoodFacts.getNovaGroupInfo(product.novaGroup);

        const modal = document.createElement("div");
        modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
        modal.id = "product-detail-modal";
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                ${Templates.createProductDetailContent(product, gradeInfo, novaInfo)}
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll(".close-product-modal").forEach(btn => btn.addEventListener("click", () => modal.remove()));
        modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
        modal.querySelector(".add-product-to-log")?.addEventListener("click", () => {
            this.logFoodToDaily(product);
            modal.remove();
        });
    }

    logFoodToDaily(product) {
        const todayKey = AppState.getTodayString();
        const dailyLog = AppState.getState().dailyLog || {};

        if (!dailyLog[todayKey]) {
            dailyLog[todayKey] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, meals: [] };
        }

        dailyLog[todayKey].totalCalories += Math.round(product.nutrition?.calories || 0);
        dailyLog[todayKey].totalProtein += Math.round(product.nutrition?.protein || 0);
        dailyLog[todayKey].totalCarbs += Math.round(product.nutrition?.carbs || 0);
        dailyLog[todayKey].totalFat += Math.round(product.nutrition?.fat || 0);
        dailyLog[todayKey].meals.push({
            type: "product",
            name: product.name,
            brand: product.brand,
            barcode: product.barcode,
            serving: "100g",
            nutrition: product.nutrition,
            loggedAt: new Date().toISOString()
        });

        AppState.updateState({ dailyLog }, true);
        this.showNotification(`${product.name} logged to your daily intake! 📝`, "success");
        this.updateFoodLogPage();
    }

    showLogMealModal(meal) {
        const cachedNutrition = AppState.getState().mealNutritionCache?.[meal.idMeal];

        const modal = document.createElement("div");
        modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
        modal.id = "log-meal-modal";
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center gap-4 mb-6">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-16 h-16 rounded-xl object-cover"/>
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
                        <p class="text-gray-500 text-sm">${meal.strMeal}</p>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
                    <div class="flex items-center gap-3">
                        <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                            <i class="fa-solid fa-minus text-gray-600"></i>
                        </button>
                        <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5"
                            class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2"/>
                        <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                            <i class="fa-solid fa-plus text-gray-600"></i>
                        </button>
                    </div>
                </div>

                ${cachedNutrition ? `
                <div class="bg-emerald-50 rounded-xl p-4 mb-6">
                    <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div><p class="text-lg font-bold text-emerald-600" id="modal-calories">${cachedNutrition.caloriesPerServing}</p><p class="text-xs text-gray-500">Calories</p></div>
                        <div><p class="text-lg font-bold text-blue-600" id="modal-protein">${cachedNutrition.macros?.protein?.amount || 0}g</p><p class="text-xs text-gray-500">Protein</p></div>
                        <div><p class="text-lg font-bold text-amber-600" id="modal-carbs">${cachedNutrition.macros?.carbs?.amount || 0}g</p><p class="text-xs text-gray-500">Carbs</p></div>
                        <div><p class="text-lg font-bold text-purple-600" id="modal-fat">${cachedNutrition.macros?.fat?.amount || 0}g</p><p class="text-xs text-gray-500">Fat</p></div>
                    </div>
                </div>
                ` : `
                <div class="bg-gray-50 rounded-xl p-4 mb-6">
                    <p class="text-sm text-gray-500 text-center">Nutrition information not available for this meal</p>
                </div>
                `}

                <div class="flex gap-3">
                    <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
                    <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                        <i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const servingsInput = modal.querySelector("#meal-servings");

        modal.querySelector("#decrease-servings")?.addEventListener("click", () => {
            const value = parseFloat(servingsInput.value);
            if (value > 0.5) servingsInput.value = (value - 0.5).toFixed(1);
        });

        modal.querySelector("#increase-servings")?.addEventListener("click", () => {
            const value = parseFloat(servingsInput.value);
            if (value < 10) servingsInput.value = (value + 0.5).toFixed(1);
        });

        modal.querySelector("#cancel-log-meal")?.addEventListener("click", () => modal.remove());

        modal.querySelector("#confirm-log-meal")?.addEventListener("click", () => {
            const servings = parseFloat(servingsInput.value) || 1;
            const nutrition = AppState.getState().mealNutritionCache?.[meal.idMeal] || cachedNutrition;
            this.logMealToDaily(meal, servings, nutrition);
            modal.remove();
        });

        modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    }

    logMealToDaily(meal, servings, nutrition) {
        const todayKey = AppState.getTodayString();
        const dailyLog = AppState.getState().dailyLog || {};

        if (!dailyLog[todayKey]) {
            dailyLog[todayKey] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, meals: [] };
        }

        const entryNutrition = {
            calories: nutrition ? Math.round(nutrition.caloriesPerServing * servings) : 0,
            protein: nutrition ? Math.round((nutrition.macros?.protein?.amount || 0) * servings) : 0,
            carbs: nutrition ? Math.round((nutrition.macros?.carbs?.amount || 0) * servings) : 0,
            fat: nutrition ? Math.round((nutrition.macros?.fat?.amount || 0) * servings) : 0
        };

        dailyLog[todayKey].totalCalories += entryNutrition.calories;
        dailyLog[todayKey].totalProtein += entryNutrition.protein;
        dailyLog[todayKey].totalCarbs += entryNutrition.carbs;
        dailyLog[todayKey].totalFat += entryNutrition.fat;
        dailyLog[todayKey].meals.push({
            type: "meal",
            name: meal.strMeal,
            mealId: meal.idMeal,
            category: meal.strCategory,
            thumbnail: meal.strMealThumb,
            servings,
            nutrition: entryNutrition,
            loggedAt: new Date().toISOString()
        });

        AppState.updateState({ dailyLog }, true);

        Swal.fire({
            title: "Meal Logged!",
            html: `<p class="text-gray-600">${meal.strMeal} (${servings} serving${servings !== 1 ? "s" : ""}) has been added to your daily log.</p>
                   ${entryNutrition.calories > 0 ? `<p class="text-emerald-600 font-semibold mt-2">+${entryNutrition.calories} calories</p>` : ""}`,
            icon: "success",
            confirmButtonColor: "#10b981",
            timer: 2000,
            showConfirmButton: false
        });

        this.updateFoodLogPage();
    }

    showFoodLogPage() {
        this.toggleSections([
            "search-filters-section", "featured-recipes-section", "meal-categories-section",
            "all-recipes-section", "meal-planning-section", "nutritional-insights-section"
        ], false);
        this.renderFoodLogSection();
    }

    renderFoodLogSection() {
        let section = document.getElementById("foodlog-section");
        if (!section) {
            section = document.createElement("section");
            section.id = "foodlog-section";
            section.className = "px-8 py-8 bg-gray-50 min-h-screen";
            const mainContent = document.getElementById("main-content");
            const footer = document.getElementById("footer");
            mainContent.insertBefore(section, footer);
        }
        section.style.display = "";

        const todaySummary = this.getTodayLogSummary();
        const weeklyData = this.getWeeklyLogData();
        const goals = AppState.getState().userGoals || {
            dailyCalories: 2000, dailyProtein: 50, dailyCarbs: 250, dailyFat: 65
        };

        section.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold mb-2"><i class="fa-solid fa-clipboard-list mr-2"></i>Daily Food Log</h2>
                            <p class="opacity-90">Track and monitor your daily nutrition intake</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm opacity-80">Today</p>
                            <p class="text-xl font-bold">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                        </div>
                    </div>
                </div>

                <div id="foodlog-today-section" class="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200">
                    <h3 class="text-lg font-bold text-gray-900 mb-4"><i class="fa-solid fa-fire text-orange-500 mr-2"></i>Today's Nutrition</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        ${this.renderNutritionProgress("Calories", todaySummary.totalCalories, goals.dailyCalories, "kcal", "emerald")}
                        ${this.renderNutritionProgress("Protein", todaySummary.totalProtein, goals.dailyProtein, "g", "blue")}
                        ${this.renderNutritionProgress("Carbs", todaySummary.totalCarbs, goals.dailyCarbs, "g", "amber")}
                        ${this.renderNutritionProgress("Fat", todaySummary.totalFat, goals.dailyFat, "g", "purple")}
                    </div>

                    <div class="border-t border-gray-200 pt-4">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-sm font-semibold text-gray-700">Logged Items (${todaySummary.meals?.length || 0})</h4>
                            ${todaySummary.meals?.length > 0 ? `
                                <button id="clear-foodlog" class="text-red-500 hover:text-red-600 text-sm font-medium">
                                    <i class="fa-solid fa-trash mr-1"></i>Clear All
                                </button>
                            ` : ""}
                        </div>
                        ${this.renderLoggedItemsList(todaySummary.meals || [])}
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200">
                    <h3 class="text-lg font-bold text-gray-900 mb-4"><i class="fa-solid fa-calendar-week text-indigo-500 mr-2"></i>Weekly Overview</h3>
                    <div class="grid grid-cols-7 gap-2">
                        ${weeklyData.map(day => `
                            <div class="text-center ${day.isToday ? "bg-indigo-100 rounded-xl" : ""}">
                                <p class="text-xs text-gray-500 mb-1">${day.dayName}</p>
                                <p class="text-sm font-medium text-gray-900">${day.date}</p>
                                <div class="mt-2 ${day.calories > 0 ? "text-emerald-600" : "text-gray-300"}">
                                    <p class="text-lg font-bold">${day.calories}</p>
                                    <p class="text-xs">kcal</p>
                                </div>
                                ${day.itemCount > 0 ? `<p class="text-xs text-gray-400 mt-1">${day.itemCount} items</p>` : ""}
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><i class="fa-solid fa-chart-line text-emerald-600 text-xl"></i></div>
                            <div>
                                <p class="text-sm text-gray-500">Weekly Average</p>
                                <p class="text-xl font-bold text-gray-900">${weeklyData.reduce((sum, d) => sum + d.calories, 0) > 0 ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / 7) : 0} kcal</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><i class="fa-solid fa-utensils text-blue-600 text-xl"></i></div>
                            <div>
                                <p class="text-sm text-gray-500">Total Items This Week</p>
                                <p class="text-xl font-bold text-gray-900">${weeklyData.reduce((sum, d) => sum + d.itemCount, 0)} items</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><i class="fa-solid fa-bullseye text-purple-600 text-xl"></i></div>
                            <div>
                                <p class="text-sm text-gray-500">Days On Goal</p>
                                <p class="text-xl font-bold text-gray-900">${weeklyData.filter(d => d.calories > 0 && d.calories >= goals.dailyCalories * 0.8 && d.calories <= goals.dailyCalories * 1.2).length} / 7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupFoodLogListeners();
    }

    renderNutritionProgress(label, current, goal, unit, colorName) {
        const percentage = Math.min(Math.round(current / goal * 100), 100);
        const overGoal = current > goal;

        return `
            <div class="bg-gray-50 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">${label}</span>
                    <span class="text-xs ${overGoal ? "text-red-500" : `text-${colorName}-600`}">${percentage}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div class="h-2.5 rounded-full ${overGoal ? "bg-red-500" : `bg-${colorName}-500`}" style="width: ${percentage}%"></div>
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold ${overGoal ? "text-red-600" : `text-${colorName}-600`}">${current} ${unit}</span>
                    <span class="text-gray-400">/ ${goal} ${unit}</span>
                </div>
            </div>
        `;
    }

    renderLoggedItemsList(items) {
        if (items.length === 0) {
            return `
                <div class="text-center py-12">
                    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-utensils text-gray-300 text-3xl"></i>
                    </div>
                    <p class="text-gray-500 font-medium mb-2">No food logged today</p>
                    <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
                    <div class="flex justify-center gap-3">
                        <a href="#meals" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                            <i class="fa-solid fa-plus"></i>Browse Recipes
                        </a>
                        <a href="/products" class="nav-link inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                            <i class="fa-solid fa-barcode"></i>Scan Product
                        </a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-3 max-h-96 overflow-y-auto">
                ${items.map((item, index) => `
                    <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
                        <div class="flex items-center gap-4">
                            ${item.type === "meal" && item.thumbnail
                                ? `<img src="${item.thumbnail}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover"/>`
                                : `<div class="w-14 h-14 ${item.type === "product" ? "bg-blue-100" : "bg-emerald-100"} rounded-xl flex items-center justify-center">
                                        <i class="fa-solid fa-${item.type === "product" ? "box" : "utensils"} ${item.type === "product" ? "text-blue-600" : "text-emerald-600"} text-xl"></i>
                                   </div>`}
                            <div>
                                <p class="font-semibold text-gray-900">${item.name}</p>
                                <p class="text-sm text-gray-500">
                                    ${item.type === "meal" ? `${item.servings} serving${item.servings !== 1 ? "s" : ""}` : item.brand || item.serving || "Product"}
                                    <span class="mx-1">•</span>
                                    <span class="${item.type === "product" ? "text-blue-600" : "text-emerald-600"}">${item.type === "product" ? "Product" : "Recipe"}</span>
                                </p>
                                <p class="text-xs text-gray-400 mt-1">${new Date(item.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <p class="text-lg font-bold text-emerald-600">${item.nutrition?.calories || 0}</p>
                                <p class="text-xs text-gray-500">kcal</p>
                            </div>
                            <div class="hidden md:flex gap-2 text-xs text-gray-500">
                                <span class="px-2 py-1 bg-blue-50 rounded">${item.nutrition?.protein || 0}g P</span>
                                <span class="px-2 py-1 bg-amber-50 rounded">${item.nutrition?.carbs || 0}g C</span>
                                <span class="px-2 py-1 bg-purple-50 rounded">${item.nutrition?.fat || 0}g F</span>
                            </div>
                            <button class="remove-foodlog-item text-gray-400 hover:text-red-500 transition-all p-2" data-index="${index}">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    getWeeklyLogData() {
        const dailyLog = AppState.getState().dailyLog || {};
        const today = new Date();
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const dayKey = day.toISOString().split("T")[0];
            const dayLog = dailyLog[dayKey] || { totalCalories: 0, meals: [] };

            days.push({
                dayName: day.toLocaleDateString("en-US", { weekday: "short" }),
                date: day.getDate(),
                calories: dayLog.totalCalories || 0,
                itemCount: dayLog.meals?.length || 0,
                isToday: i === 0
            });
        }
        return days;
    }

    setupFoodLogListeners() {
        document.getElementById("clear-foodlog")?.addEventListener("click", () => {
            Swal.fire({
                title: "Clear Today's Log?",
                text: "This will remove all logged food items for today.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, clear it!",
                cancelButtonText: "Cancel"
            }).then(result => {
                if (result.isConfirmed) {
                    this.clearTodayLog();
                    this.renderFoodLogSection();
                    Swal.fire({ title: "Cleared!", text: "Your food log has been cleared.", icon: "success", timer: 1500, showConfirmButton: false });
                }
            });
        });

        document.querySelectorAll(".remove-foodlog-item").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.dataset.index);
                this.removeLoggedItem(index);
                this.renderFoodLogSection();
            });
        });
    }

    updateFoodLogPage() {
        const section = document.getElementById("foodlog-section");
        if (section && section.style.display !== "none") this.renderFoodLogSection();
    }

    getTodayLogSummary() {
        const todayKey = AppState.getTodayString();
        return (AppState.getState().dailyLog || {})[todayKey] || {
            totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, meals: []
        };
    }

    removeLoggedItem(index) {
        const todayKey = AppState.getTodayString();
        const dailyLog = AppState.getState().dailyLog || {};
        if (!dailyLog[todayKey] || !dailyLog[todayKey].meals[index]) return;

        const item = dailyLog[todayKey].meals[index];
        dailyLog[todayKey].totalCalories -= Math.round(item.nutrition?.calories || 0);
        dailyLog[todayKey].totalProtein -= Math.round(item.nutrition?.protein || 0);
        dailyLog[todayKey].totalCarbs -= Math.round(item.nutrition?.carbs || 0);
        dailyLog[todayKey].totalFat -= Math.round(item.nutrition?.fat || 0);

        dailyLog[todayKey].totalCalories = Math.max(0, dailyLog[todayKey].totalCalories);
        dailyLog[todayKey].totalProtein = Math.max(0, dailyLog[todayKey].totalProtein);
        dailyLog[todayKey].totalCarbs = Math.max(0, dailyLog[todayKey].totalCarbs);
        dailyLog[todayKey].totalFat = Math.max(0, dailyLog[todayKey].totalFat);

        dailyLog[todayKey].meals.splice(index, 1);
        AppState.updateState({ dailyLog }, true);
        this.showNotification("Item removed from log", "info");
        this.updateFoodLogPage();
    }

    clearTodayLog() {
        const todayKey = AppState.getTodayString();
        const dailyLog = AppState.getState().dailyLog || {};
        dailyLog[todayKey] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, meals: [] };
        AppState.updateState({ dailyLog }, true);
        this.showNotification("Today's log cleared", "info");
        this.updateFoodLogPage();
    }
}

/* ============ 7) بدء التشغيل ============ */

document.addEventListener("DOMContentLoaded", () => {
    window.nutriPlanApp = new NutriPlanApp();
});

/* ============ 8) الرسوم البيانية (Plotly) - اختياري إذا كانت مكتبة Plotly محمّلة ============ */

window.addEventListener("load", function () {
    setTimeout(() => {
        try {
            if (typeof Plotly !== "undefined") {
                const macroChart = document.getElementById("macro-chart");
                if (macroChart && !macroChart.data) {
                    renderDashboardCharts();
                }
            }
        } catch (err) {
            console.error("Chart rendering error:", err);
        }
    }, 1000);
});

function renderDashboardCharts() {
    try {
        const macroData = [{
            values: [42, 18, 28, 6],
            labels: ["Protein", "Carbs", "Fat", "Fiber"],
            type: "pie",
            marker: { colors: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"] },
            textinfo: "label+percent",
            textposition: "inside",
            hovertemplate: "<b>%{label}</b><br>%{value}g<br>%{percent}<extra></extra>"
        }];

        const macroLayout = {
            title: { text: "", font: { size: 0 } },
            showlegend: true,
            legend: { orientation: "h", y: -0.1 },
            margin: { t: 20, r: 20, b: 60, l: 20 },
            plot_bgcolor: "#ffffff",
            paper_bgcolor: "#ffffff"
        };

        Plotly.newPlot("macro-chart", macroData, macroLayout, { responsive: true, displayModeBar: false, displaylogo: false });

        const calorieData = [
            {
                x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                y: [1850, 1920, 1780, 2100, 1950, 2200, 2050],
                type: "scatter", mode: "lines+markers", name: "Actual",
                line: { color: "#10b981", width: 3 },
                marker: { size: 8, color: "#10b981" },
                hovertemplate: "<b>%{x}</b><br>%{y} calories<extra></extra>"
            },
            {
                x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                y: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
                type: "scatter", mode: "lines", name: "Target",
                line: { color: "#ef4444", width: 2, dash: "dash" },
                hovertemplate: "<b>Target</b><br>%{y} calories<extra></extra>"
            }
        ];

        const calorieLayout = {
            title: { text: "", font: { size: 0 } },
            xaxis: { title: "Day of Week" },
            yaxis: { title: "Calories" },
            margin: { t: 20, r: 20, b: 60, l: 60 },
            plot_bgcolor: "#f9fafb",
            paper_bgcolor: "#ffffff",
            showlegend: true,
            legend: { orientation: "h", y: -0.2 }
        };

        Plotly.newPlot("calorie-chart", calorieData, calorieLayout, { responsive: true, displayModeBar: false, displaylogo: false });
    } catch (err) {
        console.error("Initial chart rendering error:", err);
    }
}
import NutriPlanServices from "./nutriPlanServices.js";
import MealLoge from "./ui/mealLogUIComponent.js";
import MealsUIComponent from "./ui/mealsUIComponent.js";
import ProductUIComponent from "./ui/productUIComponent.js";

const BASE_API = `https://nutriplan-api.vercel.app/api/`;
const appLoadingOverlay = document.getElementById("app-loading-overlay");
const foodlogSection = document.getElementById("foodlog-section");
const productsSection = document.getElementById("products-section");
const sections = document.querySelectorAll("section");
const navLinks = document.getElementById("navLinks");
const links = document.querySelectorAll(".nav-link");
const foodlogDate = document.getElementById("foodlog-date");
const ACTIVE_NAV_LINK_CLASSES = ["bg-emerald-50", "text-emerald-700"];
const IN_ACTIVE_NAV_LINK_CLASSES = ["text-gray-600", "hover:bg-gray-50"];
const headerTitle = document.querySelector("#header h1");
const headerText = document.querySelector("#header p");
const headerMenuBtn = document.getElementById("header-menu-btn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
const mainContent = document.getElementById("main-content");

const nutriPlanServices = await new NutriPlanServices(
    BASE_API,
    appLoadingOverlay,
);
const mealLoge = new MealLoge();
const productUIComponent = new ProductUIComponent();
const mealsUIComponent = new MealsUIComponent(router, nutriPlanServices);

function switchActiveLink(e) {
    const navLink = e.target.closest("ul .nav-link");
    if (!navLink) return;
    e.preventDefault();
    links.forEach((link) => {
        if (link.classList.contains("bg-emerald-50")) {
            link.classList.remove(...ACTIVE_NAV_LINK_CLASSES);
            link.classList.add(...IN_ACTIVE_NAV_LINK_CLASSES);
        }
    });
    navLink.classList.remove(...IN_ACTIVE_NAV_LINK_CLASSES);
    navLink.classList.add(...ACTIVE_NAV_LINK_CLASSES);
    const path = navLink.getAttribute("href");
    window.location.hash = path;
}

function hideMenu() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
}

async function renderHome() {
    await mealsUIComponent.fetchAllMealsData();
    const categories = await mealsUIComponent.getAllCategories();
    mealsUIComponent.mealsCategories.render(categories);
    const areas = await mealsUIComponent.getAllAreas();
    mealsUIComponent.mealsArea.render(areas);
    mealsUIComponent.home.searchFiltersSection.classList.remove("hidden");
    mealsUIComponent.home.mealCategoriesSection.classList.remove("hidden");
    mealsUIComponent.home.allRecipesSection.classList.remove("hidden");
    headerTitle.innerText = "Meals & Recipes";
    headerText.innerText =
        "Discover delicious and nutritious recipes tailored for you";
}

async function renderProducts() {
    headerTitle.innerText = "Product Scanner";
    headerText.innerText = "Search packaged foods by name or barcode";
    productsSection.classList.remove("hidden");
}

async function renderFoodLog() {
    headerTitle.innerText = "Food Log";
    headerText.innerText = "Track your daily nutrition and food intake";
    foodlogDate.innerText = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
    mealLoge.getMealsData();
    foodlogSection.classList.remove("hidden");
}

async function router() {
    sections.forEach((ele) => {
        if (!ele.classList.contains("hidden")) {
            ele.classList.add("hidden");
        }
    });
    const hash = window.location.hash;
    let navLink = document.querySelector(`a[href='${hash.slice(1)}']`);
    if (!navLink) {
        navLink = document.querySelector(`a[href='/home']`);
    }
    if (hash === "#/home" || hash === "") {
        if (hash === "") {
            history.replaceState({}, "", "#/home");
        }
        await renderHome();
    } else if (hash === "#/products") {
        await renderProducts();
    } else if (hash === "#/foodlog") {
        await renderFoodLog();
    } else if (hash.includes("#/meal/")) {
        let mealId = mealsUIComponent.mealId;
        if (!mealId) {
            history.replaceState({}, "", `#/home`);
            router();
            return;
        }
        const data = await nutriPlanServices.fetchMealsById(mealId);
        history.replaceState({}, "", `#/meal/${data?.name?.split(" ").join("-")}`);
        mealsUIComponent.showDetails(data);
    }
    if (!navLink.classList.contains("bg-emerald-50")) {
        links.forEach((link) => {
            if (link.classList.contains("bg-emerald-50")) {
                link.classList.remove(...ACTIVE_NAV_LINK_CLASSES);
                link.classList.add(...IN_ACTIVE_NAV_LINK_CLASSES);
            }
        });
        navLink.classList.add(...ACTIVE_NAV_LINK_CLASSES);
    }
}

async function render() {
    await router();
    mainContent.classList.remove("hidden");
    await nutriPlanServices.toggleLoader();
}

headerMenuBtn.addEventListener("click", (e) => {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
});
sidebarCloseBtn.addEventListener("click", hideMenu);
window.addEventListener("click", (e) => {
    const openBtn = e.target.closest("#header-menu-btn");
    if (openBtn) return;
    const inSide = e.target.closest("#sidebar");
    const link = e.target.closest(".nav-link");
    if (link) {
        hideMenu();
        return;
    }
    if (inSide) return;
    hideMenu();
});
window.addEventListener("load", render);
window.addEventListener("hashchange", router);
navLinks.addEventListener("click", switchActiveLink);
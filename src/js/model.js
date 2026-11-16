import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

/**
 * @typedef {Object} Search
 * @property {string} query - Current search query
 * @property {RecipePreview[]} results - Search results previews
 * @property {number} page - Current results page
 * @property {number} resultsPerPage - Number of results displayed per page
 */

/**
 * State Object
 * @typedef {Object} State
 * @property {Recipe} recipe - Currently selected recipe
 * @property {Search} search - Search related state
 * @property {Recipe[]} bookmarks - Array of bookmarked recipes
 */

/**
 * @typedef {Object} Recipe
 * @property {string} id - Unique recipe identifier
 * @property {string} title - Recipe title
 * @property {string} publisher - Name of the recipe publisher
 * @property {string} sourceUrl - URL of the original recipe
 * @property {string} image - URL of the recipe image
 * @property {number} servings - Number of servings
 * @property {number} cookingTime - Total cooking time in minutes
 * @property {Object[]} ingredients - Array of recipe ingredients
 * @property {string} [key] - Optional API key
 * @property {boolean} bookmarked - Whether the recipe is bookmarked
 */

/**
 * @typedef {Object} RecipePreview
 * @property {string} id - Unique recipe identifier
 * @property {string} title - Recipe title
 * @property {string} publisher - Recipe publisher
 * @property {string} image - URL of the recipe image
 * @property {string} [key] - Optional API key
 */

/**
 * @typedef {Object} UploadRecipeData
 * @property {string} title - Recipe title
 * @property {string} sourceUrl - Original recipe URL
 * @property {string} image - Recipe image URL
 * @property {string} publisher - Recipe publisher
 * @property {string} cookingTime - Cooking time in minutes
 * @property {string} servings - Number of servings
 * @property {string} [ingredient1] - First ingredient in quantity,unit,description format
 */

/**
 * @type {State}
 */
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

/**
 * Creates a recipe object from the API response
 * @param {Object} data - Raw API response
 * @returns {Recipe} Formatted recipe object
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceURL: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 * Loads a recipe from the API and updates the application state
 * @async
 * @param {string} id - The unique identifier of the recipe to load
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails or the response cannot be parsed
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

/**
 * Loads search results from the API and updates the application state
 * @async
 * @param {string} query - The search query used to find recipes
 * @returns {Promise<void>} Resolves when the search results have been loaded
 * @throws {Error} If the API request fails or the response cannot be parsed
 */
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

/**
 * Returns the search results for the specified page
 * @param {number} [page=state.search.page] - The page number to retrieve
 * @returns {RecipePreview[]} Array of recipe previews for the requested page
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

/**
 * Updates the recipe servings and ingredient quantities in the application state
 * @param {number} newServings - The desired number of servings
 * @returns {boolean} True if the update was successful, otherwise false
 */
export const updateServings = function (newServings) {
  // Returns whether the update was applied, so the caller can skip re-render.
  if (!Number.isFinite(newServings) || newServings < 1) return false;

  const current = state.recipe.servings;
  if (!Number.isFinite(current) || current < 1) return false;

  state.recipe.ingredients.forEach(ing => {
    // Preserve "no quantity" ingredients; null would decay to 0 here.
    if (ing.quantity == null) return;
    ing.quantity = (ing.quantity * newServings) / current;
  });

  state.recipe.servings = newServings;
  return true;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * Adds a bookmarked recipe to the bookmarked array and persists the updated bookmarks
 * @param {Recipe} recipe - The recipe to add to bookmarks
 */
export const addBookmark = function (recipe) {
  // Add bookmarks
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

/**
 * Deletes a bookmarked recipe from the bookmarked array and persists the updated bookmarks
 * @param {string} id - The recipe to delete from bookmarks
 */
export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

/**
 * Uploads a user-submitted recipe to the API and updates the application state
 * @async
 * @param {UploadRecipeData} newRecipe
 * @returns {Promise<void>}
 * @throws {Error} If an ingredient has an invalid format or the API request fails
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)',
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

import View from './View.js';
import icons from 'url:../../img/icons.svg';

/**
 * Handles pagination controls and generates pagination markup
 * @extends {View}
 */
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  /**
   * Attaches a click handler to the pagination container.
   * @param {(page: number) => void} handler - Callback receiving the page number to navigate to.
   * @listens Element:click
   * @returns {void}
   */
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  /**
   * Generates pagination button markup based on the current page and total pages.
   * Renders a next button on page 1, a prev button on the last page,
   * both buttons on middle pages, and nothing when there is only one page.
   * @override
   * @protected
   * @returns {string} HTML markup for the pagination buttons, or an empty string
   */
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );

    // Page 1, with other pages
    if (curPage === 1 && numPages > 1) {
      return `
        <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button> 
`;
    }
    // Last page
    if (curPage === numPages && numPages > 1) {
      return `
        <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
        </button>
        `;
    }
    // Other page
    if (curPage < numPages) {
      return `
        <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
        </button>
        <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button> 
        `;
    }

    // Page 1, with no other pages
    return '';
  }
}

export default new PaginationView();

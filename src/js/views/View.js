import icons from 'url:../../img/icons.svg';

/**
 * Abstract base class for all application views
 * Provides shared methods for rendering and updating the DOM
 * @class
 * @abstract
 */

export default class View {
  /**
   * Data used to generate the view's markup.
   * @protected
   */
  _data;

  /**
   * Renders the view by injecting generated markup into the parent element.
   * @param {Object|Object[]} data - Data to be displayed
   * @param {boolean} [render=true] - Whether to render the markup to the DOM
   * @returns {string|undefined} The generated markup if rendering is disabled
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Updates the DOM with new data without re-rendering the entire view.
   * @param {Object|Object[]} data - Updated data used to generate the markup.
   * @returns {void}  
   */
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Updates changed ATTRIBUTES
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value),
        );
      }
    });
  }

  /**
   * Clears the contents of the parent element
   * @private
   * @returns {void}
   */
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Renders a loading spinner inside the parent element.
   * @returns {void}
   */
  renderSpinner() {
    const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Renders an error message inside the parent element
   * @param {string} [message=this._errorMessage] - Error message to display
   * @returns {void}  
   */
  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Renders an informational message inside the parent element
   * @param {string} [message=this._message] - Message to display
   * @returns {void}  
   */
  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}

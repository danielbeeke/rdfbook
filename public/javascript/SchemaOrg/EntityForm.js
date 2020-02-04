import {html, render} from '../vendor/lighterhtml.js';

import {URL} from './fields/URL.js';
import {Date} from './fields/Date.js';
import {Text} from './fields/Text.js';
import {AddressLocality} from './fields/AddressLocality.js';

/**
 * May be RDF field types or may be field names.
 */
const fieldTypesMap = {
  'URL': URL,
  'Date': Date,
  'Text': Text,
  'addressLocality': AddressLocality
};

export class EntityForm extends EventTarget {

  /**
   * It is possible to inject a different form or field template.
   * @param entity
   * @param formTemplate
   * @param fieldTemplate
   */
  constructor(entity, formTemplate, fieldTemplate) {
    super();
    this.entity = entity;
    if (formTemplate) { this.formTemplate = formTemplate }
    if (fieldTemplate) { this.fieldTemplate = fieldTemplate }
  }

  /**
   * Renders the form in a HTML element.
   * @param domSelector
   */
  attachTo (domSelector) {
    this.element = document.querySelector(domSelector);
    this.render();
  }

  /**
   * Renders and rerenders.
   */
  render () {
    render(this.element, this.formTemplate(this.getFields(), html));
  }

  /**
   * Converts the RDF types to our field types.
   * @returns {[]}
   */
  getFields () {
    let fields = [];
    for (let [fieldName, originalField] of this.entity.getFields()) {
      let field = Object.assign({}, originalField);
      field.fieldName = fieldName;
      let fieldTypes = this.entity.getTypesFromSchema(field);
      let renderer = fieldTypesMap[field['rdfs:label']] ? fieldTypesMap[field['rdfs:label']] : fieldTypesMap[fieldTypes[0]];
      field.render = renderer(field, () => this.render());
      fields.push(field);
    }

    return fields;
  }

  /**
   * The default field template.
   * @param field
   * @returns {Hole}
   */
  fieldTemplate (field) {
    return html`<div class="field">
        <label>${field.label}</label>
        <div class="field-inner">
          ${field.render}
        </div>
        <small class="description">${field['description']}</small>
    </div>`;
  }

  /**
   * The default form template.
   * @param fields
   * @returns {Hole}
   */
  formTemplate (fields) {
    return html`
      <form onsubmit="${() => this.submit(event)}">
        ${fields.map(field => this.fieldTemplate(field))}
        <input type="submit">
      </form>
    `;
  }

  submit (event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('submit', {
      detail: {
        originalEvent: event
      }
    }))
  }
}
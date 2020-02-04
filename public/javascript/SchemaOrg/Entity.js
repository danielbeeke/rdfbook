import { transformFields } from './helpers/transformFields.js';

export const CreateEntityType = function (originalFields) {

  let fields = transformFields(originalFields);

  class Entity {
    constructor() {
      fields.forEach(field => {
        this[field['rdfs:label']] = null;
      });
    }

    /**
     * Sets a value to the entity.
     * @param field
     * @param value
     */
    set (field, value) {
      if (typeof this[field] === 'undefined') throw `Unknown field: ${field} was set.`;
      this[field] = value;
    }

    /**
     * Returns the value of a field.
     *
     * @param field
     * @returns {*}
     */
    get (field) {
      if (typeof this[field] === 'undefined') throw `Unknown field: ${field} was get.`;
      return this[field];
    }

    getValidationErrors () {
      let errors = {};
      fields.forEach(fieldSchema => {
        let fieldTypes = this.getTypesFromSchema(fieldSchema);
        let fieldName = fieldSchema['rdfs:label'];
        let value = this.get(fieldName);
        if (!this.validateValue(value, fieldTypes)) {
          errors[fieldName] = this.getValidationErrorMessage(value, fieldTypes, fieldSchema);
        }
      });
      return errors;
    }

    /**
     * Validates a value to given types.
     * @param value
     * @param types
     * @returns {boolean}
     */
    validateValue (value, types) {
      let validatedOnce = false;

      types.forEach(type => {
        let validatedForThisType;

        switch (type) {
          case 'Date':
            validatedForThisType = this.validateTypeDate(value);
            break;
          case 'URL':
            validatedForThisType = this.validateTypeURL(value);
            break;

          /**
           * Types like Person or other things are hard to validate.
           * We allow them all.
           */
          default:
            validatedForThisType = true;
        }

        if (validatedForThisType) validatedOnce = true;
      });

      return validatedOnce;
    }

    /**
     * Throws an exception for a specific value that did not validate.
     * @param value
     * @param types
     * @param fieldSchema
     */
    getValidationErrorMessage (value, types, fieldSchema) {
      const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
      let error = `"${value}" is not a valid value for ${fieldSchema['rdfs:label']}. `;

      if (types.length > 1) {
        error += `It must be one of the types ${formatter.format(types)}`;
      }
      else {
        error += `It must be of the type ${types[0]}`;
      }

      return error;
    }

    /**
     * Validates according to ISO 8601.
     *
     * @param value
     * @returns {boolean}
     */
    validateTypeDate (value) {
      if (!/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/.test(value)) return false;
      return (new Date(value)).toISOString() === value;
    }

    /**
     *
     * Validates a URL.
     *
     * @param value
     * @returns {boolean}
     */
    validateTypeURL (value) {
      const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(value);
    }

    /**
     * Returns the types of a field.
     *
     * @param fieldSchema
     * @returns string[]
     */
    getTypesFromSchema (fieldSchema) {
      return (Array.isArray(fieldSchema['schema:rangeIncludes']) ?
        fieldSchema['schema:rangeIncludes'] :
        [fieldSchema['schema:rangeIncludes']])
        .map(fieldType => fieldType['@id']
        .substr(7));
    }

    /**
     * Returns the properties to create fields from.
     * @returns {*}
     */
    getFields () {
      return fields;
    }
  }

  return Entity;
};

export function transformFields (originalFields) {
  let fields = new Map();
  originalFields.forEach(originalField => {
    let fieldName = originalField[0];
    let rdfSchema = originalField[1];
    let overrides = originalField[2];
    let fieldSchema = Object.assign({}, rdfSchema, overrides);
    if (typeof fieldSchema['label'] === 'undefined' && fieldSchema['rdfs:label']) fieldSchema['label'] = fieldSchema['rdfs:label'];
    if (typeof fieldSchema['description'] === 'undefined' && fieldSchema['rdfs:comment']) fieldSchema['description'] = fieldSchema['rdfs:comment'];
    fields.set(fieldName, fieldSchema);
  });

  return fields;
}
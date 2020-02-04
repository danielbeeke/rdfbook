import {Ontology} from '../SchemaOrg/Ontology.js';
import {CreateEntityType as SchemaOrgEntity} from '../SchemaOrg/Entity.js';

const schema = Ontology.Thing.Person;
const schemaAddress = Ontology.Intangible.StructuredValue.ContactPoint.PostalAddress;

export class Person extends SchemaOrgEntity([

  /**
   * Defines fields with:
   * [ FieldName, Rdf property schema, Overrides ]
   */

  ['FirstName', schema.givenName, { label: 'First name', description: '' }],
  ['LastName', schema.familyName, { label: 'Last name', description: '' }],
  ['BirthDate', schema.birthDate, { label: 'Date of birth', description: '' }],
  ['Street', schemaAddress.streetAddress, { label: 'Street and house number', description: '' }],
  ['City', schemaAddress.addressLocality, { label: 'City', description: '' }]

]) {
  constructor() {
    super();
  }
}
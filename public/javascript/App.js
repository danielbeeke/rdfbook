import {Person} from './Entity/Person.js';
import {EntityForm} from './SchemaOrg/EntityForm.js';
import {PersonStore} from './Sparql/PersonStore.js';

let store = new PersonStore(`http://192.168.99.101:3030/rdfbook`);

store.query(`
SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object
}
LIMIT 25
`).then(response => {
  console.log(response)
});

let person = new Person();
let form = new EntityForm(person);
form.attachTo('#app');
form.addEventListener('submit', event => {
  let errors = person.getValidationErrors();
  console.log(errors)
});
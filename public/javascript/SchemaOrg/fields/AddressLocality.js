import {html} from '../../vendor/lighterhtml.js';

let cities = [];

const fetchCities = async (event, trigger) => {
  let search = event.target.value;
  let geonamesUsername = 'danielbeeke';
  let url = `http://api.geonames.org/search?name_startsWith=${search}&maxRows=10&username=${geonamesUsername}&type=json&featureClass=P`;
  let response = await fetch(url);
  response = await response.json();
  cities = [];
  response.geonames.forEach(place => {
    if (!cities.includes(place.name)) {
      cities.push(place.name);
    }
  });

  trigger();
};

export const AddressLocality = (field, trigger) => {
  return html`
    <input type="text" autocomplete="off" list="${field.fieldName}" onkeyup="${event => fetchCities(event, trigger)}">
    <datalist id="${field.fieldName}">
      ${cities.map(city => html`<option>${city}</option>`)}
    </datalist>
  `
};
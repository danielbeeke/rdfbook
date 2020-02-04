export class Store {

  constructor(path) {
    this.path = path;
  }

  query (sparql) {
    const data = new URLSearchParams();
    data.append('query', sparql);
    return fetch(this.path, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/sparql-results+json,*/*;q=0.9'
      }
    }).then(response => response.json())
  }
}

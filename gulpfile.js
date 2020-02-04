'use strict';

const fs = require('fs');
const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob');
const fetch = require('node-fetch');

gulp.task('sass', function () {
  return gulp.src('./scss/**/*.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./scss/**/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.series('sass:watch'));

gulp.task('generate-definitions', async function (cb) {
  if (!process.argv[3]) {
    throw `
    ===============================================================
    Please give one or more types separated with a comma. 
    Like: gulp generate-definitions --types=Person,PostalAddress
    ===============================================================
    `
  }
  let types = process.argv[3].substr(8).split(',');
  let schemaOrgObject = {};

  let response = await fetch('https://schema.org/version/latest/schema.jsonld');
  response = await response.json();

  for (let type of types) {
    let schema = await fetch(`https://schema.org/${type}.jsonld`);
    schema = await schema.json();

    let item = response['@graph'].find(child => child['rdfs:label'] === type);
    let trail = [item];
    while (item['rdfs:subClassOf']) {
      item = response['@graph'].find(child => child['@id'] === item['rdfs:subClassOf']['@id']);
      trail.push(item);
    }
    trail.reverse();

    let pointer = schemaOrgObject;
    trail.forEach((item, index) => {
      if (!pointer[item['rdfs:label']]) {
        pointer[item['rdfs:label']] = item;
        pointer = pointer[item['rdfs:label']];
      }

      if (index === trail.length - 1) {
        schema['@graph']
          .filter(schemaItem => schemaItem['@type'] === 'rdf:Property')
          .forEach(schemaItem => {
            pointer[schemaItem['rdfs:label']] = schemaItem;
          });
      }
    });
  }

  fs.writeFileSync(
    './public/javascript/SchemaOrg/Ontology.js',
    `export const Ontology = ${JSON.stringify(schemaOrgObject, null, 4)}`
  );

  cb();
});

// Webpack loader that consumes JS files created by css-loader and creates
// .cljc files out of them. That allows us to use CSS Modules from comfort of
// Clojure/ClojureScript
// It doesn't change its' sources anyhow, so you may use it after css-loader
// and still consume css-loader artifacts in next loaders

const fs = require('fs');
const { Parser } = require('acorn');
const { getOptions } = require('loader-utils');

const last = x => x[x.length - 1];

const snakeCaseToKebabCase = str => str.replace(/_/g, '-');
const kebabCaseToSnakeCase = str => str.replace(/-/g, '_');

const astToDefs = ast => {
  let defs;

  ast.body.forEach(node => {
    if (node.type === 'ExpressionStatement' && node.expression.left) {
      const { right, left } = node.expression;
      const { object, property } = left;

      if (
        object &&
        object.name === 'exports' &&
        property &&
        property.name === 'locals'
      ) {
        defs = right.properties
          .map(property => {
            const key = property.key.value;
            const value = property.value.value;

            const cljsDef = `(def ${key} "${value}")`;

            return cljsDef;
          })
          .join('\n');
      }
    }
  });

  return defs;
};

function transform(source) {
  const MyParser = Parser.extend();
  const ast = MyParser.parse(source);

  const name = last(this.resourcePath.split('/'));

  const options = getOptions(this);
  const defs = astToDefs(ast);

  const [file, ext] = name.split('.');

  const kebabFileName = snakeCaseToKebabCase(file);
  const nsPrefix = options.nsPrefix || 'styles';

  const fileContent = `(ns ${nsPrefix}.${kebabFileName})\n`.concat(defs);

  const path = options.path || './styles';

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  const snakeFileName = kebabCaseToSnakeCase(file);

  fs.writeFile(`${path}/${snakeFileName}.cljc`, fileContent, function(err) {
    if (err) throw err;
  });

  return source;
}

module.exports = transform;

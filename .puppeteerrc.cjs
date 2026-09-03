const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Guarda el navegador descargado dentro de la carpeta del proyecto
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Fuerza a Puppeteer a guardar el binario dentro del proyecto
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

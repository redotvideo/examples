const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
// [END monitoring_synthetic_monitoring_custom_puppeteer_cjs]
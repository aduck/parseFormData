const path = require('path')
module.exports = {
  upload: {
    path: path.resolve(__dirname, './upload'),
    maxSize: 100 * 1024
  }
}
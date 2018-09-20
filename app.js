const fs = require('fs')
const {upload} = require('./config')
const {parseFormData} = require('./utils')
module.exports =  (req, res) => {
  if (req.url === '/form.html') {
    res.writeHead(200, {'content-type': 'text/html'})
    res.write(fs.readFileSync('./form.html'))
    res.end()
  } else if (req.url === '/upload') {
    parseFormData(req, {fileSize: upload.maxSize}, upload.path)
      .then(parsed => {
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify(parsed))
        res.end()
      })
      .catch(e => {
        console.log(e)
      })
  } else {
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('hello formData')
    res.end()
  }
}
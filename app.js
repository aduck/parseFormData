const fs = require('fs')
const path = require('path')
const BusBoy = require('busboy')

/**
 * 解析form data
 * @param {Object} req ReadStream
 * @param {String} uploadDir 文件上传目录
 */
function parseFormData (req, uploadDir = './upload') {
  return new Promise((resolve, reject) => {
    let origin = req.headers.origin
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)
    let busboy = new BusBoy({headers: req.headers})
    let parsed = {}
    let urls = []
    busboy.on('field', (fieldname, val) => {
      parsed[fieldname] = val
    })
    busboy.on('file', (fieldname, file, filename) => {
      let timestamp = Date.now()
      let extname = path.extname(filename)
      let name = path.basename(filename, extname)
      let uploadPath = `${uploadDir}/${name}_${timestamp}${extname}`
      let saveTo = path.resolve(__dirname, uploadPath)
      file.pipe(fs.createWriteStream(saveTo))
      urls.push(path.join(origin, uploadPath))
      parsed[fieldname] = urls
    })
    busboy.on('finish', () => {
      resolve(parsed)
    })
    req.pipe(busboy)
  })
}

module.exports =  (req, res) => {
  if (req.url === '/form.html') {
    res.writeHead(200, {'content-type': 'text/html'})
    res.write(fs.readFileSync('./form.html'))
    res.end()
  } else if (req.url === '/upload') {
    parseFormData(req, './upload')
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
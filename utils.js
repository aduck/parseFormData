const path = require('path')
const fs = require('fs')
const BusBoy = require('busboy')
module.exports = {
  /**
   * 解析form data
   * @param {Object} req ReadStream
   * @param {Object} limit 上传限制
   * @param {String} uploadDir 文件上传目录
   */
  parseFormData (req, limit, uploadDir = './upload') {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)
      let busboy = new BusBoy({headers: req.headers})
      let parsed = {}
      busboy.on('field', (fieldname, val) => {
        parsed[fieldname] = val
      })
      busboy.on('file', (fieldname, file, filename) => {
        let received = 0
        let timestamp = Date.now()
        let extname = path.extname(filename)
        let name = path.basename(filename, extname)
        let uploadPath = `${uploadDir}/${name}_${timestamp}${extname}`
        if (!name) {
          return reject(new Error('文件不存在'))
        }
        if (limit && limit.accept && limit.accept.indexOf(extname) === -1) {
          return reject(new Error('不支持的文件格式'))
        }
        let writeStream = fs.createWriteStream(uploadPath)
        file.on('data', data => {
          received += data.length
          if (limit && limit.fileSize && received > limit.fileSize) {
            return reject(new Error('文件过大'))
          }
          if (!writeStream.write(data)) {
            file.pause()
          }
          writeStream.setMaxListeners(0)
          writeStream.on('drain', () => {
            file.resume()
          })
        })
        parsed[fieldname] ? parsed[fieldname].push(uploadPath) : (parsed[fieldname] = [uploadPath])
      })
      busboy.on('finish', () => {
        resolve(parsed)
      })
      req.pipe(busboy)
    })
  },
  /**
   * 合并切片
   * @param {Array} sliceList 切片列表
   * @param {String} dist 生成文件
   */
  composeFile (sliceList, dist) {
    return new Promise((resolve, reject) => {
      let i = 0
      let total = Buffer.from([])
      function concat () {
        if (i > sliceList.length - 1) {
          fs.writeFile(dist, total, err => {
            if (err) return reject(err)
            resolve('切片合并完成')
          })
          return
        }
        fs.readFile(sliceList[i], (err, data) => {
          if (err) return reject(err)
          i += 1
          total = Buffer.concat([total, data])
          concat()
        })
      }
      concat()
    })
  }
}
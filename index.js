const http = require('http')
const app = require('./app')
const PORT = 8888
http.createServer(app).listen(PORT, () => {
  console.log(`server running @ port ${PORT}`)
})
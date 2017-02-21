const http = require('http')
const fs = require('fs')
const connect = require('connect')
const compression = require('compression')
const serveStatic = require('serve-static')
const app = connect()
const port = 8080

app.use(compression())
app.use(serveStatic('www/', {
	fallthrough: true,
	maxAge: 24 * 60 * 60 * 1000,
}))
app.use((req, res, next) => {
	fs.readFile('www/index.html', (err, buf) => {
		if (err) return next(err)
		res.setHeader('Content-Type', 'text/html')
		res.end(buf)
	})
})

http.createServer(app).listen(port)
console.log('Started server on port %d.', port)

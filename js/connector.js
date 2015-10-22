var connect = require('connect')
var http = require('http')
var app = connect()
var url = require('url')
var bodyParser = require('body-parser')
var request = require('request')

// Configuration
var debug = true
var port = 3001
var concavaUrl = 'http://localhost:3000/'

// Define method for authentication mocking
function getUserByToken (token, cb) {
	if (token === 'test') {
		var user = { id: 1, token: token }
		return cb(null, user)
	}
	cb('No user for token.')
}

// Verify request method
app.use(function (req, res, next) {
	if (req.method === 'POST') return next()

	res.writeHead(404)
	res.end('Not found.')
})

// Parse query
app.use(function (req, res, next) {
	req.query = url.parse(req.url, true).query
	next()
})

// Authenticate
app.use(function (req, res, next) {
	getUserByToken(req.query.token, function (err, user) {
		if (err) {
			res.writeHead(401)
			res.end('Invalid authentication token.')
			return
		}

		req.user = user
		next()
	})
})

// Parse body
app.use(bodyParser.text({ type: 'text/xml' }))

// Verify given XML
app.use(function (req, res, next) {
	if (req.body) return next()

	res.writeHead(204)
	res.end('No content.')
})

// Parse payload hex and id from XML body
app.use(function (req, res, next) {
	var id = req.body.match(/<Lrrid>([0-9]{8})<\/Lrrid>/)[1]
	var hex = req.body.match(/<payload_hex>([a-fA-F0-9]+)<\/payload_hex>/)[1]

	if ( ! id) {
		res.writeHead(400)
		res.end('Invalid payload ID.')
		return
	}
	if ( ! hex) {
		res.writeHead(400)
		res.end('Invalid payload hex.')
		return
	}

	req.payload = new Buffer(id + hex, 'hex')
	next()
})

// Debug: dump request paremeters
if (debug) {
	app.use(function (req, res, next) {
		console.log({
			url: concavaUrl,
			body: req.payload,
			headers: {
				'Content-Type': 'application/octet-stream',
				'X-Auth-Token': req.user.token,
			},
		})
		next()
	})
}

// Forward to ConCaVa
app.use(function (req, res, next) {
	request.post({
		url: concavaUrl,
		body: req.payload,
		headers: {
			'Content-Type': 'application/octet-stream',
			'X-Auth-Token': req.user.token,
		},
	}, function (err, httpResponse, body) {
		next(err)
	})
})

// Return response
app.use(function (req, res, next) {
	res.end()
})

// Error handler
app.use(function (err, req, res, next) {
	console.error(err, err.stack)
	if (err instanceof Error) err = err.toString()
	res.writeHead(500)
	res.end(err || '')
	next()
})

// Start server
http.createServer(app).listen(port)
console.log('Listening on', port)

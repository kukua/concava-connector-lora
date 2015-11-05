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
var keyrock = {
	url: 'http://concava:5000/v3/',
	adminToken: 'b7c415f74139431a9382882f2bf0bd8c',
}

// Define method for authentication mocking
function getUserByToken (token, cb) {
	request(keyrock.url + 'auth/tokens', {
		headers: {
			'Content-Type': 'application/json',
			'X-Auth-Token': keyrock.adminToken,
			'X-Subject-Token': token,
		},
	}, function (err, httpResponse, body) {
		if (err) return cb(err)
		if (httpResponse.statusCode !== 200) cb('Invalid token.')

		var data = JSON.parse(body)
		var user = data.token.user

		cb(null, {
			id: user.id,
			name: user.name,
			token: token,
		})
	})
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
	var id = req.body.match(/<DevEUI>([a-fA-F0-9]{16})<\/DevEUI>/)[1]
	var hex = req.body.match(/<payload_hex>([a-fA-F0-9]{1,51})<\/payload_hex>/)[1]

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

	req.buffer = new Buffer(id + hex, 'hex')
	next()
})

// Debug: dump request paremeters
if (debug) {
	app.use(function (req, res, next) {
		console.log(req.buffer.toString('hex'))
		next()
	})
}

// Forward to ConCaVa
app.use(function (req, res, next) {
	request.post({
		url: concavaUrl,
		body: req.buffer,
		headers: {
			'Content-Type': 'application/octet-stream',
			'X-Auth-Token': req.user.token,
		},
	}, function (err, httpResponse, body) {
		if (err) return next(err)

		if (httpResponse.statusCode !== 200) {
			return next('Error in ConCaVa (' + httpResponse.statusMessage + '): ' + body)
		}

		next()
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

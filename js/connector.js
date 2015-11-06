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
	adminToken: 'b0cf392a9562445d8cb222038010716a',
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
		if (httpResponse.statusCode !== 200) return cb('Unauthorized token.')

		var data = JSON.parse(body)

		if (data.error) {
			if (data.error.code === 401) return cb('Unauthorized token.')
			return cb(data.error.message)
		}

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

	var err = new Error('Not found.')
	err.statusCode = 404
	next(err)
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
			err = new Error('Invalid authorization token.')
			err.statusCode = 401
			return next(err)
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

	var err = new Error('No content.')
	err.statusCode = 204
	next(err)
})

// Parse payload hex and id from XML body
app.use(function (req, res, next) {
	var id = req.body.match(/<DevEUI>([a-fA-F0-9]{16})<\/DevEUI>/)[1]
	var hex = req.body.match(/<payload_hex>([a-fA-F0-9]{1,51})<\/payload_hex>/)[1]

	if ( ! id) {
		var err = new Error('Invalid payload ID.')
		err.statusCode = 400
		return cb(err)
	}
	if ( ! hex) {
		var err = new Error('Invalid payload hex.')
		err.statusCode = 400
		return cb(err)
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
			'Authorization': 'Token ' + req.user.token,
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
	console.error(err)
	if (err.stack) console.error(err.stack)

	var statusCode = (err.statusCode || 500)
	res.writeHead(statusCode)

	if (err instanceof Error) err = err.toString().replace(/^Error: /, '')

	if (statusCode === 500) {
		res.end('An internal server error occured.')
	} else {
		res.end(err || '')
	}
})

// Start server
http.createServer(app).listen(port)
console.log('Listening on', port)

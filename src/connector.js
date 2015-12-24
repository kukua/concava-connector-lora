var connect = require('connect')
var http = require('http')
var app = connect()
var url = require('url')
var request = require('request')

// Configuration
var config = require('../config.js')

// Method for sending data to ConCaVa
function send (token, deviceId, payload, cb) {
	request.post({
		url: config.concavaUrl,
		body: Buffer.concat([new Buffer(deviceId, 'hex'), payload]),
		headers: {
			'Content-Type': 'application/octet-stream',
			'Authorization': 'Token ' + token,
		},
	}, function (err, httpResponse, body) {
		if (err) return cb(err)

		if (httpResponse.statusCode !== 200) {
			return cb('Error in ConCaVa (' + httpResponse.statusMessage + '): ' + body)
		}

		cb()
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

// Parse body
app.use(function (req, res, next) {
	req.setEncoding('utf8')
	req.body = ''
	req.on('data', function (chunk) {
		req.body += chunk
	})
	req.on('end', function () {
		next()
	})
})

// Verify given XML
app.use(function (req, res, next) {
	if (typeof req.body === 'string' && req.body) return next()

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

	req.deviceId = id.toLowerCase()
	req.payload = new Buffer(hex, 'hex')
	next()
})

// Debug: dump request paremeters
if (config.debug) {
	app.use(function (req, res, next) {
		console.log(req.deviceId, req.payload.toString('hex'))
		next()
	})
}

// Forward to ConCaVa
app.use(function (req, res, next) {
	send(req.query.token, req.deviceId, req.payload, next)
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
http.createServer(app).listen(config.port)
console.log('Listening on', config.port)

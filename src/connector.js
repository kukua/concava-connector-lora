var connect = require('connect')
var http = require('http')
var app = connect()
var urlParser = require('url')
var request = require('request')

// Configuration
const debug = (process.env['DEBUG'] === 'true' || process.env['DEBUG'] === '1')
const url = (process.env['CONCAVA_URL'] || 'unknown.host')
const port = (parseInt(process.env['PORT']) || 3000)

// Method for sending data to ConCaVa
function send (token, deviceId, payload, cb) {
	request.post({
		url,
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
	req.query = urlParser.parse(req.url, true).query
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
		let err = new Error('Invalid payload ID.')
		err.statusCode = 400
		return next(err)
	}
	if ( ! hex) {
		let err = new Error('Invalid payload hex.')
		err.statusCode = 400
		return next(err)
	}

	req.deviceId = id.toLowerCase()
	req.payload = new Buffer(hex, 'hex')
	next()
})

// Debug: dump request paremeters
if (debug) {
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
	next()
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

	next()
})

// Start server
http.createServer(app).listen(port)
console.log('Listening on', port)

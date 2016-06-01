# LoRa Connector

> LoRa connector for converting KPN LoRa XML to a binary payload and forwarding it to ConCaVa.

## Installation

The LoRa connector can be run as a NodeJS program or in a Docker container.

Make sure [ConCaVa](https://github.com/kukua/concava) is setup as well.
See [`.env.example`](https://github.com/kukua/concava-connector-lora/tree/master/.env.example) for the default configuration.

### NodeJS

```bash
git clone https://github.com/kukua/concava-connector-lora.git
cd concava-connector-lora
cp .env.example .env
chmod 600 .env
# > Edit .env

npm install
npm run compile
source .env
npm start
```

Tested with NodeJS v5.1

### Docker

First, [install Docker](http://docs.docker.com/engine/installation/). Then run:

```bash
curl https://raw.githubusercontent.com/kukua/concava-connector-lora/master/.env.example > .env
chmod 600 .env
# > Edit .env

docker run -d -p 3333:3333 -p 5555:5555 \
	-v ./lora.log:/tmp/output.log
	--env-file .env --name lora_connector \
	kukuadev/concava-connector-lora
```

Tested with Docker v1.9.

## Test

```js
cat example.xml | curl -v -XPOST 'http://<container IP or localhost>:3000/?token=abcdef0123456789abcdef0123456789' -H 'Content-Type: text/xml' --data @-
```

See [`example.xml`](https://github.com/kukua/concava-connector-lora/tree/master/tools/example.xml) for the XML format.

## Contribute

Your help and feedback are highly appreciated!

## License

This software is licensed under the [MIT license](https://github.com/kukua/concava-connector-lora/blob/master/LICENSE).

© 2016 Kukua BV

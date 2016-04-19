# LoRa Connector

> LoRa connector for converting KPN LoRa XML to a binary payload and forwarding it to ConCaVa.

## How to use

```bash
docker run -d -p 3000:3000 -v /path/to/config.js:/data/config.js kukuadev/concava-connector-lora
```

Make sure [ConCaVa](https://github.com/kukua/concava) is setup as well.
See [`config.js.sample`](https://github.com/kukua/concava-connector-lora/tree/master/config.js.sample) for the default configuration.

## Test

```bash
cat example.xml | curl -XPOST 'http://<container IP>:3000/?token=abcdef0123456789abcdef0123456789' -H 'Content-Type: text/xml' --data @-
```

See [`example.xml`](https://github.com/kukua/concava-connector-lora/tree/master/example.xml) for the XML format.

## Contribute

Your help and feedback are highly appreciated!

```bash
git clone https://github.com/kukua/concava-connector-lora
cd concava-connector-lora
npm install
npm start
```

## License

This software is licensed under the [MIT license](https://github.com/kukua/concava-connector-spul/blob/master/LICENSE).

© 2016 Kukua BV

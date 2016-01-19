# LoRa Connector

> LoRa Connector for converting XML to a binary payload and forwarding it to ConCaVa.

## How to use

```bash
docker run -d -p 3000:3000 -v /path/to/config.js:/data/config.js kukuadev/concava-connector-lora
```

Make sure [ConCaVa](https://github.com/kukua/concava) is setup as well.
See [`config.js.sample`](https://github.com/kukua/concava-connector-lora/tree/master/config.js.sample) for the default configuration.

## Test

```bash
http POST 'http://<container IP>:3000/?token=test' 'Content-Type: text/xml' < example.xml
```

In these examples [HTTPie](https://github.com/jkbrzt/httpie) is used.
See [`example.xml`](https://github.com/kukua/concava-connector-lora/tree/master/example.xml) for the XML format.

## Contribute

Your help and feedback are highly welcome!

```bash
git clone https://github.com/kukua/concava-connector-lora
cd concava-connector-lora
npm install
npm start
```

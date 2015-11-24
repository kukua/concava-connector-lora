# LoRa Connector

> LoRa Connector for converting XML from a KPN LoRa Server to a binary payload and forwarding it to ConCaVa.

## How to use

```bash
docker run -d -p 3001 -v /path/to/config.js:/data/config.js kukuadev/concava-lora-connector
```

Make sure [ConCaVa](https://github.com/kukua/concava) is setup aswell.

## Example

```bash
http POST 'http://<container IP>:3001/?token=test' 'Content-Type: text/xml' < data.xml`
```

In these examples [HTTPie](https://github.com/jkbrzt/httpie) is used.
See [`example.xml`](https://github.com/kukua/concava-lora-connector/tree/master/example.xml) for the XML format.

## Contribute

Your help and feedback is highly welcome!

```bash
git clone https://github.com/kukua/concava-lora-connector
cd concava-lora-connector
npm install
npm start
```

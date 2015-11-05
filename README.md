# LoRa Connector

> LoRa Connector for converting XML data to binary payload and forwarding it to ConCaVa.

## How to use

Setup ConCaVa first, see the [ConCaVa README](https://github.com/Kukua/concava).

```bash
docker-compose up -d

http POST 'http://localhost:3001/?token=test' 'Content-Type: text/xml' < test/data.xml`
```

#!/bin/sh

(curl context_broker:1026/v1/updateContext -s -S --header 'Content-Type: application/json' \
    --header 'Accept: application/json' -d @- | python -mjson.tool) <<EOF
{
	"contextElements": [
		{
			"type": "PayloadMapping",
			"isPattern": "false",
			"id": "17311037691378274000",
			"attributes": [
				{
					"name": "temp1",
					"type": "asciiFloat",
					"value": 5,
					"metadatas": [
						{
							"name": "min",
							"type": "integer",
							"value": -30
						},
						{
							"name": "max",
							"type": "integer",
							"value": 40
						}
					]
				},
				{
					"name": "skip1",
					"type": "skip",
					"value": 2
				},
				{
					"name": "temp2",
					"type": "asciiFloat",
					"value": 5,
					"metadatas": [
						{
							"name": "min",
							"type": "integer",
							"value": -30
						},
						{
							"name": "max",
							"type": "integer",
							"value": 40
						}
					]
				},
				{
					"name": "skip2",
					"type": "skip",
					"value": 2
				},
				{
					"name": "humidity",
					"type": "asciiInteger",
					"value": 4,
					"metadatas": [
						{
							"name": "min",
							"type": "integer",
							"value": 120
						},
						{
							"name": "max",
							"type": "integer",
							"value": 1080
						}
					]
				},
				{
					"name": "skip3",
					"type": "skip",
					"value": 2
				},
				{
					"name": "pressure",
					"type": "asciiFloat",
					"value": 5
				}
			]
		}
	],
	"updateAction": "APPEND"
}
EOF

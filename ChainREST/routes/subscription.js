const {json} = require('express');
var express = require('express');
var router = express.Router();
var cron = require('node-cron');
const http = require('http');
const fs = require('fs')
const axios = require('axios');
const { default: fabricNetworkSimple } = require('fabric-network-simple');
var CircularJSON = require('circular-json');


var conf = fabricNetworkSimple.config = {
    channelName: "mychannel",
    contractName: "GuardianSC",
    connectionProfile: {
        name: "umu.fabric",
        version: "1.0.0",
        channels: {
            mychannel: {
                orderers: ["orderer.odins.com"],
                peers: {
                    "peer0.org1.odins.com": {
                        endorsingPeer: true,
                        chaincodeQuery: true,
                        ledgerQuery: true,
                        eventSource: true,
                        discover: true
                    }
                }
            },
        },
        organizations: {
            Org1: {
                mspid: "Org1MSP",
                peers: ["peer0.org1.odins.com"],
                certificateAuthorities: ["ca.org1.odins.com"]
            }
        },
        orderers: {
            "orderer.odins.com": {
                url: "grpcs://10.9.26.101:7050",
                tlsCACerts: {
                    path:
                        "/home/debian/ChainREST/test/ordererOrganizations/odins.com/orderers/orderer.odins.com/msp/tlscacerts/tlsca.odins.com-cert.pem",
                },
            }
        },
        peers: {
            "peer0.org1.odins.com": {
                "url": "grpcs://10.9.26.103:7051",
                tlsCACerts: {
                    path:
                        "/home/debian/ChainREST/test/peerOrganizations/org1.odins.com/peers/peer0.org1.odins.com/msp/tlscacerts/tlsca.org1.odins.com-cert.pem",
                },
            },
        },
    },
    certificateAuthorities: {
        "ca.org1.odins.com": {
            "url": "https://10.9.26.102:7054",
            "httpOptions": {
                "verify": false
            },
            "registrar": [{
                "enrollId": "admin",
                "enrollSecret": "adminpw"
            }]
        }
    },
    identity: {
        mspid: 'Org1MSP',
        certificate: '-----BEGIN CERTIFICATE-----\nMIICJDCCAcugAwIBAgIRAMLJ5Dq0suLCbnAlFiOlpAcwCgYIKoZIzj0EAwIwbzEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xFzAVBgNVBAoTDm9yZzEub2RpbnMuY29tMRowGAYDVQQDExFjYS5v\ncmcxLm9kaW5zLmNvbTAeFw0yMTA5MDYxMDIzMDBaFw0zMTA5MDQxMDIzMDBaMGox\nCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4g\nRnJhbmNpc2NvMQ8wDQYDVQQLEwZjbGllbnQxHTAbBgNVBAMMFFVzZXIxQG9yZzEu\nb2RpbnMuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERy/BIdw/vc8BZZ6d\nUod3QRhJuoiR21lnpbl58bUluqzr9+TPiSIG4hPjoXRB68tZRNb5w9+ismmHWQ9o\nZuwCT6NNMEswDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQw\nIoAgfX1EitPfGt967D5Yk2YfW6mEpKtOOC+iGKq2F1lDmNIwCgYIKoZIzj0EAwID\nRwAwRAIgYaEKPnG9fsLHZj8+vKyHzQZH5tHgyTV2DnIwkC1ZI3kCICU5Xt+OZIKx\nnuuWNoymboSHQvl2gZri06hLuWs6o6Ui\n-----END CERTIFICATE-----\n',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgwJbDMaWvCM78o9ZF\nyWXs2/yLx3s6paHP04SpBVRIiO6hRANCAARHL8Eh3D+9zwFlnp1Sh3dBGEm6iJHb\nWWeluXnxtSW6rOv35M+JIgbiE+OhdEHry1lE1vnD36KyaYdZD2hm7AJP\n-----END PRIVATE KEY-----\n',
    },
    settings: {
        enableDiscovery: true,
        asLocalhost: false,
    }
}
var brokerURL = "http://guardian.odins.es/backend/";
var brokerUser = "guardian@odins.es";
var brokerpass = "Ygovy8NzS8Jedun8T55wBRAjwXL/ZTFkpPHEhQ8xPpA=";
var brokerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNGM5N2EwODU2MmMwNTRmOWYxNmM4ZCIsImlhdCI6MTYzNTIzODc3NywiZXhwIjoxNjM1MzI1MTc3fQ.-NNpOVGbJvi1qRBbFPhps1XhkL7OkgpBgo-qG0zzWEk";
var entidades;
asyncCall();
var fabconnection;

function initConection() {
    return new Promise(resolve => {
        fabconnection = new fabricNetworkSimple(conf);
    });
}

async function asyncCall() {

  console.log('Init fabric connection');
  await initConection();

//getAuthToken();

}
//getAuthToken();


router.get('/actualizarconfig', function (req, res, next) {
    var jsonFile;
    const options = {
        hostname: "guardian.odins.es",
        port: 80,
        path: '/backend/v2/entities',
        method: 'GET',
        headers: {
            "x-access-token": brokerToken
        }
    }

    http.get(options, (resp) => {
        let d = '';
        console.log(`statusCode: ${resp.statusCode}`)
        if (resp.statusCode === 401) { // bad token
            //getAuthToken(getEntidades);
        }

        resp.on('data', (chunk) => {
            d += chunk;
        });

        resp.on('end', () => { //
            jsonObject = JSON.parse(d); // jsonobject es un array de entidades
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            lasttimestamp = today.toISOString(); // "2020-06-13T18:30:00.000Z"
            entities = [];
            for (var i = 0; i < jsonObject.length; i++) {
                entityid = jsonObject[i].id;
                attributes = [];
                // nos quedamos con cada atributo que contenga input (sensor)
                for (var attributename in jsonObject[i]) {
                    if (attributename.includes("Input")) {// es un sensor
                        attributeJson = {
                            id: attributename, description: "",
                            lasttimestamp: null
                        }//jsonObject[i][attributename]['metadata']['timestamp']['value']}
                        attributes.push(attributeJson);
                    }
                }
                entity = {"id": entityid, "attributes": attributes}
                entities.push(entity);
            }
            jsonFile = {"lasttimestamp": lasttimestamp, "entities": entities}
            // publicarlo en el ledger como config.json
            fabconnection.invokeChaincode("publicarconfig", [JSON.stringify(jsonFile)], {}).then(queryChaincodeResponse => {
                res.status(200).send(queryChaincodeResponse.invokeResult);
            }).catch(error => {
                console.log(error);
                res.status(404).send(error);
            });

    resp.on('end', () => { //
      jsonObject = JSON.parse(d); // jsonobject es un array de entidades
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      lasttimestamp = today.toISOString(); // "2020-06-13T18:30:00.000Z"
      entities = [];
      for (var i = 0; i < jsonObject.length; i++) {
        entityid = jsonObject[i].id;
        attributes = [];
        // nos quedamos con cada atributo que contenga input (sensor)
        timestampForConfig = new Date(Date.now());
        timestampForConfig.setMonth(8)
        timestampForConfig.setDate(20);
        timestampForConfig.setHours(0, 0, 0, 0);
        for (var attributename in jsonObject[i]) {
          if (attributename.includes("Input")) {// es un sensor
            attributeJson = {
              id: attributename, description: "",
              lasttimestamp: timestampForConfig.toISOString()
            }//jsonObject[i][attributename]['metadata']['timestamp']['value']}
            attributes.push(attributeJson);
          }
        }
        entity = { "id": entityid, "attributes": attributes }
        entities.push(entity);
      }
      jsonFile = { "lasttimestamp": lasttimestamp, "entities": entities }
      // publicarlo en el ledger como config.json
      fabconnection.invokeChaincode("publicarconfig", [JSON.stringify(jsonFile)], {}).then(queryChaincodeResponse => {
        res.status(200).send(queryChaincodeResponse.invokeResult);
      }).catch(error => {
        console.log(error);
        res.status(404).send(error);
      });

      /*newArray.forEach(function(table) {
          var tableName = table.name;
          console.log(tableName);
      });*/
    });
    resp.on('error', (err) => {
      console.log("Errrrrrrrror: " + err);
    });

    })

});

router.get('/iniciar', function (req, res, next) {
  //FUNCIONA cron.schedule('0 * * * *', () => { // run every hour 0 * * * *
    console.log("CRON CALL")

    // get config del ledger 
    fabconnection.queryChaincode("getconfig", ["config.json"], {}).then(queryChaincodeResponse => {
      let today = new Date(Date.now());
      today.setHours(today.getHours() - 1); // desde hace una hora por si cron no se ejecuta en punto.
      today.setHours(today.getHours(), 0, 0, 0);
      console.log('today should be 1 hour more each time: ' + today.toISOString());

      //res.status(200).send(queryChaincodeResponse.invokeResult);
      jsonObject = JSON.parse(JSON.stringify(queryChaincodeResponse));
      jsonObject = JSON.parse(jsonObject.queryResult);
      element = jsonObject.entities;
      for (let j = 0; j < element.length; j++) { // TODO: actualizar los timestamps de cada atributo en el smartcontract
        attributes = element[j].attributes;
        console.log('attributes: ' + attributes.length)
        for (let i = 0; i < attributes.length; i++) {
          let lastts = attributes[i].lasttimestamp;
          console.log('lasttimestamp: ' + attributes[i].lasttimestamp)
          bucleHastaHoy(attributes[i], element[j].id, res, today, new Date(Date.parse(lastts)));
        }
      }
      // recorrer historicos // eliminar duplicados

      // publicar uno a uno



    });
  });
// FUNCIONA });
function bucleHastaHoy(attribute, entityid, res, today, lastts) {
  //console.log("bucleHastaHoy")
  comparer = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), 0, 0, 0);
  let from = new Date(lastts);
  const doloop = async () => {
    let jsonwithvalues
    try {
      do {
        to = new Date(from);
        to.setHours(to.getHours() + 1);
        timestampfrom = from.toISOString();
        timestampto = to.toISOString();
        path = '/backend/STH/v1/contextEntities/type/Device/id/' + entityid + '/attributes/' + attribute.id + "?hLimit=3600&hOffset=0&dateFrom=" + timestampfrom + "&dateTo=" + timestampto;
        //console.log(path);
        // construimos el GET HISTORICO http://guardian.odins.es/backend/STH/v1/contextEntities/type/Device/id/IoTConnector:00027/attributes/digitalInput_614cc3e98562c007eaf16ca9?hLimit=3&hOffset=0

        const config = {
          method: 'get',
          url: 'http://guardian.odins.es' + path,
          headers: {
            "x-access-token": brokerToken
          }
        }

        //console.log('before axios get');
        let res = await axios(config)
        //console.log(CircularJSON.stringify(res.data)+ " - " + timestampto);
        element = res.data.contextResponses[0].contextElement;
        let elementid = element.id;
        let attributeName = element.attributes[0].name;
        let values = element.attributes[0].values;
        if (values.length > 0) {
          console.log('RESPUESTA: ' + JSON.stringify(element.attributes[0]) + " - " + timestampto);
        }

        from.setHours(from.getHours() + 1)
      } while (comparer.getTime() > to.getTime())
      console.log('bucle terminado')

    } catch (err) {
      // Handle Error Here
      console.error(err);
    }
  };
  doloop();
  //res.status(200).send('iniciated');
}

function getEntidades() {
    var jsonFile;
    const options = {
        hostname: "guardian.odins.es",
        port: 80,
        path: '/backend/v2/entities',
        method: 'GET',
        headers: {
            "x-access-token": brokerToken
        }
    }

    http.get(options, (resp) => {
        let d = '';
        console.log(`statusCode: ${resp.statusCode}`)
        if (resp.statusCode == 401) { // bad token
            //getAuthToken(getEntidades);
        }

        resp.on('data', (chunk) => {
            d += chunk;
        });

        resp.on('end', () => { //escribir en fichero
            jsonObject = JSON.parse(d); // jsonobject es un array de entidades
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            lasttimestamp = today.toISOString(); // "2020-06-13T18:30:00.000Z"
            entities = [];
            for (var i = 0; i < jsonObject.length; i++) {
                entityid = jsonObject[i].id;
                attributes = [];
                // nos quedamos con cada atributo que contenga input (sensor)
                for (var attributename in jsonObject[i]) {
                    if (attributename.includes("Input")) {// es un sensor
                        attributeJson = {
                            id: attributename, description: "",
                            lasttimestamp: jsonObject[i][attributename]['metadata']['timestamp']['value']
                        }
                        attributes.push(attributeJson);
                    }
                }
                entity = {"id": entityid, "attributes": attributes}
                entities.push(entity);

            }
            jsonFile = {"lasttimestamp": lasttimestamp, "entities": entities}

            // ahora quiero recorrer json file para pedir historicos
            entities = jsonFile.entities;
            for (var i = 0; i < entities.length; i++) {
                entity = entities[i];
                attributes = entity.attributes;
                for (var j = 0; j < attributes.length; j++) {
                    attribute = attributes[j];
                    path = '/backend/STH/v1/contextEntities/type/Device/id/' + entity.id + '/attributes/' + attribute.id + "?hLimit=99999&hOffset=0";
                    // construimos el GET HISTORICO http://guardian.odins.es/backend/STH/v1/contextEntities/type/Device/id/IoTConnector:00027/attributes/digitalInput_614cc3e98562c007eaf16ca9?hLimit=3&hOffset=0
                    var options = {
                        host: "guardian.odins.es",
                        port: 80,
                        path: path,
                        method: 'GET', // POST // CREACION DE TOKEN
                        headers: {
                            "x-access-token": brokerToken
                        }
                    }
                    http.get(options, (resp) => {
                        let d = '';
                        console.log(`statusCode: ${resp.statusCode}`)
                        resp.on('data', (chunk) => {
                            d += chunk;
                        });

                        resp.on('end', () => {
                            jsonObject = JSON.parse(d); // jsonobject es un array de entidades
                            console.log(d);
                        });
                        resp.on('error', (err) => {
                            console.log("Errrrrrrrror: " + err);
                        });

                    })

                }

            }

            writeFile(JSON.stringify(jsonFile));
            /*newArray.forEach(function(table) {
                var tableName = table.name;
                console.log(tableName);
            });*/
        });
        resp.on('error', (err) => {
            console.log("Errrrrrrrror: " + err);
        });

    })

}


function getAuthToken() {
    jsonbody = {"login": brokerUser, "password": brokerpass}
    var options = {
        host: "guardian.odins.es",
        port: 80,
        path: '/backend/authtoken',
        method: 'POST', // POST // CREACION DE TOKEN
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(jsonbody).length
        }
    }

    req = http.request(options, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received.
        resp.on('end', () => {
            console.log(data);
            brokerToken = JSON.parse(data).access_token;
            console.log(brokerToken);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    })
    console.log("JSON?: " + jsonbody)
    req.write(JSON.stringify(jsonbody));
    req.end()
}


function writeFile(content) {
    fs.writeFile('/tmp/config.json', content, err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
    })
}


module.exports = router;
/*
var options = {
    host :  'graph.facebook.com',
    port : 80,
    path : '/debug_token?input_token=' + userAccessToken + '&access_token=' + appAccessToken,
    method : 'GET',
    headers: {
        "x-acces-token": brokerToken
    }
}*/

var express = require('express');
var fs = require('fs');
var router = express.Router();
const { default: fabricNetworkSimple } = require('fabric-network-simple');

const conf = fabricNetworkSimple.config = {
  channelName: "mychannel",
  contractName: "GuardianSC",
  connectionProfile: {
    name: "umu.fabric",
    version: "1.0.0",
    client: {
      organization: "Org1",
      connection: {
        timeout: {
          peer: {
            endorser: 3000
          }
        }
      }
    },
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
};
asyncCall();
var fabconnection;

function initConection() {
  return new Promise(resolve => {
    fabconnection = new fabricNetworkSimple(conf);
    fabconnection.initGateway(conf);
  });
}
  
async function asyncCall() {
  console.log('Init fabric connection');
  await initConection();
}

router.get('/', function(req, res, next) {
    res.status(200).send("This is the ledger endpoint POST \n Endpoints: \n pushdata \n pulldata");
});

router.post('/pushdata', function(req, res, next) {
  var key = req.body.key;
  var data = req.body.data;
  console.log("key: "+key);
  console.log("data: "+data);
  fabconnection.invokeChaincode("pushData", [key,data], {}).then(queryChaincodeResponse => {
    res.status(200).send(queryChaincodeResponse.invokeResult);
  }).catch ( error => {
    console.log(error);
    res.status(404).send(error);
  });
});

router.post('/pulldata/', function(req, res, next) {
  var query = req.body.query;
  console.log(query);
  //fabconnection.invokeChaincode('addservice', [JSON.stringify(servicedid), domain, JSON.stringify(predicates), status], {})
  fabconnection.queryChaincode('pullData',[query],{}).then(queryChaincodeResponse => {
    console.log('result: '+ queryChaincodeResponse)
    res.status(200).send(queryChaincodeResponse)//JSON.parse(queryChaincodeResponse.queryResult[0]));
  }).catch ( error => {
    console.log(error);
    res.status(404).send(error);
  });
});

router.get('/gethistoricos', function(req, res, next) {
  // TODO Antes de nada comprobar que no se supera el tiempo y responder con un error/warning en ese caso.
  let entity = req.query.entity;
  let attribute = req.query.attribute;
  let from= "";
  let to= "";
  if ( typeof req.query.from !== 'undefined' && req.query.from )
  {
    from = req.query.from;
  }
  if ( typeof req.query.to !== 'undefined' && req.query.to )
  {
    to = req.query.to;
  }
  let today = new Date(Date.now());
  let todaystring = today.toISOString();
  let remoteAddress = req.socket.remoteAddress;
  //TODO writeLOG(todaystring, remoteAddress, entity, attribute, from, to);

  fabconnection.queryChaincode("getHistoricos", [entity,attribute,from, to], {}).then(queryChaincodeResponse => {
    res.status(200).send(queryChaincodeResponse.queryResult);
  }).catch ( error => {
    // TODO: No hacer console.log y ya esta, capturar el TIMEOUT si lo hubiera, y en ese caso, opciones:
        // - 1: reintentar con un nuevo fabconnection? dudo que funcione ya lo probé?
        // - 2: comunicar el timeout al usuario y generar un fichero log para un proceso en segundo plano de reinicio del peer
        //   + 2.1: comprobar primero si funciona el nuevo valor de variable de entorno de 29 segundos y
                //   se cierra la conexion correctamente y no es necesario reiniciar el peer
    // TODO: dejar solo el index de todos los atributos en el smartcontract para ver si mejoran los tiempos.
    console.log(error);
    res.status(404).send(error);
  });
});

function writeLOG(todaystring, remoteAddress, entity, attribute, from, to) {
  fs.appendFile('/tmp/' + todaystring + '.LOG', remoteAddress + ': 155.54.95.196:3000/gethistoricosTEST?entity=' + entity + '&attribute=' + attribute + 'from=' + from + 'to=' + to, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

router.get('/gethistoricosTEST', async function(req, res, next) {
  // TODO Antes de nada comprobar que no se supera el tiempo y responder con un error/warning en ese caso.

  let entity = req.query.entity;
  let attribute = req.query.attribute;
  let from= "";
  let to= "";
  if ( typeof req.query.from !== 'undefined' && req.query.from )
  {
    from = req.query.from;
  }
  if ( typeof req.query.to !== 'undefined' && req.query.to )
  {
    to = req.query.to;
  }
  let today = new Date(Date.now());
  let todaystring = today.toISOString();
  let remoteAddress = req.socket.remoteAddress;
  writeLOG(todaystring, remoteAddress, entity, attribute, from, to);
  let conn = new fabricNetworkSimple(conf);
  await conn.initGateway(conf);
  conn.queryChaincode("getHistoricosTEST", [entity,attribute,from, to], {}).then(queryChaincodeResponse => {

    let ordered1;
    if (typeof queryChaincodeResponse !== 'undefined') {
      let parse = JSON.parse(queryChaincodeResponse.queryResult);
      console.log(parse.queryResult)
      const ordered = Object.keys(parse.queryResult).sort().reduce(
          (obj, key) => {
            obj[key] = parse.queryResult[key];
            return obj;
          },
          {}
      );
    console.log(JSON.parse(ordered[Object.keys(ordered).sort().pop()])["recvTime"])
      parse["lastDate"] = JSON.parse(ordered[Object.keys(ordered).sort().pop()])["recvTime"];
      parse.queryResult = ordered;

      res.status(200).send(parse);
    } else {
      res.status(404).send("ERROR de TIMEOUT, reiniciando conexion");
    }
  }).catch ( error => {
    // TODO: No hacer console.log y ya esta, capturar el TIMEOUT si lo hubiera, y en ese caso, opciones:
    // - 1: reintentar con un nuevo fabconnection? dudo que funcione ya lo probé?
    // - 2: comunicar el timeout al usuario y generar un fichero log para un proceso en segundo plano de reinicio del peer
    //   + 2.1: comprobar primero si funciona el nuevo valor de variable de entorno de 29 segundos y
    //   se cierra la conexion correctamente y no es necesario reiniciar el peer
    // TODO: dejar solo el index de todos los atributos en el smartcontract para ver si mejoran los tiempos.
    console.log('FABRIC TEST ERROR:-'+error);
    if (error.includes('TIMEOUT')) { // Se ha producido un error de timeout
      // RECREAR LA CONEXION?
      res.status(404).send("ERROR de TIMEOUT, reiniciando conexion");
    }
    else {
      res.status(500).send("ERROR desconocido");
    }

  });
});



module.exports = router;

var express = require('express');
var fs = require('fs');
var router = express.Router();
const {Worker, parentPort} = require('worker_threads');
require("json-circular-stringify");
const workerScriptFilePath = require.resolve('./worker-get-historicos-script.js');
const {default: fabricNetworkSimple} = require('fabric-network-simple');
const {Wallets, X509Identity, GatewayOptions, Gateway} = require("fabric-network");

var conf = fabricNetworkSimple.config = {
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
                url: "grpcs://10.208.211.47:7050",
                tlsCACerts: {
                    path:
                        "/home/debian/ChainREST/test/ordererOrganizations/odins.com/orderers/orderer.odins.com/msp/tlscacerts/tlsca.odins.com-cert.pem",
                },
            }
        },
        peers: {
            "peer0.org1.odins.com": {
                "url": "grpcs://10.208.211.47:7051",
                tlsCACerts: {
                    path:
                        "/home/debian/ChainREST/test/peerOrganizations/org1.odins.com/peers/peer0.org1.odins.com/msp/tlscacerts/tlsca.org1.odins.com-cert.pem",
                },
            },
        },
    },
    certificateAuthorities: {
        "ca.org1.odins.com": {
            "url": "https://10.208.211.47:7054",
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
        mspid: 'Org1MSP', // user
        certificate: '-----BEGIN CERTIFICATE-----\nMIICIzCCAcqgAwIBAgIQOiiS1yOEquA4L3f9PEuViDAKBggqhkjOPQQDAjBvMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEXMBUGA1UEChMOb3JnMS5vZGlucy5jb20xGjAYBgNVBAMTEWNhLm9y\nZzEub2RpbnMuY29tMB4XDTIyMDIxNjEwNTQwMFoXDTMyMDIxNDEwNTQwMFowajEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xDzANBgNVBAsTBmNsaWVudDEdMBsGA1UEAwwUVXNlcjFAb3JnMS5v\nZGlucy5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARbB3Yqc98HYcuqOcoi\nm9vYK2S1uFUqGnOa2DWjJVdfQpWTflms9G+5zAiSauc6llqjZjfnR9njyzOf5f6V\n709Ro00wSzAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADArBgNVHSMEJDAi\ngCDZU9KRdaRULA+m1Icdnvk08XwL0Us+TYEhPv7/zckl7jAKBggqhkjOPQQDAgNH\nADBEAiAgvhVHaDS7qBnicVClnHpmCPXdhUiDGCoQ40793567zgIgF/H0vVvW5TWb\ntGMPzV3JBWc6VtiyjUPauQrnD+Tpe4c=\n-----END CERTIFICATE-----\n',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgM0xqTYqB3/dQ4rjN\npcQpJOrFluX5wxaEHpLe8zRKqjGhRANCAARbB3Yqc98HYcuqOcoim9vYK2S1uFUq\nGnOa2DWjJVdfQpWTflms9G+5zAiSauc6llqjZjfnR9njyzOf5f6V709R\n-----END PRIVATE KEY-----\n',
    },
    settings: {
        enableDiscovery: true,
        asLocalhost: false,
    }
}
var gatewayOptions
var contract;
asyncCall();
var fabconnection;

function initConnection() {
    return new Promise(resolve => {
        fabconnection = new fabricNetworkSimple(conf);
        initGatewayOptions(conf).then(r => {
            gatewayOptions = r;
            initGateway(conf)
        })
    });
}

async function asyncCall() {
    console.log('Init fabric connection');
    await initConnection();
}

router.get('/', function (req, res, next) {
    res.status(200).send("This is the ledger endpoint POST \n Endpoints: \n pushdata \n pulldata \n gethistoricos");
});

router.post('/pushdata', function (req, res, next) {
    var key = req.body.key;
    var data = req.body.data;
    console.log("key: " + key);
    console.log("data: " + data);
    fabconnection.invokeChaincode("pushData", [key, data], {}).then(queryChaincodeResponse => {
        res.status(200).send(queryChaincodeResponse.invokeResult);
    }).catch(error => {
        console.log(error);
        res.status(404).send(error);
    });
});

router.post('/pulldata/', function (req, res, next) {
    var query = req.body.query;
    console.log(query);
    //fabconnection.invokeChaincode('addservice', [JSON.stringify(servicedid), domain, JSON.stringify(predicates), status], {})
    fabconnection.queryChaincode('pullData', [query], {}).then(queryChaincodeResponse => {
        console.log('result: ' + queryChaincodeResponse)
        res.status(200).send(queryChaincodeResponse)//JSON.parse(queryChaincodeResponse.queryResult[0]));
    }).catch(error => {
        console.log(error);
        res.status(404).send(error);
    });
});

router.get('/gethistoricos', async function (req, res, next) {

    let entity = req.query.entity;
    let attribute = req.query.attribute;
    let from = "";
    let to = "";
    if (typeof req.query.from !== 'undefined' && req.query.from) {
        from = req.query.from;
    }
    if (typeof req.query.to !== 'undefined' && req.query.to) {
        to = req.query.to;
    }
    let today = new Date(Date.now());
    let todaystring = today.toISOString();
    let remoteAddress = req.socket.remoteAddress;
    //TODO writeLOG(todaystring, remoteAddress, entity, attribute, from, to);

    fabconnection.queryChaincode("getHistoricos", [entity, attribute, from, to], {}).then(queryChaincodeResponse => {
        res.status(200).send(queryChaincodeResponse.queryResult);
    }).catch(error => {
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

router.get('/gethistoricosTEST', async function (req, res, next) {
    console.log("gethistoricosTEST: " + new Date(Date.now()).toISOString());
    const worker = new Worker(workerScriptFilePath);
    worker.on('message', (queryChaincodeResponseString) => {
        let queryChaincodeResponse = JSON.parse(queryChaincodeResponseString);
        if (typeof queryChaincodeResponse !== 'undefined')
            res.status(200).send(queryChaincodeResponse.queryResult);
        else {
            res.status(404).send("ERROR de TIMEOUT, reiniciando conexion");
        }
    });
    worker.on('error', (error) => {
        console.log('FABRIC TEST ERROR:-' + error);
        if (error.toString().includes('TIMEOUT')) { // Se ha producido un error de timeout
            // RECREAR LA CONEXION?
            res.status(404).send("ERROR de TIMEOUT, reiniciando conexion");
        } else {
            res.status(500).send("ERROR desconocido");
        }

    });
    worker.on('exit', (code) => {
        if (code !== 0)
            throw new Error(`Worker stopped with exit code ${code}`);
    });

    worker.postMessage(JSON.stringify(req));




});

router.get('/test', async function (req, res, next) {
    console.log("GETTEST")
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    new Promise(async resolve => {
        await delay(10000);
        res.status(200).send("respuesta");
    })


});

async function initGatewayOptions(config) {
    const wallet = await Wallets.newInMemoryWallet();
    const x509Identity = {
        credentials: {
            certificate: config.identity.certificate,
            privateKey: config.identity.privateKey,
        },
        mspId: config.identity.mspid,
        type: "X.509",
    };
    await wallet.put(config.identity.mspid, x509Identity);
    const gatewayOptions = {
        identity: config.identity.mspid,
        wallet,
        discovery: {
            enabled: config.settings.enableDiscovery,
            asLocalhost: config.settings.asLocalhost,
        },
    };
    return gatewayOptions;
}

async function initGateway(config) {
    try {
        //gatewayOptions
        const gateway = new Gateway();
        console.log("GATEWAYOPTIONS: " + gatewayOptions)
        const currentDate = new Date();
        const timestamp = currentDate.getTime();
        config.connectionProfile['name'] = 'umu.fabric.' + timestamp;
        config.connectionProfile['version'] = '1.0.0' + timestamp;
        await gateway.connect(config.connectionProfile, gatewayOptions);
        const network = await gateway.getNetwork(config.channelName);
        contract = network.getContract(config.contractName);
    } catch (error) {
        console.log("Hyperledger Error: " + error.toString())
        throw error;
    } finally {
    }
}

function queryChaincode(transaction, args) {
    try {
        const queryResult = contract.submitTransaction(
            transaction,
            ...args
        );
        var result = "[]";
        if (queryResult) {
            result = queryResult.toString();
        }
        return queryResult;
    } catch (error) {
        console.error('Failed to query transaction: "${transaction}"' +
            ' with arguments: "${args}", error: "${error}"' + error.toString());
    }
}

module.exports = router;

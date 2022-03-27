const {json} = require('express');
var express = require('express');
var router = express.Router();
var cron = require('node-cron');
const http = require('http');
const fs = require('fs')
const axios = require('axios');
const {default: fabricNetworkSimple} = require('fabric-network-simple');
var _ = require('lodash');
const https = require("https");
const {Worker, parentPort} = require('worker_threads');
const {Wallets, Gateway} = require("fabric-network");
const workerScriptFilePath = require.resolve('./worker-publicar-script.js');
const conf = {
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
};
let gatewayOptions;
let contract;

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});
const brokerURL = "http://155.54.95.124/backend/";
const brokerUser = "guardian@odins.es";
const brokerpass = "Ygovy8NzS8Jedun8T55wBRAjwXL/ZTFkpPHEhQ8xPpA=";
let brokerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNGM5N2EwODU2MmMwNTRmOWYxNmM4ZCIsImlhdCI6MTYzNjEwMjgwMiwiZXhwIjoxNjM2MTg5MjAyfQ.xeEjU8YzeIZKgIHlI3JD81ripqauMDD5stJYlkjswCY";


asyncCall2().then();

async function publicarHistoricos(jsonwithvalues, entityid, attributeid, todaytoISOString) {
    gatewayOptions = await initGatewayOptions(conf);
    await initGateway(conf);
    invokeChaincode('publicarArrayDeHistoricos', [jsonwithvalues, entityid, attributeid, todaytoISOString], {}).then(queryChaincodeResponse => {
        const {parentPort} = require('worker_threads');
        if (queryChaincodeResponse !== undefined && queryChaincodeResponse !== "undefined"){
            console.error("queryChaincodeResponse not undefined: "+ queryChaincodeResponse)
        }

    }).catch(error => {
        console.log(error.toString())
    });

}

async function asyncCall2() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(3000);
    console.log("Init IOT connection");
    const doasync = async () => {
        await getAuthToken();
        cron.schedule('00 11,23 * * *', () => { // run every hour 0 * * * *  // 00 11,23 * * * dos veces al dia
            console.log("CRON authotoken dos veces al dia");
            getAuthToken();
        });
        await bucleDeHistoricos();
        //mock every minute
        cron.schedule('15 * * * *', () => { // run every hour at min 15 - 15 * * * *  // 00 11,23 * * * dos veces al dia
            console.log("CRON HISTORICOS 1 hora");
            bucleDeHistoricos();
        });
    }
    await doasync();
}

async function bucleDeHistoricos() {
    // get config del ledger
    gatewayOptions = await initGatewayOptions(conf);

    await initGateway(conf);
    queryChaincode("getconfig", [], {}).then(execution);

    async function execution(queryChaincodeResponse) {
        let today = new Date(Date.now());

        today.setHours(today.getHours() - 1); // desde hace una hora por si cron no se ejecuta en punto.
        today.setHours(today.getHours(), 0, 0, 0);
        console.log('today should be 1 hour more each time: ' + today.toISOString());

        //res.status(200).send(queryChaincodeResponse.invokeResult);
        console.log(queryChaincodeResponse.toString());
        let jsonObject = JSON.parse(queryChaincodeResponse.toString())
        //jsonObject = JSON.parse(jsonObject.queryResult);
        let element = jsonObject.entities;
        let attributes;
        let before = new Date(Date.now());
        for (let i = 0; i < element.length; i++) {
            attributes = element[i].attributes;
            console.log('attributes: ' + attributes.length)
            for (let j = 0; j < attributes.length; j++) {
                let lastts = attributes[i].lasttimestamp;
                console.log('lasttimestamp: ' + attributes[j].lasttimestamp)
                console.log("current: entity i: " + i + " + j: " + j + "; " + element.length + " + " + attributes.length);
                await bucleHastaHoy(attributes[j], element[i].id, today, new Date(Date.parse(lastts)));
            }
        }
        let after = new Date(Date.now());
        console.log("duration: " + before.toISOString() + " - " + after.toISOString())
    }
}

async function bucleHastaHoy(attribute, entityid, today, lastts) {
    //console.log("bucleHastaHoy")
    comparer = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), 0, 0, 0);
    let from = new Date(lastts);

    let timestampfrom;
    let timestampto;
    let to;
    let path;
    let jsonwithvalues = [];
    try {
        do {
            to = new Date(from);
            to.setHours(to.getHours() + 1);
            timestampfrom = from.toISOString();
            timestampto = to.toISOString();
            path = '/backend/STH/v1/contextEntities/type/Device/id/' + entityid + '/attributes/' + attribute.id + "?hLimit=3600&hOffset=0&dateFrom=" + timestampfrom + "&dateTo=" + timestampto;
            //console.log(path);
            // construimos el GET HISTORICO http://155.54.95.124/backend/STH/v1/contextEntities/type/Device/id/IoTConnector:00027/attributes/digitalInput_614cc3e98562c007eaf16ca9?hLimit=3&hOffset=0

            const config = {
                headers: {
                    "x-access-token": brokerToken
                }
            }

            //console.log('before axios get');
            let res = await instance.get('https://155.54.95.124' + path,
                config);
            element = res.data.contextResponses[0].contextElement;
            let elementid = element.id;
            let attributeName = element.attributes[0].name;
            let values = element.attributes[0].values;
            for (let i in values) {
                let recvTime = values[i].recvTime;
                let attrValue = values[i].attrValue;
                jsontopush = {
                    "entityid": elementid,
                    "attrName": attributeName,
                    "attrvalue": attrValue,
                    "recvTime": recvTime
                }
                jsonwithvalues.push(jsontopush);
            }

            from.setHours(from.getHours() + 1)
        } while (comparer.getTime() > to.getTime())
        console.log('bucle terminado: ' + jsonwithvalues.length);
        //writeFile(JSON.stringify(jsonwithvalues), attribute.id + '.json');
        /*       if (jsonwithvalues.length > 0) {
                   arraywithvaluesclean = arrUnique(jsonwithvalues, lastts, today);
               } else {
                   arraywithvaluesclean = jsonwithvalues;
               }*/
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
    let i = 0
    let numMAX = 70;
    let timest;
    console.log('inicio bucle partición de array para enviar: ' + jsonwithvalues.length);
    do {

        let arraytosend = [];
        for (let j = i * numMAX; (j < jsonwithvalues.length) && (j < ((i + 1) * numMAX)); j++) {
            arraytosend[j - i * numMAX] = jsonwithvalues[j];
        }
        // enviar al blockchain // publicarArrayDeHistoricos(Context ctx, final String arrayString, final String entityID, final String attributeName, final String lasttimestamp){
        let j = i + 1;
        j = j * numMAX;
        if (j > jsonwithvalues.length) { // ultima iteracion
            timest = today;
        } else {
            timest = lastts;
        }
        await publicarHistoricos(JSON.stringify(arraytosend), entityid, attribute.id, timest.toISOString());
        i++;
    } while (i * numMAX < jsonwithvalues.length)
    console.log('Fin de todo');
}

async function getAuthToken() {
    jsonbody = {"login": brokerUser, "password": brokerpass}
    const config = {
        url: 'https://155.54.95.124/backend/authtoken',
        method: 'post', // POST // CREACION DE TOKEN
        /*headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(jsonbody).length
        },*/
        data: {"login": brokerUser, "password": brokerpass},
    }

    const res = await instance.post('https://155.54.95.124/backend/authtoken',
        {"login": brokerUser, "password": brokerpass},
        config);
    brokerToken = res.data.access_token;
    console.log(brokerToken);
}


function writeFile(content, name) {
    fs.writeFile('/tmp/' + name, content, err => {
        if (err) {
            console.error(err)
            return;
        }
        //file written successfully
    })
}

function arrUnique(arr, lastts, today) {
    let endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), 0, 0, 0);
    let startDate = new Date(lastts);
    let aDate = new Date();

    var cleaned = [];
    arr.forEach(function (itm) {
        var unique = true;
        cleaned.forEach(function (itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique) cleaned.push(itm);
    });
    const filteredData = cleaned.filter(function (a) {
        aDate = new Date(a.recvTime);
        return aDate >= startDate && aDate <= endDate;
    });
    return filteredData;
}

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

async function invokeChaincode(transaction, args) {
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

async function queryChaincode(transaction, args) {
    try {
        const queryResult = contract.evaluateTransaction(
            transaction,
            ...args
        );
        let result = "[]";
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


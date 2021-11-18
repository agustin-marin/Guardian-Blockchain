const { json } = require('express');
var express = require('express');
var router = express.Router();
var cron = require('node-cron');
const http = require('http');
const fs = require('fs')
const axios = require('axios');
const { default: fabricNetworkSimple } = require('fabric-network-simple');
var _ = require('lodash');
conf = fabricNetworkSimple.config = {
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
};
async function publicarHistoricos(arraywithvaluesclean,entityid, attributeid, todaytoISOString){

    try {
        const invokeResult =
            await fabconnection.invokeChaincode('publicarArrayDeHistoricos', [arraywithvaluesclean, entityid, attributeid, todaytoISOString], {})
    } catch (e) {
        console.error("ERROR: "+ e);
    }

}

const brokerURL = "http://155.54.95.124/backend/";
const brokerUser = "guardian@odins.es";
const brokerpass = "Ygovy8NzS8Jedun8T55wBRAjwXL/ZTFkpPHEhQ8xPpA=";
let brokerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNGM5N2EwODU2MmMwNTRmOWYxNmM4ZCIsImlhdCI6MTYzNjEwMjgwMiwiZXhwIjoxNjM2MTg5MjAyfQ.xeEjU8YzeIZKgIHlI3JD81ripqauMDD5stJYlkjswCY";
asyncCall();
asyncCall2();
fabconnection;

function initConection() {

    return new Promise(resolve => {
        fabconnection = new fabricNetworkSimple(conf);
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
        cron.schedule('0 * * * *', () => { // run every hour 0 * * * *  // 00 11,23 * * * dos veces al dia
            console.log("CRON HISTORICOS 1 hora");
            bucleDeHistoricos();
        });
    }
    await doasync();
}
async function asyncCall() {

    console.log('Init fabric connection');
    await initConection();


}
async function bucleDeHistoricos() {
    // get config del ledger
    const queryChaincodeResponse = await fabconnection.queryChaincode("getconfig", [], {});
    let today = new Date(Date.now());

    today.setHours(today.getHours() - 1); // desde hace una hora por si cron no se ejecuta en punto.
    today.setHours(today.getHours(), 0, 0, 0);
    console.log('today should be 1 hour more each time: ' + today.toISOString());

    //res.status(200).send(queryChaincodeResponse.invokeResult);
    let jsonObject = JSON.parse(JSON.stringify(queryChaincodeResponse));
    jsonObject = JSON.parse(jsonObject.queryResult);
    let element = jsonObject.entities;
    let attributes;
    let before = new Date(Date.now());
    for (let j = 0; j < element.length; j++) {
        attributes = element[j].attributes;
        console.log('attributes: ' + attributes.length)
        for (let i = 0; i < attributes.length; i++) {
            let lastts = attributes[i].lasttimestamp;
            console.log('lasttimestamp: ' + attributes[i].lasttimestamp)
            console.log("current: entity i: "+ i  + " + j: " +j + "; " +element.length+" + " + attributes.length);
            await bucleHastaHoy(attributes[i], element[j].id, today, new Date(Date.parse(lastts)));
        }
    }
    let after = new Date(Date.now());
    console.log("duration: " + before.toISOString() + " - " + after.toISOString())
}
async function bucleHastaHoy(attribute, entityid, today, lastts) {
    //console.log("bucleHastaHoy")
    comparer = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), 0, 0, 0);
    let from = new Date(lastts);

        let timestampfrom;
        let timestampto;
        let to;
        let path;
        try {
            let jsonwithvalues = [];
            do {
                to = new Date(from);
                to.setHours(to.getHours() + 1);
                timestampfrom = from.toISOString();
                timestampto = to.toISOString();
                path = '/backend/STH/v1/contextEntities/type/Device/id/' + entityid + '/attributes/' + attribute.id + "?hLimit=3600&hOffset=0&dateFrom=" + timestampfrom + "&dateTo=" + timestampto;
                //console.log(path);
                // construimos el GET HISTORICO http://155.54.95.124/backend/STH/v1/contextEntities/type/Device/id/IoTConnector:00027/attributes/digitalInput_614cc3e98562c007eaf16ca9?hLimit=3&hOffset=0

                const config = {
                    method: 'get',
                    url: 'http://155.54.95.124' + path,
                    headers: {
                        "x-access-token": brokerToken
                    }
                }

                //console.log('before axios get');
                let res = await axios(config)
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
            console.log('bucle terminado');
            writeFile(JSON.stringify(jsonwithvalues), attribute.id + '.json');
            if (jsonwithvalues.length > 0) {
                arraywithvaluesclean = arrUnique(jsonwithvalues, lastts, today );
            } else {
                arraywithvaluesclean = jsonwithvalues;
            }
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
            let i = 0
            do {
                let arraytosend = [];
                for (let j = i*70; (j < arraywithvaluesclean.length) && (j<((i+1)*70)); j++) {
                    arraytosend[j-i*70] = arraywithvaluesclean[j];
                }
                // enviar al blockchain // publicarArrayDeHistoricos(Context ctx, final String arrayString, final String entityID, final String attributeName, final String lasttimestamp){
                await publicarHistoricos(JSON.stringify(arraytosend), entityid, attribute.id, today.toISOString());
                i++;
            } while (i*70 < arraywithvaluesclean.length)


}

async function getAuthToken() {
    jsonbody = { "login": brokerUser, "password": brokerpass }
    const config = {
        url: 'http://155.54.95.124/backend/authtoken',
        method: 'post', // POST // CREACION DE TOKEN
        /*headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(jsonbody).length
        },*/
        data : { "login": brokerUser, "password": brokerpass }
    }
    const res = await axios(config);
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
function arrUnique(arr, lastts, today ) {
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

module.exports = router;


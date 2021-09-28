const { json } = require('express');
var express = require('express');
var router = express.Router();
const http = require('http');


var brokerURL = "http://guardian.odins.es/backend/";
var brokerUser= "guardian@odins.es";
var brokerpass= "Ygovy8NzS8Jedun8T55wBRAjwXL/ZTFkpPHEhQ8xPpA=";
var brokerToken= "";

let subscriptions;
// IF 401
/* GET home page.  */
router.get('/suscribir', function(req, res, next) {
    getAuthToken();
    ///entidades = getEntidades();
    //suscribirseATodosLosSensores();
    
  });

router.get('/eliminar' ,  function(req, res, next) {

  });
function getEntidades() {
const options = {
  hostname:  "guardian.odins.es",
  port: 80,
  path: '/backend/v2/entities',
  method: 'GET',
  headers: {
    "x-access-token": brokerToken
}
}

http.get(options, (resp) => {
    console.log(`statusCode: ${resp.statusCode}`)
    if (resp.statusCode==401){ // bad token
    //getAuthToken();
    //return getEntidades();
}

  resp.on('data', d => {
    //process.stdout.write(d) 
    var newArray = d.filter(function (el) {
        return el.type == "Device";
      });
    newArray.forEach(function(table) {
        var tableName = table.name;
        console.log(tableName);
    });
  });
  resp.on('error', (err) => {
      console.log("Errrrrrrrror: " + err);
  });

})

}







  function suscribirseATodosLosSensores() {
    // pedir todas las entidades
    var options = {
        host :  "guardian.odins.es",
        port : 80,
        path : '/backend/v2/subscriptions',
        method : 'POST', // POST // CREACION DE SUSCRIPCION
        headers: {
            "x-access-token": brokerToken
        }
    }
    // get entities para luego suscribirte a esas entities
req = http.request(brokerURL, (resp) => {
    let data = '';
  
    if (resp.statusCode == 401) { // INVALID TOKEN
        getAuthToken();
        // reDO /subscribe
    }
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. 
    resp.on('end', () => {
    //data.includes("not valid") // invalid token
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

  }
function getAuthToken() {
    jsonbody ={ "login": brokerUser, "password":brokerpass}
    var options = {
        host :  "guardian.odins.es",
        port : 80,
        path : '/backend/authtoken',
        method : 'POST', // POST // CREACION DE TOKEN
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
            brokerToken=JSON.parse(data).access_token;
            console.log(brokerToken);
            getEntidades();
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      })
      console.log("JSON?: "+ jsonbody)
      req.write(JSON.stringify(jsonbody));
      req.end()
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
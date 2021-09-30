const { json } = require('express');
var express = require('express');
var router = express.Router();
const http = require('http');
const fs = require('fs')

var brokerURL = "http://guardian.odins.es/backend/";
var brokerUser= "guardian@odins.es";
var brokerpass= "Ygovy8NzS8Jedun8T55wBRAjwXL/ZTFkpPHEhQ8xPpA=";
var brokerToken= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNGM5N2EwODU2MmMwNTRmOWYxNmM4ZCIsImlhdCI6MTYzMjk5ODQ5NiwiZXhwIjoxNjMzMDg0ODk2fQ.3YjFD-ynx1sOsWHnkNQyVnY7brVS3ak9LdcNANVs9PI";
var entidades;

//getAuthToken();




let subscriptions;
// IF 401
/* GET home page.  */
router.get('/suscribir', function(req, res, next) {
    getEntidades();
    //suscribirseATodosLosSensores();
    
  });

router.get('/eliminar' ,  function(req, res, next) {

  });
function getEntidades() {
  var jsonFile;
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
  let d = '';
    console.log(`statusCode: ${resp.statusCode}`)
    if (resp.statusCode==401){ // bad token
    //getAuthToken(getEntidades);
}

resp.on('data', (chunk) => {
  d += chunk;
});

  resp.on('end', () => { //escribir en fichero
    jsonObject = JSON.parse(d); // jsonobject es un array de entidades
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    lasttimestamp=today.toISOString(); // "2020-06-13T18:30:00.000Z"
    entities = [];
    for (var i=0; i< jsonObject.length; i++){
    entityid = jsonObject[i].id;
    attributes = [];
      // nos quedamos con cada atributo que contenga input (sensor)
      for(var attributename in jsonObject[i]){
        if (attributename.includes("Input")){// es un sensor
          attributeJson = {id: attributename, description:"", 
          lasttimestamp:jsonObject[i][attributename]['metadata']['timestamp']['value']}
          attributes.push(attributeJson);
        } 
    }
    entity = {"id":entityid, "attributes":attributes}
    entities.push(entity);

    }
    jsonFile = {"lasttimestamp":lasttimestamp, "entities": entities}


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
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      })
      console.log("JSON?: "+ jsonbody)
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
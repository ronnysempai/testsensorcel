"use strict";

var express = require("express");
var http = require('http');
var bodyParser = require('body-parser');
var PubNub = require('pubnub');
var options={};
var fs=require("fs");
var puerto=5400;
var variable=30;
var izquierdaDerecha=0;
var frenteParteTrasera=0;
var direccion=0;
var porcentajeBateria=0;
var datosCelular={izquierdaDerecha:0,frenteParteTrasera:0,direccion:0,porcentajeBateria:0};
function iniciaPubNub(){
	try {
			var pubnub = new PubNub({
			    subscribeKey: "sub-c-d01752b4-668d-11e4-984a-02ee2ddab7fe",
			    publishKey: "pub-c-f68a8b50-f1d0-44c8-8e68-ba478107e1b2",
			    ssl: true
			});
			
			pubnub.addListener({
			    status: function(statusEvent) {
			        if (statusEvent.category === "PNConnectedCategory") {
			            var payload = {
			                my: 'payload'
			            };
			            pubnub.publish(
			                { 
			                    message: payload
			                }, 
			                function (status) {
			                    // handle publish response
			                }
			            );
			        }
			    },
			    message: function(message) {
			    	console.dir(message);
			    	var canal=message.subscribedChannel;
			    	switch(canal){
			    		case  'canalOrientacion':
			    			datosCelular.izquierdaDerecha=message.message.incID;
			    			datosCelular.frenteParteTrasera=message.message.incFT;
			    			datosCelular.direccion=message.message.dir;
			    			break;
			    		case 'canalBateria':
			    			datosCelular.porcentajeBateria=message.message.porcentajeBateria;
			    		break;
			    		case 'canalAceleracion':
			    			datosCelular.aceleracion=message.message.aceleracion;
			    			datosCelular.aceleracionConGravedad=message.message.aceleracionConGravedad;
			    		break;
			    		case 'canalGPS':
			    			datosCelular.latitud=message.message.latitud;
			    			datosCelular.longitud=message.message.longitud;
			    		break;

			    	}
			    
			        // handle message
			    },
			    presence: function(presenceEvent) {
			        // handle presence
			    }
			});
			pubnub.subscribe({
			    channels: ['canalOrientacion','canalBateria','canalAceleracion','canalGPS']
			});
			
			
		} catch (e) {
			console.log('Error '+e);
		}
}

function requestData( handler){
	var factor=5;
	if (variable>200) variable=10; 
	variable=variable+ Math.trunc(factor*Math.random());
	handler.send({ok:true,izquierdaDerecha:izquierdaDerecha,frenteParteTrasera:frenteParteTrasera,direccion:direccion});
	

}
iniciaPubNub();

var express = require('express');
var app = express();
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;


// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {

    // ejs render automatically looks in the views folder
    res.send(datosCelular);
});

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
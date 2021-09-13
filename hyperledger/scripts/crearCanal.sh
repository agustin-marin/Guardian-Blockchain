#!/bin/bash
clear
ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
IDCLI=$(docker ps -f "name=clipeer" -q)
docker exec -it $IDCLI peer channel create -o orderer.example.com:7050 -c mychannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx --tls --cafile $ORDERER_CA
sleep 5
docker exec -it $IDCLI peer channel join -b ./mychannel.block --tls --cafile $ORDERER_CA
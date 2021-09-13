
## Generar cryptografia
./cryptogen generate --config=./PeerOrgs1.yml --output="crypto-config"
./cryptogen generate --config=./orderer.yaml --output="crypto-config"

## Generar archivos de bloque
./configtxgen -profile  OneOrgOrdererGenesis  -outputBlock ./channel-artifacts/genesis.block -channelID orderer-system-channel
./configtxgen -outputCreateChannelTx ./channel-artifacts/mychannel.tx -profile OneOrgChannel -channelID mychannel

./configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchor.tx -channelID channel -asOrg Org1MSP

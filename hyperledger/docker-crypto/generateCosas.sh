
## Generar cryptografia
./cryptogen generate --config=./PeerOrgs2.yml --output="crypto-config"
./cryptogen generate --config=./PeerOrgs1.yml --output="crypto-config"
./cryptogen generate --config=./orderer.yaml --output="crypto-config"

## Generar archivos de bloque
./configtxgen -profile  TwoOrgsOrdererGenesis  -outputBlock ./channel-artifacts/genesis.block -channelID orderer-system-channel
./configtxgen -outputCreateChannelTx ./channel-artifacts/mychannel.tx -profile TwoOrgsChannel -channelID mychannel
./configtxgen -outputCreateChannelTx ./channel-artifacts/channel.tx -profile OneOrgChannel -channelID channel

./configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchor.tx -channelID channel -asOrg Org1MSP
./configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
./configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSPmimurciapdp_authcomponents_1

import {
  Wallets,
  X509Identity,
  Gateway,
  GatewayOptions,
  TransientMap,
  Contract,
} from "fabric-network";

export default class fabricNetworkSimple {
  constructor(config) {
    this.initGateway(config);
  }
  async initGateway(config) {
    try {
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
      const gateway = new Gateway();
      await gateway.connect(config.connectionProfile, gatewayOptions);
      const network = await gateway.getNetwork(config.channelName);
      this.contract = network.getContract(config.contractName);
    } catch (error) {
      throw error;
    } finally {
    }
  }
  async queryChaincode(transaction, args) {
    try {
      const queryResult = await this.contract.evaluateTransaction(
        transaction,
        ...args
      );
      var result = "[]";
      if (queryResult) {
        result = queryResult.toString();
      }
      return { queryResult: result };
    } catch (error) {
      console.error(
        `Failed to query transaction: "${transaction}" with arguments: "${args}", error: "${error}"`
      );
    }
  }

  async invokeChaincode(
    transaction,
    args,
    transient
  ) {
    try {
      const invokeResult = await this.contract
        .createTransaction(transaction)
        .setTransient(transient)
        .submit(...args);
      var result = "[]";
      if (invokeResult) {
        result = invokeResult.toString();
      }
      return { invokeResult: result };
    } catch (error) {
      console.error(
        `Failed to invoke transaction: "${transaction}" with arguments: "${args}", transient: "${transient}",  error: "${error}"`
      );
    }
  }
}
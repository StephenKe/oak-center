import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';
import { WsProvider, ApiPromise } from '@polkadot/api';

import { oakConstants } from 'oak-js-library';
class PolkadotUtil {
  constructor() {
    this.allAccounts = null;
    this.initialized = false;
  }

  initialize = async () => {
    try {
      await web3Enable('OakCenter');
      this.allAccounts = await web3Accounts({ accountType: 'sr25519', ss58Format: 51 });
      const provider = new WsProvider(oakConstants.OakChainWebsockets.STUR);
      this.api = await ApiPromise.create({ provider });
      this.initialized = true;
    } catch (error) {
      console.log('PolkadotUtil.initialize ERROR: ', error);
    }
  };

  getAccounts = () => this.allAccounts;

  getSigner = async (address) => {
    const { signer } = await web3FromAddress(address);
    return signer;
  };

  sign = async (message, address) => {
    const injector = await web3FromAddress(address);
    const signRaw = injector?.signer?.signRaw;
    const { signature } = await signRaw({ address, data: stringToHex(message), type: 'bytes' });
    return signature;
  };

  subscribeBalance = async (address, onBalanceUpdated) => {
    const {
      data: { free: currentFree },
    } = await this.api.query.system.account(address);
    onBalanceUpdated(currentFree.toNumber());
    const unsubscribe = this.api.query.system.account(address, ({ data: { free: currentFree } }) =>
      onBalanceUpdated(currentFree.toNumber()),
    );
    return unsubscribe;
  };
}

export default new PolkadotUtil();

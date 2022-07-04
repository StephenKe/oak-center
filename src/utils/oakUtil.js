import { Scheduler, Recurrer, oakConstants } from 'oak-js-library';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { v4 } from 'uuid';

import api from './api';
import polkadotUtil from './PolkadotUtil';

const oakUtil = {
  recurrer: new Recurrer(),
  scheduler: new Scheduler(oakConstants.OakChains.STUR),
  getAccounts: function () {
    return this.allAccounts;
  },
  createTransferTask: async function ({ timestamps, receivingAddress, amount }) {
    const { address } = api.user.getCurrentUser();
    const providedID = v4();
    const signer = await polkadotUtil.getSigner(address);
    const extrinsicHex = await this.scheduler.buildScheduleNativeTransferExtrinsic(
      address,
      providedID,
      timestamps,
      receivingAddress,
      amount,
      signer,
    );
    return extrinsicHex;
  },
  createNotifyTask: async function ({ timestamps, message }) {
    const { address } = api.user.getCurrentUser();
    const providedID = v4();
    const signer = await polkadotUtil.getSigner(address);
    const extrinsicHex = await this.scheduler.buildScheduleNotifyExtrinsic(
      address,
      providedID,
      timestamps,
      message,
      signer,
    );
    return extrinsicHex;
  },
  createCancelTask: async function ({ taskId }) {
    const { address } = api.user.getCurrentUser();
    const providedID = v4();
    const signer = await polkadotUtil.getSigner(address);
    const extrinsicHex = await this.scheduler.buildCancelTaskExtrinsic(address, taskId, signer);
    return extrinsicHex;
  },
  getTaskId: async function ({ providedId }) {
    const { address } = api.user.getCurrentUser();
    const taskId = await this.scheduler.getTaskID(address, providedId);
    return taskId;
  },
};

export default oakUtil;

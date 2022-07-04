import api from './api';
import oakUtil from './oakUtil';

const oakService = {
  getTransferTasks: async function () {
    const tasks = await api.transferTask.list();
    return tasks;
  },
  createTransferTask: async function ({ timestamps, receivingAddress, amount, memo }) {
    try {
      const extrinsicHex = await oakUtil.createTransferTask({
        timestamps,
        receivingAddress,
        amount,
      });
      await api.transferTask.create({ extrinsicHex, memo });
    } catch (error) {
      console.log('error: ', error);
    }
  },
  cancelTransferTask: async function ({ providedId }) {
    try {
      const taskId = await oakUtil.getTaskId({ providedId });
      const extrinsicHex = await oakUtil.createCancelTask({ taskId });
      await api.transferTask.cancel({ providedId, extrinsicHex });
    } catch (error) {
      console.log('error: ', error);
    }
  },
  getNotifyTasks: async function () {
    const tasks = await api.notifyTask.list();
    return tasks;
  },
  createNotifyTask: async function ({ timestamps, message }) {
    const extrinsicHex = await oakUtil.createNotifyTask({ timestamps, message });
    await api.notifyTask.create({ extrinsicHex });
  },
  cancelNotifyTask: async function ({ providedId }) {
    try {
      const taskId = await oakUtil.getTaskId({ providedId });
      const extrinsicHex = await oakUtil.createCancelTask({ taskId });
      await api.notifyTask.cancel({ providedId, extrinsicHex });
    } catch (error) {
      console.log('error: ', error);
    }
  },
};

export default oakService;

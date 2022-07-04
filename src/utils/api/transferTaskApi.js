import fetchUtil from './fetchUtil';
import user from './userApi';

const transferTaskApi = {
  list: async () => {
    const currentUser = user.getCurrentUser();
    const { sessionToken, address } = currentUser;
    const { result: transferTasks } = await fetchUtil.fetch(
      'transfer-task/list',
      { address },
      sessionToken,
    );
    return transferTasks;
  },
  create: async function ({ extrinsicHex, memo }) {
    try {
      const result = await fetchUtil.fetch('transfer-task/create', { extrinsicHex, memo });
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  cancel: async ({ providedId, extrinsicHex }) => {
    try {
      const currentUser = user.getCurrentUser();
      const { sessionToken } = currentUser;
      await fetchUtil.fetch('transfer-task/cancel', { providedId, extrinsicHex }, { sessionToken });
    } catch (error) {
      console.log(error);
    }
  },
};

export default transferTaskApi;

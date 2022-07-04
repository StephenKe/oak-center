import fetchUtil from './fetchUtil';
import user from './userApi';

const notifyTaskApi = {
  list: async () => {
    const currentUser = user.getCurrentUser();
    const { sessionToken, address } = currentUser;
    const { result: notifyTasks } = await fetchUtil.fetch(
      'notify-task/list',
      { address },
      sessionToken,
    );
    return notifyTasks;
  },
  create: async ({ extrinsicHex }) => {
    try {
      const currentUser = user.getCurrentUser();
      const { sessionToken } = currentUser;
      await fetchUtil.fetch('notify-task/create', { extrinsicHex }, { sessionToken });
    } catch (error) {
      console.log(error);
    }
  },
  cancel: async ({ providedId, extrinsicHex }) => {
    try {
      const currentUser = user.getCurrentUser();
      const { sessionToken } = currentUser;
      await fetchUtil.fetch('notify-task/cancel', { providedId, extrinsicHex }, { sessionToken });
    } catch (error) {
      console.log(error);
    }
  },
};

export default notifyTaskApi;

import userApi from './userApi';
import notifyTaskApi from './notifyTaskApi';
import transferTaskApi from './transferTaskApi';

const api = {
  user: userApi,
  notifyTask: notifyTaskApi,
  transferTask: transferTaskApi,
};

export default api;

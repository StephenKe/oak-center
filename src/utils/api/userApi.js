import fetchUtil from './fetchUtil';

const CURRENT_USER = 'oak-center/currentUser';

const user = {
  getCurrentUser: function () {
    const item = localStorage.getItem(CURRENT_USER);
    if (_.isEmpty(item)) {
      return null;
    }
    return JSON.parse(item);
  },
  setCurrentUser: function (user) {
    localStorage.setItem(CURRENT_USER, JSON.stringify(user));
  },
  getSignText: async function (address) {
    try {
      const { text } = await fetchUtil.fetch('user/getSignText', { address });
      return text;
    } catch (error) {
      console.log(error);
    }
  },
  login: async function (address, signature) {
    try {
      const { sessionToken } = await fetchUtil.fetch('user/login', { address, signature });
      const currentUser = this.getCurrentUser();
      currentUser.sessionToken = sessionToken;
      this.setCurrentUser(currentUser);
      return user;
    } catch (error) {
      console.log(error);
    }
  },
};

export default user;

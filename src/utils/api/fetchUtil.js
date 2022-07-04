const fetchUtil = {
  baseUrl: 'http://95.179.223.19:7713',
  fetch: async function (url, data, { sessionToken } = {}) {
    let headers = { 'Content-Type': 'application/json' };
    if (!_.isEmpty(sessionToken)) {
      headers = { ...headers, 'Oak-Center-Session-Token': sessionToken };
    }
    try {
      const response = await fetch(`${this.baseUrl}/${url}`, {
        method: 'POST',
        cache: 'no-cache',
        headers,
        body: data ? JSON.stringify(data) : null,
      });
      console.log('response: ', response);
      if (!response.ok) {
        throw new Error('Fetch error.');
      }
      const responseBody = await response.json();
      console.log('responseBody: ', responseBody);
      return responseBody;
    } catch (error) {
      console.error(error);
    }
  },
};

export default fetchUtil;

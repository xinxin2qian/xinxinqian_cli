const axios = require("axios");
const getGitReposList = (username) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://api.github.com/users/${username}/repos`)
      .then(function (response) {
        if (response.status === 200) {
            const list = response.data.map(item => ({name: item.name, value: `https://github.com:${username}/${item.name}`}))
            resolve(list)
        } else {
            reject(response.status)
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
module.exports = {
  getGitReposList,
};

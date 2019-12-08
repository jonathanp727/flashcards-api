const crypto = require('crypto');

function genRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function sha512(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt,
    passwordHash: value,
  };
}

module.exports = {

  saltHashPassword(userpassword) {
    const salt = genRandomString(16);
    const passwordData = sha512(userpassword, salt);

    return passwordData;
  },

  getHashFromSalt(userpassword, salt) {
    const passwordData = sha512(userpassword, salt.toString('hex'));

    return passwordData.passwordHash;
  },
};

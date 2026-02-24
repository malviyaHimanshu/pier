function generateToken(shared) {
  return shared.randomHexToken(48);
}

module.exports = {
  generateToken
};

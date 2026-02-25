const { randomHexToken } = require("../packages/shared/dist");
const token = randomHexToken(48);
console.log(token);

const crypto = require("crypto");

const token = crypto.randomBytes(24).toString("hex");
console.log(token);

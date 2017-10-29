"use strict";

//============ HOW TO CONFIGURE================
// create a file called config.json besids of this file
// and add the data as below
// {
//   "development": {
//     "PORT": [= PORT NUMBER =],
//     "MONGODB_URI": "mongodb://localhost:27017/[= DATABASE NAME =]",
//     "JWT_SECRET": "[= RANDOM SECRET VALUE =]",
//     "EMAIL_USER": "email@test.com",
//     "EMAIL_PASSWORD": "123abc!",
//     "EMAIL_SECRET": "[= RANDOM SECRET VALUE =]"
//   },
//   "test": {
//     "PORT": [= PORT NUMBER =],
//     "MONGODB_URI": "mongodb://localhost:27017/[= DATABASE NAME =]",
//     "JWT_SECRET": "[= RANDOM SECRET VALUE =]",
//     "EMAIL_USER": "email@test.com",
//     "EMAIL_PASSWORD": "123abc!",
//     "EMAIL_SECRET": "[= RANDOM SECRET VALUE =]"
//   }
// }

const env = process.env.NODE_ENV || "development";
console.log(`°**-. Enviroment: ${env} .-**°`);

if (env === "test" || env === "development") {
  const config = require("./config.json");
  const configEnv = config[env];

  Object.keys(configEnv).forEach(key => {
    process.env[key] = configEnv[key];
  });
}

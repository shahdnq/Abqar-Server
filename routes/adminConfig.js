var admin = require("firebase-admin");

var serviceAccount = require("./abqar-firebase-data.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

module.exports.admin = admin

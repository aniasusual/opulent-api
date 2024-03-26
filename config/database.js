const mongoose = require("mongoose");
// password: mUKZc48SANAeX6dy
exports.connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true}).then((con)=>{
        console.log("DATABASE CONNECTED " + con.connection.host);
    }).catch((err) => {
        console.log("error: " + err);
    })
}

// module.exports = connectDatabase;


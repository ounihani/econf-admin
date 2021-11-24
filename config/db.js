const mongoose = require("mongoose");

//database connection
//connect to mongo db atlas
let mongoConnectionUrl =
  "mongodb+srv://nouradmin:Nouradmin2021*@cluster0.joex5.mongodb.net/econf?retryWrites=true&w=majority"; //process.env.LIVE == "TRUE" ? process.env.DB_CONNECTION : process.env.LOCAL_DB_CONNECTION;
//console.log(mongoConnectionUrl);
mongoose.connect(mongoConnectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let connection = mongoose.connection;

//check db connection
connection.once("open", () => {
  console.log("connected to mongodb");
});
//check for db error
connection.on("error", (err) => {
  console.log(err);
});

module.exports = connection;
const mongoose = require("mongoose");
const URI =
  "mongodb+srv://panchami_6:UnX0AQccgEmHJUAN@namaste-node.kmrb2gi.mongodb.net/";



const connectDB = async () => {
  await mongoose.connect(URI);
};

module.exports = connectDB;

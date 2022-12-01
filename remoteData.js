const mongoose = require("mongoose");
const config = "./config.json";
//will be used to get remote data for multiple users on the same system

let connected;
let db;

const connectToDB = async () => {
  await mongoose.connect(config.MONGO_CONFIG);
  connected = true;
  console.log("MongoDB is loaded!");
  db = await mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:")); //tells us if there is an error
  console.log("Complete!");
};

const GTokenSchema = new mongoose.Schema({
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number,
  UUID: String,
});

const GTokenModule = mongoose.model("GToken", GTokenSchema);

const setGToken = async (
  AccessToken,
  RefreshToken,
  Scope,
  TokenType,
  ExpiryDate,
  UUID
) => {
  if (!connected || !db) {
    await connectToDB();
  }

  const dataToDB = GTokenModule({
    AccessToken,
    RefreshToken,
    Scope,
    TokenType,
    ExpiryDate,
    UUID,
  });
  await dataToDB.save((err) => {
    if (err) {
      console.error(err);
      return false;
    }
  });
};

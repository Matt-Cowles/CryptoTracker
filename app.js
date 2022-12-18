import fetch from "node-fetch";
import express from "express";
const app = express();
import mongoose from "mongoose";
import ejsMate from "ejs-mate";
import path from "path";
import url from "url";
import methodOverride from "method-override";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import LocalStrategy from "passport-local";

import * as User from "./models/user.js";

main()
  .then(() => console.log("mognoose connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/crypto-tracker");
}

// New __dirname due to ES Modules
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "thisisabadsecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/crypto-tracker",
    // autoRemove: "interval",
    // autoRemoveInterval: 1, // In minutes. Default
  }),
  cookie: { path: "/", httpOnly: true, maxAge: 1800000 }, // Cookie expires after 30min
};

app.use(session(sessionOptions));

app.use(passport.initialize());

app.get("/tracker", async (req, res) => {
  const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
  const listings = await response.json();

  // console.log(listings);

  res.render("./index", { listings });
});

app.listen(3000, (req, res) => console.log("listening on port 3000"));

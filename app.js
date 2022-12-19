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
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import * as dotenv from "dotenv";
dotenv.config();

import User from "./models/user.js";

const dbUrl = process.env.DB_URL;
// "mongodb://localhost:27017/crypto-tracker"
main()
  .then(() => {
    console.log("mognoose connected");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
  mongoose.set("strictQuery", false);
}

// New __dirname due to ES Modules
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

const sessionOptions = {
  secret: "thisisabadsecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: dbUrl,
  }),
  cookie: { path: "/", httpOnly: true, maxAge: 1800000 }, // Cookie expires after 30min
};
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.authenticate("session"));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.redirect("/tracker");
});

app.get("/tracker", async (req, res) => {
  const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
  const listings = await response.json();

  if (req.user) {
    req.session.user = req.user;
  } else {
    req.session.user = null;
  }
  const user = req.session.user;

  const queryFilter = req.query.filter;
  console.log(queryFilter);

  // console.log(listings);

  res.render("./index", { listings, user, queryFilter });
});

app.put("/:id/favorites", async (req, res) => {
  if (!req.user) {
    req.flash("error", "Please sign in");
    return res.redirect("/tracker");
  }

  const user = await User.findById(req.user.id);

  const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
  const listings = await response.json();

  const item = listings[req.params.id - 1];

  if (!user.favorites.includes(item.name)) {
    user.favorites.push(item.name);
  } else {
    const itemIndex = user.favorites.indexOf(item.name);
    user.favorites.splice(itemIndex, 1);
  }
  console.log(user.favorites);
  user.save();

  res.redirect("/tracker");
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.flash("success", `Thanks for signing up ${username}`);
    res.redirect("/tracker");
  } catch (e) {
    console.log(e);
    req.flash("error", e.message);
    res.redirect("/tracker");
    console.log(e);
  }
});

app.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/tracker" }), (req, res) => {
  req.flash("success", `Welcome back ${req.body.username}!`);
  res.redirect("/tracker");
});

app.post("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("See ya soon!");
    res.redirect("/tracker");
  });
});

app.listen(3000, (req, res) => console.log("listening on port 3000"));

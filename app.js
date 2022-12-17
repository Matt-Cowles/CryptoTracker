import fetch from "node-fetch";
import express from "express";
const app = express();
import mongoose from "mongoose";

const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
const listings = await response.json();
console.log(data[0]);

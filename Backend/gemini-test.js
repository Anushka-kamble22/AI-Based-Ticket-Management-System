import fetch from "node-fetch";

const key = "AIzaSyDcNk27zKCqx4AdsVF13UVOaocNtq20cnI";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
);

const data = await res.json();
console.log(data);
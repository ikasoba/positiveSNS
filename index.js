/* global process */

const express = require('express');

/*
app.use((req,res,next)=>{
  if (req.secure){
    next()
  }else{
    res.status(400).json({message:"It's not https."})
  }
}) */

// app.use("/oidc/",require("./api/oauth.js"));

require('./postgres/js/util.js').SqlLoop();

const app = require('./api/api.js');

app.use((req, res, next) => {
  console.debug(`[${new Date().toUTCString()}]`, req.protocol, req.headers['x-real-ip'] || req.ip,
    req.method, req.originalUrl, 'Headers', req.headers, 'Body', req.body);
  next();
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`起動しました! ポート->${port}`);
});

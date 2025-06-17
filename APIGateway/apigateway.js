const express = require('express'); 
const app = express();

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken');
const JWT_SECRETE = "347186591486#^%%ABCF*##GHE";

function authToken(req, res, next) {
  const header = req?.headers.authorization;
  const token = header && header.split(' ')[1];

  if (token == null) return res.status(401).json("Please send token");

  jwt.verify(token, JWT_SECRETE, (err, user) => {
    if (err) return res.status(403).json("Invalid token");
    req.user = user;
    next();
  });
}

function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json("Unauthorized");
    }
    next();
  };
}

// Registration microservice — no auth
app.use('/reg', (req, res) => {
  console.log("INSIDE API GATEWAY REGISTRATION ROUTE");
  proxy.web(req, res, { target: 'http://13.219.102.142:5001' });
});

// Authentication microservice — no auth
app.use('/auth', (req, res) => {
  console.log("INSIDE API GATEWAY AUTH ROUTE");
  proxy.web(req, res, { target: 'http://54.197.25.104:5002' });
});

// Book microservice — auth required (any logged-in user)
app.use('/book', authToken, (req, res) => {
  console.log("INSIDE API GATEWAY BOOK ROUTE");
  proxy.web(req, res, { target: 'http://54.235.39.91:5004' });
});

// User microservice — auth required (any logged-in user)
app.use('/user', authToken, (req, res) => {
  console.log("INSIDE API GATEWAY USER ROUTE");
  proxy.web(req, res, { target: 'http://3.83.92.251:5005' });
});

app.listen(4000, () => {
  console.log("API Gateway Service is running on PORT NO : 4000");
});



var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

var controller = require('./controller');

var cors = require('cors');
app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));
app.use('/api', controller);
app.listen(port);

console.log('Server listening on port : ' + port);


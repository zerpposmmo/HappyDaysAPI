var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

var controller = require('./controller');
app.use('/api', controller);
app.listen(port);

console.log('Server listening on port : ' + port);


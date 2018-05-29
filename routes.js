module.exports = function(app) {
    var controller = require('./controller');

    // todoList Routes
    app.get('/tour', function (req, res) {
        controller.getInstances(req, res, function (data) {
            data = JSON.parse(data);
            res.status(200).json(JSON.stringify(data));
        });
    });

};
var jinst = require('jdbc/lib/jinst');

if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");
    jinst.setupClasspath([
        './drivers/derby.jar',
        './drivers/derbyclient.jar',
        './drivers/derbytools.jar'
    ]);
}

var config = {
    url: 'jdbc:derby://localhost:1527/HappyDays',
    properties: {
        user: 'root',
        password: 'pass'
    }
};

var jdbc = new (require('jdbc'))(config);

var asyncjs = require('async');

jdbc.initialize(function (err) {
    if (err) {
        console.log(err);
    }
});

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/tours', function (req, res) {
    jdbc.reserve(function (err, connObj) {
        asyncjs.series([function (callback) {
            var conn = connObj.conn;
            conn.createStatement(function (err, statement) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    statement.executeQuery("SELECT ID, POIDSMAX, VOLUMEMAX, COMMANDE_ID, TOURNEE_ID FROM COLIS",
                        function (err, resultset) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                resultset.toObjArray(function (err, data) {
                                    if (!isEmptyObject(data)) {
                                        data = groupBy(data, "TOURNEE_ID");
                                        res.status(200).send(data);
                                    }
                                    callback(null, resultset);
                                });
                            }
                        });
                }
            });
        }], function (err, res) {
            jdbc.release(connObj, function (err) {
                if (err) {
                    res.status(400).send(err);
                }
            });
        });
    });
});

router.get('/products', function (req, res) {
    jdbc.reserve(function (err, connObj) {
        asyncjs.series([function (callback) {
            var conn = connObj.conn;
            conn.createStatement(function (err, statement) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    statement.executeQuery("SELECT * FROM PRODUIT",
                        function (err, resultset) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                resultset.toObjArray(function (err, data) {
                                    if (!isEmptyObject(data)) {
                                        res.status(200).send(data);
                                    }
                                    callback(null, resultset);
                                });
                            }
                        });
                }
            });
        }], function (err, res) {
            jdbc.release(connObj, function (err) {
                if (err) {
                    res.status(400).send(err);
                }
            });
        });
    });
});

router.get('/orders', function (req, res) {
    jdbc.reserve(function (err, connObj) {
        asyncjs.series([function (callback) {
            var conn = connObj.conn;
            conn.createStatement(function (err, statement) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    statement.executeQuery("SELECT * FROM COMMANDE",
                        function (err, resultset) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                resultset.toObjArray(function (err, data) {
                                    if (!isEmptyObject(data)) {
                                        res.status(200).send(data);
                                    }
                                    callback(null, resultset);
                                });
                            }
                        });
                }
            });
        }], function (err, res) {
            jdbc.release(connObj, function (err) {
                if (err) {
                    res.status(400).send(err);
                }
            });
        });
    });
});

module.exports = router;

function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}


var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};
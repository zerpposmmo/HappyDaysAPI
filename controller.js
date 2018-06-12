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
jdbc.initialize(function (err) {
    if (err) {
        console.log(err);
    }
});

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var sql = require('./sql.json');
router.use(bodyParser.urlencoded({extended: true}));

router.get('*', function (req, res) {
    var path = req.originalUrl.replace('/api','').split('/');
    var pathname = path[1];
    var request = '';
    var group = '';
    switch (pathname) {
        case 'navigate':
            request = sql.navigate + path[2] + ' ORDER BY CHEMINPRODUIT.ORDRE';
            //group = 'TOURNEE_ID';
            break;
        case 'order':
            request = sql.order + path[2] + ' ORDER BY LIGNE.PRODUIT_ID';
            break;
        case 'orders':
            request = sql.orders;
            break;
        case 'package':
            request = sql.package + path[2];
            //group = 'COLIS_ID';
            break;
        case 'product':
            request = sql.product + path[2];
            break;
        case 'products':
            request = sql.products;
            break;
        case 'tours':
            request = sql.tours;
            break;
        case 'tour':
            request = sql.tour + path[2];
            break;
        default:
            break;
    }
    if (request !== '') {
        jdbc.reserve(function (err, connObj) {
                var conn = connObj.conn;
                conn.createStatement(function (err, statement) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        statement.executeQuery(request,
                            function (err, resultset) {
                                if (err) {
                                    res.status(400).send(err);
                                } else {
                                    resultset.toObjArray(function (err, data) {
                                        if (!isEmptyObject(data)) {
                                            if(group !== '') {
                                                data = groupBy(data, group);
                                            }
                                            res.status(200).send(data);
                                        }
                                    });
                                }
                            });
                    }
                });
            jdbc.release(connObj, function (err) {
                if (err) {
                    res.status(400).send(err);
                }
            });
        });
    } else {
        res.status(404).send('Unknown route ' + pathname);
    }

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


function groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}
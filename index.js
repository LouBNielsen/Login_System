const express = require('express')
const app = express()
var mysql = require('mysql');
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'pug')

app.get('/', function (req, res) {
    res.render('index', { title: 'Log in', message: 'Log in' })
})

app.post('/CheckUser', function (req, res) {
    var UserName = req.body.UserName
    var Password = req.body.Password
    var LogInType = req.body.LogInType
    var UserLoggedIn = false

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "loginsystem",
        multipleStatements: true
    });

    switch (LogInType) {
        case 'Unsafe':
            con.connect(function (err) {
                if (err) throw err;

                var sql = "SELECT count(*) as Count FROM user WHERE username = '" + UserName + "' AND password = '" + Password + "';"

                console.log(sql)

                con.query(sql, function (err, result, fields) {
                    if (err) throw err;

                    if (result[0].Count > 0) {
                        UserLoggedIn = true;

                        res.send('User name: ' + UserName + ' - Password: ' + Password + ' - Log in type: ' + LogInType + '<br><br>User is logged in...')
                    } else {
                        res.send('User name: ' + UserName + ' - Password: ' + Password + ' - Log in type: ' + LogInType + '<br><br>User is NOT logged in...')
                    }
                });
            });
            break;

        case 'Safer':
            con.connect(function (err) {
                if (err) throw err;

                var sql = "SELECT count(*) as Count FROM user WHERE username = ? AND password = ?;"

                console.log(sql)

                con.query(sql, [UserName, Password], function (err, result, fields) {
                    if (err) throw err;

                    if (result[0].Count > 0) {
                        UserLoggedIn = true;

                        res.send('User name: ' + UserName + ' - Password: ' + Password + ' - Log in type: ' + LogInType + '<br><br>User is logged in...')
                    } else {
                        res.send('User name: ' + UserName + ' - Password: ' + Password + ' - Log in type: ' + LogInType + '<br><br>User is NOT logged in...')
                    }
                });
            });
            break;

        default:
            'Error'
    }
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

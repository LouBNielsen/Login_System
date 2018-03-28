const express = require('express')
const app = express()
var mysql = require('mysql');
var bodyParser = require('body-parser');
var helmet = require('helmet')
var bcrypt = require('bcrypt');

app.use(helmet())

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
                if (err) throw err

                var sql = "SELECT count(*) as Count FROM user WHERE username = '" + UserName + "' AND password = '" + Password + "';"

                con.query(sql, function (err, result) {
                    if (err) throw err

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
                if (err) throw err

                var sql = "SELECT count(*) as Count FROM user WHERE username = ? AND password = ?;"

                console.log(sql)

                con.query(sql, [UserName, Password], function (err, result) {
                    if (err) throw err

                    if (result[0].Count > 0) {
                        UserLoggedIn = true;

                        res.send('User name: ' + UserName + ' - Password: ' + Password + ' - Log in type: ' + LogInType + '<br><br>User is logged in...')
                    } else {
                        res.send('User name: ' + UserName + ' - Password: ' + Password + ' - Log in type: ' + LogInType + '<br><br>User is NOT logged in...')
                    }
                });
            });
            break;

        case 'SaveUser':
            con.connect(function (err) {
                if (err) throw err

                var salt = bcrypt.genSaltSync(10);

                bcrypt.genSalt(10, function (err, salt) {
                    if (err) throw err
                    
                    bcrypt.hash(Password, salt, function (err, hash) {
                        if (err) throw err

                        var sql = "INSERT INTO user (username, password) VALUES ?;"
                        var user = [
                            [UserName, hash+salt]
                        ];
                        con.query(sql, [user], function (err, result) {
                            if (err) throw err

                            res.send('User name: ' + UserName + ' - Password: ' + hash + ' - has been created...')

                        });
                    });
                });
            })
            break;

        case 'EncryptedLogIn':
            con.connect(function (err) {
                if (err) throw err

                var sql = "SELECT password FROM user WHERE username = ?"

                con.query(sql, [UserName], function (err, result) {
                    if (err) throw err

                    var encryptedPassword = result[0].password

                    bcrypt.compare(Password, encryptedPassword, function (err, result) {
                        if (err) res.send(err)

                        if (result) {
                            UserLoggedIn = true;

                            res.send('User name: ' + UserName + ' - Log in type: ' + LogInType + '<br><br>User is logged in...')
                        } else {
                            res.send('User name: ' + UserName + ' - Log in type: ' + LogInType + '<br><br>User is NOT logged in...')
                        }
                    });
                });
            });
        default:
            'Error'
    }
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

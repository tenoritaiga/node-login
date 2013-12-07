var EM = require('./modules/email-dispatcher');
var DB = require('./modules/database-manager');

module.exports = function (app) {

// main login page //

    app.get('/', function (req, res) {
        // check if the user's credentials are saved in a cookie //
        if (req.cookies.user == undefined || req.cookies.pass == undefined) {
            res.render('login', { title: 'Hello - Please Login To Your Account' });
        } else {
            // attempt automatic login //
            DB.autoLogin(req.cookies.user, req.cookies.pass, function (o) {
                if (o != null) {
                    req.session.user = o;
                    res.redirect('/home');
                } else {
                    res.render('login', { title: 'Hello - Please Login To Your Account' });
                }
            });
        }
    });

    app.post('/', function (req, res) {
        DB.manualLogin(req.param('user'), req.param('pass'), function (e, o) {
            if (!o) {
                res.send(e, 400);
            } else {
                req.session.user = o;
                if (req.param('remember-me') == 'true') {
                    res.cookie('user', o.user, { maxAge: 900000 });
                    res.cookie('pass', o.pass, { maxAge: 900000 });
                }
                res.send(o, 200);
            }
        });
    });

// logged-in user homepage //

    app.get('/home', function (req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            res.render('home', {
                title: 'Control Panel',
                udata: req.session.user
            });
        }
    });

    app.post('/home', function (req, res) {
        if (req.param('user') != undefined) {
            DB.updateAccount({
                user: req.param('user'),
                name: req.param('name'),
                email: req.param('email'),
                country: req.param('country'),
                pass: req.param('pass')
            }, function (e, o) {
                if (e) {
                    res.send('error-updating-account', 400);
                } else {
                    req.session.user = o;
                    // update the user's login cookies if they exists //
                    if (req.cookies.user != undefined && req.cookies.pass != undefined) {
                        res.cookie('user', o.user, { maxAge: 900000 });
                        res.cookie('pass', o.pass, { maxAge: 900000 });
                    }
                    res.send('ok', 200);
                }
            });
        } else if (req.param('logout') == 'true') {
            res.clearCookie('user');
            res.clearCookie('pass');
            req.session.destroy(function (e) {
                res.send('ok', 200);
            });
        }
    });

// creating new accounts //

    app.get('/signup', function (req, res) {
        res.render('signup', {  title: 'Signup' });
    });

//    function memberlist(db) {
//        return function(req, res) {
//            var coll = collection('chatrooms');
//            coll.find({},{},function(e,names){
//                res.render('chatname', {
//                    "chatname" : names
//                });
//            });
//        };
//    };

    app.get('/test', function (req, res) {

        DB.readChatrooms(function (e, o) {
            if (e) {
                res.send(e, 400);
            } else {
                //console.log("OK");
                //console.log(o[0].chatname.chatname);
                res.render('test', {  title: 'Test', chatrooms: o});
            }

        });
    });


//    app.get('/test', function(req, res) {
//        res.render('test', { title: 'Test' });
//    });

    app.get('/create-chat', function (req, res) {
        res.render('create-chat', { title: 'Create a new chat' });
    });

    app.get('/chatloader', function (req, res) {
            res.render('chatloader', { title: 'Welcome to pgpchat.'});
    });
    app.post('/chatloader', function (req, res) {
        if(req.xhr){
            if(req.param("function") == "addChatToUser"){
                var chat = req.param("chatname");
                DB.addChatToUser(req.cookies.user, chat, function (e, o) {
                    if (e) {
                        res.send(e.toString());
                    } else {
                        res.send('ok');
                    }
                });
            }
            if(req.param("function") == "addFriendToUser"){
                var friendName = req.param("friendName");
                DB.addFriendToUser(req.cookies.user, friendName, function (e, o) {
                    if (e) {
                        res.send(e.toString());
                    } else {
                        res.send('ok');
                    }
                });
            }
            if(req.param("function") == "getUserChatrooms"){

                console.log("username: " + req.cookies.user);
                DB.getUserChatrooms(req.cookies.user, function (e, o) {
                    if (e) {
                        res.send(e);
                    } else {
                        res.send(o);
                    }
                });
            }
        }
    });


    app.post('/create-chat', function (req, res) {

        DB.writeChatroom(
           req.param('chatname')
        , function (e) {
            if (e) {
                res.send(e, 400);
            } else {
                res.send('ok', 200);
            }
        });

        res.send({redirect: '/chatloader'});

    });

    app.get('/account', function (req, res) {
        res.render('account', { title: 'Account' });
    });

    app.get('/settings', function (req, res) {
        res.render('settings', { title: 'Account Settings' });
    });

    app.post('/signup', function (req, res) {
        DB.addNewAccount({
            name: req.param('name'),
            email: req.param('email'),
            user: req.param('user'),
            pass: req.param('pass'),
            country: req.param('country')
        }, function (e) {
            if (e) {
                res.send(e, 400);
            } else {
                res.send('ok', 200);
            }
        });
    });

// password reset //

    app.post('/lost-password', function (req, res) {
        // look up the user's account via their email //
        DB.getAccountByEmail(req.param('email'), function (o) {
            if (o) {
                res.send('ok', 200);
                EM.dispatchResetPasswordLink(o, function (e, m) {
                    // this callback takes a moment to return //
                    // should add an ajax loader to give user feedback //
                    if (!e) {
                        //	res.send('ok', 200);
                    } else {
                        res.send('email-server-error', 400);
                        for (k in e) console.log('error : ', k, e[k]);
                    }
                });
            } else {
                res.send('email-not-found', 400);
            }
        });
    });

    app.get('/reset-password', function (req, res) {
        var email = req.query["e"];
        var passH = req.query["p"];
        DB.validateResetLink(email, passH, function (e) {
            if (e != 'ok') {
                res.redirect('/');
            } else {
                // save the user's email in a session instead of sending to the client //
                req.session.reset = { email: email, passHash: passH };
                res.render('reset', { title: 'Reset Password' });
            }
        })
    });

    app.post('/reset-password', function (req, res) {
        var nPass = req.param('pass');
        // retrieve the user's email from the session to lookup their account and reset password //
        var email = req.session.reset.email;
        // destory the session immediately after retrieving the stored email //
        req.session.destroy();
        DB.updatePassword(email, nPass, function (e, o) {
            if (o) {
                res.send('ok', 200);
            } else {
                res.send('unable to update password', 400);
            }
        })
    });


// view & delete accounts //

    app.get('/print', function (req, res) {
        AM.getAllRecords(function (e, accounts) {
            res.render('print', { title: 'Account List', accts: accounts });
        })
    });

    app.post('/delete', function (req, res) {
        AM.deleteAccount(req.body.id, function (e, obj) {
            if (!e) {
                res.clearCookie('user');
                res.clearCookie('pass');
                req.session.destroy(function (e) {
                    res.send('ok', 200);
                });
            } else {
                res.send('record not found', 400);
            }
        });
    });

    app.get('/reset', function (req, res) {
        AM.delAllRecords(function () {
            res.redirect('/print');
        });
    });

    app.get('*', function (req, res) {
        res.render('404', { title: 'Page Not Found'});
    });

};


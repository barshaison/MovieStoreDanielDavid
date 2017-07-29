
var express = require('express');
var app = express();
var db_helper= require('./DBHelper');
var port = 5011;
var bodyParser = require('body-parser');
//var async = require('async');
var moment=require('moment');
var isLoggedIn=false;
var isAdminLoggedIn=false;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    } else
        return next();

});
app.post('/Users/Register',function(req,res){
    var query="INSERT INTO Users(UserName,FirstName,LastName," +
        "Address,City,Phone_No,Cellular,CreditCard_No,Password,Country" +
        ") VALUES (@UserName,@FirstName,@LastName,@Address,@City,@Phone_No,@Cellular,@CreditCard_No,@Password" +
        ",@Country);";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            var query2="INSERT INTO UsersCategories(UserName,CategoryName) VALUES(@UserName,@Category)";
            var query3="INSERT INTO UsersQA(UserName,Answer) VALUES(@UserName,@Answer)";
            var dict2={UserName:req.body.UserName,Answer:req.body.Answer};
            db_helper.excecuteQuery(dict2,query3)
                .then(function(results) {
                    for (var i = 0; i < req.body.Categories.length; i++) {
                        var dict = {UserName: req.body.UserName, Category: req.body.Categories[i]};
                        db_helper.excecuteQuery(dict, query2)
                            .then(function(response){
                                var query1="IF NOT EXISTS(SELECT * FROM UsersCookies WHERE UserName=@UserName)BEGIN INSERT INTO UsersCookies(UserName) VALUES(@UserName);" +
                                    "SELECT token FROM UsersCookies WHERE UserName=@UserName END";
                                db_helper.excecuteQuery(req.body,query1)
                                    .then(function(results) {
                                        var token;
                                        if(results.length>0){
                                            token=results[0].token;
                                            res.json(token);
                                        }
                                        else{
                                            res.send('token exists');
                                        }
                                    })
                            })
                            .catch(function (err) {
                                res.send('there was an error with questions');
                            });
                    }
                })
                .catch(function(err){
                    res.send('there was an error with Categories');
                });


        })
        .catch(function(err){
            res.send(err);
        })

})
app.post('/Users/Login',function (req,res) {
    var query="SELECT * FROM Users WHERE UserName=@UserName AND Password=@Password";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length==1){
                isLoggedIn=true;
                var query1="IF NOT EXISTS(SELECT * FROM UsersCookies WHERE UserName=@UserName)BEGIN INSERT INTO UsersCookies(UserName) VALUES(@UserName);" +
                    "SELECT token FROM UsersCookies WHERE UserName=@UserName END ELSE SELECT token FROM UsersCookies WHERE UserName=@UserName";
                db_helper.excecuteQuery(req.body,query1)
                    .then(function(results) {
                        var token;
                    if(results.length>0){
                        token=results[0].token;
                        res.json(token);
                    }
                    else{
                        res.send('login without cookie');
                    }
                    })

            }else{
                res.send('invalid username or password')
            }
        })
        .catch(function(err){
            res.send('error with user login');
        });
});
/*
app.use('/',function(req,res,next){

    if(req.headers["myToken"]) {
        var data = {Token: req.headers["myToken"]};
        var query = "SELECT * FROM UsersCategories WHERE Token=@Token";

        db_helper.excecuteQuery(data, query)
            .then(function (results) {
                if (results.length > 0){
                    res.send(results);
                    next();
                }
                else {
                // wrong token
                res.send('wrong credentials');
                }
            })
            .catch(function (err) {
                res.send('error with movies by name');
            });
    }else{
        // no token
        res.send('no token');

    }
});
*/

/*
app.post('/Admins/AdminsLogin',function (req,res) {
    var query="SELECT * FROM Admins WHERE UserName=@UserName AND Password=@Password";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length==1){
                res.send('login success');
                isAdminLoggedIn=true;
            }else{
                res.send('invalid username or password')
            }
        })
        .catch(function(err){
            res.send('error with admin login');
        });
});
*/
/*app.use('/Users',function(req,res,next){
    if(checkLogin())
    next();
    else
        res.send('Please Login First ! ');
});
app.use('/Admins',function (req,res,next) {
    if(checkAdminLogin())
        next();
    else
        res.send('Please login as an admin first!');
});*/



app.get('/Users/Top5TrendMovies',function(req,res){
    var query="select top(5) * from Movies order by OrdersCounter DESC";
    db_helper.excecuteQuery(req.query,query)
        .then(function(results){
            res.send(results);
        })
        .catch(function(err){
            res.send('error with trend movies');
        });
});
app.get('/Users/TopNewestMovies',function(req,res){
    var query="select top 5 *  FROM movies  ORDER BY DATE DESC";
    db_helper.excecuteQuery(req.query,query)
        .then(function(results){
                res.send(results);
        })
        .catch(function(err){
            res.send('error with newest movies');
        });
});
app.get('/Users/Categories',function(req,res){
    var query="SELECT * FROM Categories";
    db_helper.excecuteQuery(null,query)
        .then(function(results){
            res.send(results);
        })
        .catch(function(err){
        res.send('error with categories');
    });
});
app.post('/Users/PurchaseCart',function(req,res){
    var selectQuery="SELECT MAX(Cart_No) FROM OrdersByCart";
    db_helper.excecuteQuery(req.body,selectQuery)
        .then(function(results) {
            var maxVal=0;
            if(results[0]['']==null){
                maxVal=1;
            }else{
                maxVal=results[0][''];
                maxVal++;
            }
            var query="INSERT INTO OrdersByCart(UserName,MovieName,Cart_No,TotalPrice,deliveryDate) VALUES(@UserName,@MovieName,@Cart_No,@TotalPrice,@deliveryDate)";
            var query2="UPDATE Movies SET OrdersCounter=(SELECT OrdersCounter FROM Movies WHERE Name=@MovieName)+1 WHERE Name=@MovieName";

            for(var i=0;i<req.body.Movies.length;i++){

            var params={
                UserName:req.body.UserName,
                MovieName:req.body.Movies[i].MovieName,
                Cart_No:maxVal,
                TotalPrice:req.body.Movies[i].Price,
                deliveryDate:req.body.Movies[i].deliveryDate
            };
            var params2={ MovieName:req.body.Movies[i].MovieName};
                db_helper.excecuteQuery(params,query)
                .catch(function(err){
                    res.send('error with purchasing a cart');
                });
            db_helper.excecuteQuery(params2,query2)
                    .catch(function(err){
                        res.send('error with purchasing a cart');
                    });
            }
        })
        .then(function(){
            res.send('cart purchase succesful');
        })
        .catch(function(err){
            res.send('error with cart number');
        });
});
app.post('/Users/PurchaseSingle',function(req,res){
    var query="INSERT INTO Orders(UserName,MovieName,TotalPrice,deliveryDate) VALUES(@UserName,@MovieName,@TotalPrice,@deliveryDate)";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            var query2="UPDATE Movies SET OrdersCounter=(SELECT OrdersCounter FROM Movies WHERE Name=@MovieName)+1 WHERE Name=@MovieName";
            var dict={};
            dict.MovieName=req.body.MovieName;
            db_helper.excecuteQuery(dict,query2).then(function(results){
                res.send('single purchase succesful');

            }).catch(function(err){
                res.send('error with single purchase');
            });
        })
        .catch(function(err){
            res.send('error with single purchase');
        });

});
app.post('/Users/RetrievePassword',function(req,res){
    var query="SELECT Users.Password FROM UsersQA JOIN Users ON UsersQA.UserName=Users.UserName WHERE Users.UserName=@UserName AND UsersQA.Answer=@Answer";
    var query1="SELECT * FROM UsersQA WHERE UserName=@UserName AND Answer=@Answer";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            res.send(results);
        })
        .catch(function(err){
            res.send('error with password retrieval');
        });
});
app.post('/Users/MoviesByCategory',function(req,res){
    var query="SELECT * FROM Movies WHERE Category=@Category";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no movies in such category')
        })
        .catch(function(err){
            res.send('error with movies by category');
        });
});
app.post('/Users/SuggestedMovies',function(req,res){
    var query="SELECT * FROM Movies JOIN UsersCategories ON UsersCategories.CategoryName=Movies.Category WHERE UserName=@UserName";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            res.send(results);
        })
        .catch(function(err){
            res.send('error retrieving your suggested movies');
        });

});
app.post('/Users/MovieByName',function(req,res){
    var query="SELECT * FROM Movies WHERE Name LIKE @Name";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no movies under that name');
        })
        .catch(function(err){
            res.send('error with movies by name');
        });
});
app.post('/Users/MoviesByDirector',function(req,res){
    var query="SELECT * FROM Movies WHERE Director LIKE @Director";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no movies under that director');
        })
        .catch(function(err){
            res.send('error with movies by director');
        });
});
app.post('/Users/PurchaseHistory',function(req,res){
    var query="select MovieName,Orders.Time,TotalPrice FROM Orders WHERE UserName=@UserName UNION SELECT Movies,OrdersByCart.Time,TotalPrice FROM OrdersByCart WHERE UserName=@UserName";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no purchases for this user');
        })
        .catch(function(err){
            res.send('error with purchase history');
        });
});
app.post('/Users/SendCookie',function(req,res){
    var query="SELECT * FROM usersCookies WHERE Token=@Token";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            if(results.length>0){
                res.send(results);
                isLoggedIn=true;
            }
            else
                res.send('wrong cookie');
        })
        .catch(function(err){
            res.send('error with movies by name');
        });
});
app.get('/Users/GetAllMovies',function (req,res) {
    var query="SELECT * FROM Movies";
    db_helper.excecuteQuery(null,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no movies in this store');
        })
        .catch(function(err){
            res.send('error with movies list');
        });
});
app.get('/Users/GetAllDirectors',function (req,res) {
    var query="select director from movies";
    db_helper.excecuteQuery(null,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no movies in this store');
        })
        .catch(function(err){
            res.send('error with movies list');
        });
});
app.get('/Users/Logout',function (req,res) {

    isLoggedIn=false;
});




app.get('Admins/GetReports',function (req,res) {
    var query="SELECT * FROM Orders";
    db_helper.excecuteQuery(null,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no orders in this store');
        })
        .catch(function(err){
            res.send('error with admins reports');
        });
});
app.get('/Admins/GetCustomers',function(req,res){
    var query="SELECT * FROM Users";
    db_helper.excecuteQuery(req.query,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no customers in this store');
        })
        .catch(function(err){
            res.send('error with customers list');
        });
});
app.get('/Admins/GetAllMovies',function (req,res) {
    var query="SELECT * FROM Movies";
    db_helper.excecuteQuery(null,query)
        .then(function(results){
            if(results.length>0)
                res.send(results);
            else
                res.send('there are no movies in this store');
        })
        .catch(function(err){
            res.send('error with movies list');
        });
});
app.post('/Admins/DeleteMovie',function(req,res){
    var query="DELETE FROM Movies WHERE MovieName=@MovieName";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            res.send('movie deleted succesfuly')
        })
        .catch(function(err){
            res.send('error with movie deletion')
        })
});
app.post('/Admins/DeleteUser',function(req,res){
    var query="DELETE FROM Users WHERE UserName=@UserName";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            res.send('user deleted succesfuly')
        })
        .catch(function(err){
            res.send('error with user deletion')
        })
});
app.post('/Admins/InsertMovie',function (req,res) {

    var query="INSERT INTO Movies(Name,Director,Description," +
        "Category,Year,OrdersCounter,Image,Date)" +
        " VALUES (@Name,@Director,@Description,@Category,@Year,0,@Image,@Date,@Price);";
    req.body.Date=moment().format('YYYY-MM-DDThh:mm:ss');
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            res.send('insertion succesful');
        })
        .catch(function(err){
            res.send('error with movie insertion');
        });
});
app.post('/Admins/InsertUser',function (req,res) {

    var query="INSERT INTO Users(UserName,FirstName,LastName," +
        "Address,City,Phone_No,Cellular,CreditCard_No,Password,Country" +
        ",Categories,Questions,Answers) VALUES (@UserName,@FirstName,@LastName,@Address,@City,@Phone_No,@Cellular,@CreditCard_No,@Password" +
        ",@Country,@Categories,@Questions,@Answers);";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            console.log('insertion succesful');
        })
        .catch(function(err){
            res.send('error with user insertion');
        });
});

app.listen(port, function () {
    console.log('listening on port 5011');
});

function checkLogin(){
     return isLoggedIn||checkAdminLogin();
}
function checkAdminLogin(){
    return isAdminLoggedIn;
}
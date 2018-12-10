var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var mysql = require('mysql');
var db = require('./config/db');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var cors = require('cors');
socketEvents = require('./controllers/socket-events');  


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://192.168.10.130:4200, http://localhost:4200");
  res.header("Access-Control-Allow-Credentials","true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
 });

/*socket events*/ 
app.use(cors());
const io = require('socket.io').listen(server);
socketEvents(io);



app.use(bodyParser.json({
    limit : "50mb"
  }));

app.use(bodyParser.urlencoded({
  extended: true,
  limit : "50mb"
}));


/*custom*/

var approutes = require('./routes/routes');
app.use(approutes);

/*end-custom*/




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'uploads')));/*uploads*/

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
/*custom*/
//var usermodule = require('./controllers/usermodule.js');
//app.use('/usermodule', usermodule);
/*end-custom*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var port = process.env.PORT || 3000;

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

app.get('/connectMySql', function (req, res) {
  var query = "SELECT * FROM Users";
  var table = [];
  query = mysql.format(query, table);
  db.query(query, function (err, results) {
    if (!err) {
      res.send(results);

    }
  })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(port, function () {
  console.log("Iam listening to " + port);
})




module.exports = app;

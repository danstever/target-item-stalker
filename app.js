var cheerio = require('cheerio');
var http = require('http');
var nodemailer = require('nodemailer');
var Q = require('q');
var request = require("request");
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('items.db');

var emailFrom = "";
var sendTo = "";
var googleAppPassword = "";

//var items = [
//	'http://www.target.com/p/unicorn-head-wall-decor-pillowfort/-/A-50075402',
//	'http://www.target.com/p/cat-head-wall-decor-pillowfort/-/A-50075812',
//	'http://www.target.com/p/dinosaur-head-wall-decor-pillowfort/-/A-50075329'
//];
//
//db.serialize(function() {
//  db.run("CREATE TABLE if not exists items (url TEXT)");
//  var stmt = db.prepare("INSERT INTO items VALUES (?)");
//  items.forEach(function(item){
//	stmt.run(item);
//  });
//  stmt.finalize();
//});
//db.close();

function scanItems() {
    getItems()
    .then(function(items){
        items.forEach(function(item){
            console.log('Scan Started for', item);
            scan(item);
        });
    });
}

function getItems() {
    var deferred = Q.defer();
    db.all("SELECT * from items",function(err, rows){
        var items = [];
        rows.forEach(function(row) {
            items.push(row.url);
        });
        deferred.resolve(items);
    });
    return deferred.promise;
}

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: emailFrom,
       pass: googleAppPassword
   }
});

function sendUpdate(item) {
    smtpTransport.sendMail({
       from: emailFrom, // sender address
       to: sendTo, // comma separated list of receivers
//	   subject: "Target Item: " + item.title + " is in Stock!", // Subject line
       text: "The " + item.title + " is Back in Stock! " + item.url // plaintext body
    }, function(error, response){
       if(error){
           console.log(error);
       }else{
           console.log("Message sent: " + response.message);
       }
    });
}

function scan(url) {
    var item = {
        "title" : "",
        "inStock" : false,
        "url" : url
    };
    request(url, function(err, res, body) {
        if (err) {
            new Error(error);
        }

        $ = cheerio.load(body);
        var addToCart = $('#addToCart').length;
        item.title = $('title').text();

        if (addToCart === 1 ) {
            item.inStock = true;
            sendUpdate(item);
            console.log(item);
        }
    });
}

http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    getItems()
    .then(function(items){
        items.forEach(function(item){
            res.write(item + "<br />");
        });
    })
    .then(function() {
        res.end();
    });
}).listen(3000);
console.log('running on :3000');

setInterval(function(){scanItems()}, 1000*60*10);

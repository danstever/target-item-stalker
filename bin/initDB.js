var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('items.db');

var items = [
    'http://www.target.com/p/unicorn-head-wall-decor-pillowfort/-/A-50075402',
    'http://www.target.com/p/cat-head-wall-decor-pillowfort/-/A-50075812',
    'http://www.target.com/p/dinosaur-head-wall-decor-pillowfort/-/A-50075329',
    'http://www.target.com/p/shark-head-wall-decor-pillowfort/-/A-50075445',
    'http://www.target.com/p/dog-head-wall-decor-pillowfort/-/A-50075602'
];

function initDB() {
    db.serialize(function() {
        db.run('CREATE TABLE if not exists items (url TEXT)');
        var stmt = db.prepare('INSERT INTO items VALUES (?)');
        items.forEach(function(item) {
            console.log(item);
            stmt.run(item);
        });
        stmt.finalize();
        db.close(function(){
            process.exit();
        });
    });
}

process.on('exit', function() {
    console.log('database created');
});

initDB();

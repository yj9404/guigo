var mysql = require("mysql");

var config = require("./dbconfig");

const pool = mysql.createPool(config);

var get_connection = (callback) => {
    pool.getConnection((err, conn) => {
        if (!err) {
            callback(conn);
        }
    });
};

module.exports = get_connection;

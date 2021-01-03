var get_connection = require("./dbconnection");

var query = (query_string) => {
    return new Promise((resolve, reject) => {
        get_connection((connection) => {
            connection.query(query_string, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
            connection.release();
        });
    });
};

module.exports = query;

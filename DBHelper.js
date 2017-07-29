/**
 * Created by Big_Chiefa on 30/05/2017.
 */
var Connection =require('tedious').Connection;
var cors=require('cors');
var Request=require('tedious').Request;
var TYPES=require('tedious').TYPES;
var config={
    userName:'kdavidoz',
    password: 'Galgueta123',
    server: 'davidozserver.database.windows.net',
    requestTimeout: 30000,
    options:{encrypt: true,database:'KashiDB',rowCollectionOnDone:true }

};

exports.excecuteQuery=function(params,query){
    return new Promise(function(resolve,reject) {
        var  myConnection = new Connection(config);
        var results = [];
        var properties = [];

        myConnection.on('connect', function (err) {
            if (err) {
                console.log(err);
            }
            var req = new Request(query, function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });
            if (params) {
                for (var key in params) {
                    req.addParameter(key, TYPES.NVarChar, params[key]);
                }
            }
            req.on('columnMetadata', function (columns) {
                columns.forEach(function (column) {
                    if (column.colName != null)
                        properties.push(column.colName);
                });
            });
            req.on('requestCompleted', function () {
                myConnection.close();
                resolve(results);

            });
            req.on('row', function (row, err) {
                var item = {};
                for (i=0; i<row.length; i++) {
                    item[properties[i]] = row[i].value;// creating an array of dictionaries suitable for json
                }
                results.push(item);
            });
            myConnection.execSql(req);
        });


    });
};



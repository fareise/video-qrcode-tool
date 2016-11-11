var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the server
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/myproject';
MongoClient.connect(url, function(err, db) {
  console.log("Connected successfully to server");
  var collection = db.collection("myCollection");    
  collection.createIndex({dateOfBirth:1}, function(err, result){
  	console.log(result);
  });
  collection.insertMany([{name:"Alice",age:12},{name:"Alex",age:15}],function(err, result){
  	console.log("添加成功");
  })
});
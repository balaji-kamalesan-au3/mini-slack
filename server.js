const express = require("express");
const app = express();
var cors = require('cors')
const MongoClient = require('mongodb').MongoClient

var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(cors())

let url = "mongodb://localhost:27017";
const dbName = "Slack"


//  Users Route 

app.route("/getuser")
    .post(function(req,res){
        
        let email = req.body.email;
        console.log(email)
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            else{
                let dbo = db.db(dbName);
                dbo.collection("users").find({email : email}).toArray(function(err, result) {
                    if(err) throw err;
                    else {
                        console.log(result)
                        res.json(result)
                    }
                })
            }
        })

    })

app.route("/addusers")
    .post(function(req,res){

    
        let {email, password, name} = req.body;

        let complete = {...req.body, channel : ["announcement"]}
        
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            else{
                let dbo = db.db(dbName);
                dbo.collection("users").find({email : email}).toArray( function(err,result){
                  if (err) console.log(err);
                  else {
                      if(result.length == 0){
                          dbo.collection("users").insertOne(complete , function(err, result){
                              if(err) throw err 
                              else {
                                  res.send(`${email} inserted successfully`);
                              }
                          });
                        }
                        else {
                            res.send(`${email} already registered please try another one`)
                        }
                  }
                })
            }
        })
    })
    .put(function(req,res){
        let {email,channel} = req.body;
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            else {
                let dbo = db.db(dbName);

                dbo.collection("users").update({email : email},{$push : {channel : channel}}, function(err,result){
                    if(err) throw err;
                    else {
                        console.log(result)
                        res.send("Upated");
                    }
                })
            }
        })
    })


app.route("/getmessages")
    .post(function(req,res){
        let channel = req.body.channel;
        console.log(channel)
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            else {
                let dbo = db.db(dbName);
                dbo.collection(channel).find({}).toArray(function(err,result){
                    if(err) throw err;
                    else {
                        
                        res.json(result);
                    }
                })
            }
        })
    
    })

app.route("/channels")
    .post(function(req,res){
        let {channel, name, post} = req.body;
        console.log(channel,name,post)
        MongoClient.connect(url,function(err, db){
            if(err) throw err;
            else{
                let dbo = db.db(dbName);
                dbo.collection(channel).insertOne({user : name, post : post}, function(err,result){
                    if(err) throw err;
                    else {
                        console.log(result)
                        res.json(`${post} Inserted`)
                    }
                })
            }
        })

    })


app.route("/availablechannels")
    .get(function(req,res){
        MongoClient.connect(url,function(err, db){
            if(err) throw err;
            else{
                let dbo = db.db(dbName);
                dbo.collection("availablechannels").find({},{name:1, _id:0}).toArray(function(err,result){
                    if(err) throw err;
                    else {
                        res.json(result);
                    }
                })
            }
        })
    })
    .post(function(req,res){
        MongoClient.connect(url,function(err, db){
            if(err) throw err;
            else{
                let body = {name : req.body.name,tags : req.body.tags}

                let dbo = db.db(dbName);
                dbo.collection("availablechannels").insert(body,function(err,result){
                    if(err) throw err;
                    else{
                        res.json(`${body.name} is created Successfully`)
                    }
                })
            }
        })
    })
    .put(function(req,res){
      
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            else {
                let dbo = db.db(dbName);

                dbo.collection("availablechannels").update({name : req.body.channel},{$push : {users : req.body.email}}, function(err,result){
                    if(err) throw err;
                    else {
                        console.log(result)
                        res.send("Upated");
                    }
                })
            }
        })
    })


app.listen(5000, function(){
    console.log("App is started in port 5000")
})
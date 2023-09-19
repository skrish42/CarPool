var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose") ;

const app = express()
app.set('view engine','ejs');
app.use(bodyParser.json())
app.use(express.static('public'))


app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb://localhost:27017/Riders_details',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database Successsfully"))

app.post("/sign_up",(req,res)=>{
    db.collection('Users').insert(req.body,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });
    return res.send("<script>alert('You have booked your Ride Successfully'); window.location.href = 'carPool.html';</script>");
});

app.get("/viewpublisheddetails", function (req, res) { 
    db.collection('Publish').find().toArray(function(err, docs) {
        if(JSON.stringify(docs) === '[]'){
            res.send("<script>alert('There is no ride detais.'); window.location.href = '/publishride';</script>");
        }
        else{
            res.render('available_rides',{details:docs});
        }
      });
})

app.post("/publish",(req,res)=>{
    db.collection('Publish').countDocuments({user_name:"Guns"},(err,obj)=>{
        if (err) throw err
        else if(obj==1){
            var name = req.body.user_name;
            db.collection('AllPublishedRides').insertOne(req.body,(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("Record Inserted Successfully");
                db.close();
            });
            db.products.updateOne(
                { _id: 1 },
                {
                  $set: { item: "apple" },
                  $setOnInsert: { dateAdded: new Date() }
                },
                { upsert: true }
             )
            db.collection('Publish').updateOne({user_name:name}, {$set:req.body}, function(err, res) {
                if (err) throw err;
                console.log("Ride details Updated");
                db.close();
             });
        }
        else{
            db.collection('AllPublishedRides').insertOne(req.body,(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("Record Inserted Successfully");
                db.close();
            });
            db.collection('Publish').insertOne(req.body,(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("Record Inserted Successfully");
                db.close();
            });
        }
    });
    
    return res.send("<script>alert('You have Published your Ride Successfully'); window.location.href = '/publishride';</script>");
});

app.post("/edit",(req,res)=>{
    var name = req.body.user_name;
    db.collection('Users').updateOne({user_name:name}, {$set:req.body}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
  return res.send("<script>alert('You have updated your Ride Details successfully'); window.location.href = 'carPool.html';</script>");
});

app.get('/delerr',(req,res) =>{
    res.send("<script>alert('No User exists.Please book a ride.'); window.location.href = 'carPool.html';</script>")
})

app.get('/delcor',(req,res) =>{
    res.send("<script>alert('Your ride has been cancelled successfully.'); window.location.href = 'carPool.html';</script>")
})


app.post("/delete",(req,res)=>{
    var uname = req.body.user_name;
    var myquery = { user_name: uname };
    var result="false";
    db.collection("Users").deleteOne(myquery).then(
        (result)=>{
            if(result.deletedCount==1){
                res.redirect('/delcor')
            }
            else{
                res.redirect('/delerr');
            }
        }
    )
    .catch(
        (err) => console.log(err)
    )
})

app.post("/change",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('contactform.html');
});

app.get("/vech", function (req, res) {
    return res.redirect('index.html')
})
app.get("/view", function (req, res) {
    res.render('journeydetails',{ details: null })
})


app.post("/viewdetails", function (req, res) { 
    var uname = req.body.user_name;  
    db.collection('Users').find({user_name:uname}).toArray(function(err, docs) {
        if(JSON.stringify(docs) === '[]'){
            res.send("<script>alert('There is no ride detais.'); window.location.href = '/view';</script>");
        }
        else{
            res.render('journeydetails',{details:docs});
        }
      });
})

app.get("/publishride",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    res.render('publish_a_ride',{title:"Publish_Ride"});
})

app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    res.render('home',{title:"Home"});
}).listen(5000);

console.log("Listening on PORT 5000");
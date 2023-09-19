var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb+srv://admin-varsha:varsha123@cluster0.oyyo7nr.mongodb.net/rider");


// mongoose.connect(
//   "mongodb+srv://tskkrishna2002:MxXlxdzv1tVR2KdP@cluster0.n7ti8kz.mongodb.net/riderdetails/Riders",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );

var db = mongoose.connection;

db.on("error", () => console.log("Error in Connecting to Database"));
db.once("open", () => console.log("Connected to Database Successsfully"));

//Publishing a Ride
app.post("/publish", (req, res) => {
  db.collection("Publish").countDocuments(
    { user_name: req.body.user_name },
    (err, obj) => {
      if (err) throw err;
      if (obj == 0) {
        db.collection("Publish").insertOne(req.body, (err, collection) => {
          if (err) throw err;
          console.log("Record inserted successfully");
        });
        db.collection("AllPublishedRides").insertOne(
          req.body,
          (err, collection) => {
            if (err) throw err;
            console.log("Record inserted successfully");
          }
        );
        res.send(
          "<script>alert('Published Ride Successfully'); window.location.href = '/home';</script>"
        );
      } else {
        db.collection("Publish").updateOne(
          { user_name: req.body.user_name },
          { $set: req.body },
          function (err, res) {
            if (err) throw err;
            db.collection("AllPublishedRides").insertOne(
              req.body,
              (err, collection) => {
                if (err) throw err;
                console.log("Record inserted successfully");
              }
            );
            console.log("Ride details Updated");
          }
        );
        res.send(
          "<script>alert('Published Ride Successfully'); window.location.href = '/home';</script>"
        );
      }
    }
  );
});

//Getting the rider details selected by user
app.post("/riderdetails", function (req, res) {
  db.collection("Publish").deleteOne(
    { user_name: req.body.rider_name },
    (err, obj) => {
      res.render("book_a_ride");
    }
  );
  console.log(req.body);
});

app.post("/bookride", function (req, res) {
  db.collection("BookRide").insertOne(req.body, (err, collection) => {
    if (err) throw err;
    console.log("Record inserted successfully");
  });
  res.send(
    "<script>alert('Ride Booked Successfully.'); window.location.href = '/home';</script>"
  );
});

//View Available Riders
app.get("/viewavailableriders", function (req, res) {
  db.collection("Publish")
    .find()
    .toArray(function (err, docs) {
      if (JSON.stringify(docs) === "[]") {
        res.send(
          "<script>alert('There is no ride detais.'); window.location.href = '/publishride';</script>"
        );
      } else {
        res.render("available_rides", { details: docs });
      }
    });
});

//view all rides
app.get("/ridedetails", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("ridedetails", { details: null });
});

app.post("/viewdetails", function (req, res) {
  var uname = req.body.user_name;
  db.collection("AllPublishedRides")
    .find({ user_name: uname })
    .toArray(function (err, docs) {
      if (JSON.stringify(docs) === "[]") {
        res.send(
          "<script>alert('There is no ride detais.'); window.location.href = '/view';</script>"
        );
      } else {
        res.render("ridedetails", { details: docs });
      }
    });
});

app.get("/ridedetailspage", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("ridedetails", { details: null });
});

//POST METHOD from Admin Page

app.post("/adminloginform", function (req, res) {
  db.collection("AdminUsers").countDocuments(
    { username: req.body.username, password: req.body.password },
    (err, obj) => {
      if (err) throw err;
      else if (obj == 1) {
        res.send(
          "<script>alert('You are an Admin.'); window.location.href = '/ridedetailspage';</script>"
        );
      } else {
        res.send(
          "<script>alert('You are not an admin'); window.location.href = '/';</script>"
        );
      }
    }
  );
});

//POST METHOD from login page
app.post("/loginform", function (req, res) {
  db.collection("RegisterUsers").countDocuments(
    { username: req.body.username, password: req.body.password },
    (err, obj) => {
      if (err) throw err;
      else if (obj == 1) {
        res.send(
          "<script>alert('You have Login Successfully.'); window.location.href = '/home';</script>"
        );
      } else {
        res.send(
          "<script>alert('Please Register First'); window.location.href = '/registerpage';</script>"
        );
      }
    }
  );
});

//POST METHOD from register page
app.post("/registerform", function (req, res) {
  db.collection("RegisterUsers").countDocuments(
    { username: req.body.username },
    (err, obj) => {
      if (err) throw err;
      else if (obj == 1) {
        res.send(
          "<script>alert('Email Exits.Please Login'); window.location.href = '/loginpage';</script>"
        );
      } else {
        db.collection("RegisterUsers").insertOne(
          req.body,
          (err, collection) => {
            if (err) {
              throw err;
            }
            console.log("Registered Record Inserted Successfully");
          }
        );
        res.send(
          "<script>alert('You have registered successfully.'); window.location.href = '/home';</script>"
        );
      }
    }
  );
});

//to book a ride
app.get("/bookaride", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("book_a_ride", { title: "Book_Ride" });
});

//navigate to publish ride form
app.get("/publishride", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("publish_a_ride", { title: "Publish_Ride" });
});

//login page
app.get("/loginpage", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("login", { title: "Login" });
});

//register page
app.get("/registerpage", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("register", { title: "Register" });
});

//admin page
app.get("/adminloginpage", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("adminlogin", { title: "Admin Login" });
});
//navigate to home page
app.get("/home", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });
  res.render("home", { title: "Home" });
});

//login home
app
  .get("/", (req, res) => {
    res.set({
      "Allow-access-Allow-Origin": "*",
    });
    res.render("loginhome", { title: "Login Page" });
  })
  .listen(5050);

console.log("Listening on PORT 5050");

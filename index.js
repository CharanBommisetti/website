const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt')
const request = require('request');
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");

initializeApp({
    credential: cert(serviceAccount),
}); 

const db = getFirestore();
 
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render('start.ejs');
 });

app.get("/signup", (req, res) => {
    res.render('signup');
 });
 
app.get('/signupsubmit', (req, res) => {
    
    const full_name = req.query.first_name;
    const last_name = req.query.last_name;
    const email = req.query.email;
    const password = req.query.psw;
    const rep_psw = req.query.psw_repeat;

    
    //Adding data to the collection
    if(password == rep_psw){
        db.collection('project')
        .add({
            name: full_name + last_name,
            email:email,
            password: bcrypt.hash(password,10),
        })
        .then(() => {
            res.render("signin");
        });
    }else{
        res.send("SignUP Failed");
    }
});

app.get("/signin", (req, res) => {
    res.render('signin');
 }); 

 app.get('/signinsubmit', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;

    db.collection("project")
        .where("email", "==", email)
        .where("password", "==", password)
        .get()
        .then((docs) => {
            if(docs.size>0){
                var usersData = [];
                db.collection('project')
                    .get()
                    .then(() => {
                        docs.forEach((doc) => {
                            usersData.push(doc.data());
                    });
                })
                .then(() => {
                    console.log(usersData);
                    res.render('home' , {userData: usersData},);
                }); 
            }else{
                res.send("Login Failed");
            }
        });
 });


 app.get("/end", (req, res) => {
    res.render('end');
 });


app.listen(port, () => {
    console.log(`Your APP is running in the port ${port}`);
})
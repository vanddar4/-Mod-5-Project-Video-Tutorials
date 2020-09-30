const port = 9000

// Express 
const express = require('express') //require express module
const app = new express() //calls express function to start new Express app
const fileUpload = require("express-fileupload");
const expressionSession = require("express-session")

//Path
const path = require("path");
const authMiddleware = require("./middleware/authMiddleware")
const logoutController = require("./controllers/logout")

//Mongoose
const mongoose = require('mongoose');
const Courses = require("./models/courses");
const Users = require("./models/users");
//const notify = require("./notification.js");

//EJS
const ejs = require('ejs');
const ejsLint = require('ejs-lint');

//BCrypt
const bcrypt = require("bcrypt");

//BodyParser
const bodyParser = require('body-parser');

// WebToken
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

//Server
app.listen(port, ()=>{
    console.log(`Server up and running on ${port}`);
})

// Use
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(expressionSession({
    secret: "coldeststone",
    resave: true,
    saveUninitialized: true,
}))
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true,}))
mongoose.connect('mongodb://localhost/DVD_courses_project', {useNewUrlParser:true, useUnifiedTopology: true, autoIndex: true})
app.use(cookieParser())
//need help with config
// app.use((req,res,next)=>{
//      if(config.loggedIn == true){
//          if(req.cookies.token == undefined){
//              config.loggedIn=false;
//          }else{
             
//              decodedToken = jwt.verify(req.cookies.token, config.secret);
//              if(decodedToken.username === undefined){
//                  config.loggedIn=false;
//              }
//          }
//      }else{
//          if(req.cookies.token!=undefined){
//              decodedToken = jwt.verify(req.cookies.token, config.secret);
//              if(decodedToken.username != undefined){
//                  config.loggedIn=true;
//              }
//          }
//      }
//      req.login = config.loggedIn;
//      next();
//  });

//GET Routes
app.get('/', async (req, res)=>{
    if(req.session.user) {
        const id = req.session.user._id
        const courses = await Courses.find({creatorID: id})
        res.render("user-home", {
            courses,
            username: req.session.user.username
        });
    } else {
        const courses = await Courses.find({})
        res.render("guest-home", {
            courses
        });
    }
})
app.get('/guest-home',async (req, res)=>{
    const courses = await Courses.find({})
        res.render("guest-home", {
            courses
    });
})
app.get('/register',(req, res)=>{
    res.render('register')
})
app.get('/login',(req, res)=>{
    res.render('login')
})
app.get('/user-home',(req, res)=>{
    res.redirect('/')
})

app.get('/create-course',(req, res)=>{
    if(req.session.user) {
        res.render("create-course", {
        username: req.session.user.username,
        })
    } else {
        res.redirect("guest-home")
    }
})
app.get('/course-details',(req, res)=>{
    if(req.secret.user) {
        res.render("course-details")
    } else {
        res.redirect("guest-home")
    }
})
app.get('/course-details/:id',async (req,res)=>{ 
    if(req.session.user) {       
        const courseDetails = await Courses.findById(req.params.id)
        res.render('course-details',{
            courseDetails,
            username: req.session.user.username,
        });    
    } else {
        res.redirect("guest-home")
    }
})

app.get('/edit/:id', (req, res) => {
    Courses.findById(req.params.id, (error, courseDetails) => {
        res.render('edit-course', {username: req.session.user.username, courseDetails})
    })
})

//POST Routes
app.post("/users/register", (req, res) => {
    Users.create(req.body, (error, user) => {
        if(error) {
            return res.redirect("/guest-home")
            //notify('There was an error. Please try again.', 'error', context)
        } else {
            res.redirect("/login");
            //notify('Successful Registration', 'success', context)
        }
    })
})
// //Course Validation, needs to notify.js
// [
//     check("username").notEmpty().isString().trim().isLength(5).withMessage('Username must be 5 characters, letters and digits only'),
//     check("password").notEmpty().isString().trim().isLength(5).withMessage('Password must be 5 characters, letters and digits only'),
// ],

app.post("/users/login", (req, res) => {
    const {username, password} = req.body;
    Users.findOne({username:username}, (error,user) => {
        if(user) {
            bcrypt.compare(password, user.password, (error, same) => {
                if(same) {
                    req.session.user = user
                    //notify('Successful Login', 'success', context)
                    res.redirect("/")
                }
                else {
                    //notify('There was an error. Please try again.', 'error', context)
                    res.redirect("/login")
                }
            })
        }
        else {
            //notify('Please try again', 'error', context)
            res.redirect("/login")
        }
    })
})

// //Course Validation, needs to notify.js
// [
//     check("username").notEmpty().isString().trim().isLength(5).withMessage('Username must be 5 characters, letters and digits only'),
//     check("password").notEmpty().isString().trim().isLength(5).withMessage('Password must be 5 characters, letters and digits only'),
//     check("repeatPassword").notEmpty().isString().trim().isSameAs("password").withMessage('Needs to start with http or https),
// ],
app.post("/course/store", async (req, res) => {
    let image = req.files.imageUrl;
    image.mv(path.resolve(__dirname, "public/img", image.name), async (error) => {
        await Courses.create({
            ...req.body,
            image:"/img/" + image.name,
            creatorID: req.session.user._id
            })
        //notify('Successfully Created Course', 'success', context)
        res.redirect("/")
    })
})
// //Course Validation, needs to notify.js
// [
//     check("title").notEmpty().isString().trim().isLength(4).withMessage('Title must be 4 characters'),
//     check("description").notEmpty().isString().trim().isLength(20).withMessage('Description must be 20 characters'),
//     check("imageUrl").notEmpty().isString().trim().startsWith(http || https).withMessage('Needs to start with http or https),
// ],
app.post('/edit/:id',(req, res) => {
    Courses.findByIdAndUpdate(req.params.id, req.body, (error,courseDetails) => {
            if(error) throw error
            else res.redirect('/user-home')
            //notify('Successfully Edited Course', 'success', context)

    })
});
// //Course Validation, needs to notify.js
// [
//     check("title").notEmpty().isString().trim().isLength(4).withMessage('Title must be 4 characters'),
//     check("description").notEmpty().isString().trim().isLength(20).withMessage('Description must be 20 characters'),
//     check("imageUrl").notEmpty().isString().trim().startsWith(http || https).withMessage('Needs to start with http or https),
// ],

app.get('/delete/:id', async (req, res)=>{
    console.log(req.params.id);
    await Courses.findByIdAndDelete(req.params.id, (error) => {
        if(error) throw error
        else res.redirect('/user-home')
        //notify('Successfully Deleted Course', 'success', context)
    }) 
})

app.get("/auth/logout", logoutController);
app.use((req, res) => res.render("notfound"));
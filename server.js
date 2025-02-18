const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const { log } = require('console');
const app = express();
const session = require("express-session");

// Connect to MongoDB

mongoose.connect('mongodb+srv://Examiner:Exam%40123@exammanagedb.2z5zb.mongodb.net/Exammanage')
.then(()=>console.log('Connected to MongoDB'))
.catch(err=>console.error('Could not connect to MongoDB',err));


// Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static("./public"));
app.use(express.json());

function isAuthenticated(req, res, next) {
  if (req.session.user) {
      next();  // User is logged in, allow access
  } else {
      res.status(401).json({ error: "Unauthorized. Please log in." });
  }
}




// always redirect to index.html
app.get("/login",(req,res)=>{
  res.redirect("/index.html");
});

// SUBJECT MANAGEMENT API'S


const subjectSchema=new mongoose.Schema({
  S_name:String,
  S_code:String,
  S_module:String,
  S_batch:String
});
const subject=mongoose.model('subject',subjectSchema,'subjects');


//subject insert

// API Route to Insert a New Subject
app.post("/add-subject", async (req, res) => {
  try {
    console.log(req.body);
    const {S_name, S_code, S_module, S_batch} = req.body;
    console.log(S_name, S_code, S_module, S_batch); 

    //Create a new subject document
    const newSubject = new subject({
      S_name,
      S_code,
      S_module,
      S_batch,
    });
    
    //Save to MongoDB
    const savedSubject = await newSubject.save();
    res.status(201).json({ message: "Subject added successfully", data: savedSubject });
  } catch (error) {
    res.status(404).json({ error: "Failed to add subject", details: error.message });
  }
});


// All Subjects

app.get("/get-subjects", async (req, res) => { 
  try {
    const subjects = await subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(404).json({ error: "Failed to get subjects", details: error.message });
  }
});


//delete a Subject

app.delete("/delete-subject/:subject_code", async (req, res) => {
  try {
    const subject_code = req.params.subject_code;
    
    console.log(subject_code);
    
    const deletedSubject = await subject.findOneAndDelete(subject_code);
    
    if (!deletedSubject) 
    {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.status(200).json({ message: "Subject deleted successfully" , data: deletedSubject });
  }catch (error)
  {                                     
    res.status(404).json({ error: "Failed to delete subject", details: error.message });
  }
});

// update a subject
app.put("/update-subject/:subject_code", async (req, res) => {
  const S_code = req.params.subject_code;
  const { S_name, S_module, S_batch } = req.body;
  try {
    const updatedSubject = await subject.findOneAndUpdate({ S_code }, { S_name, S_module, S_batch }, { new: true });
    if (!updatedSubject) {
      return res.status(400).json({ error: "Subject not found" });
    }
    res.status(200).json({ message: "Subject updated successfully", data: updatedSubject });
  } catch (error) {
    res.status(400).json({ error: "Failed to update subject", details: error.message });
  }
});

// ROOM MANAGMEWNT  API'S

const roomSchema= new mongoose.Schema({
  R_code:String,
  R_capacity:String
});

const room=mongoose.model('room',roomSchema,'rooms');

//room insert

app.post('/add-room',async (req,res)=>{
  try{
    const {R_code,R_capacity}=req.body;
    const newRoom=new room({
      R_code,
      R_capacity
    });
    const savedRoom = await newRoom.save();
    res.status(201).json({message:"Room added successfully",data:savedRoom});

  }catch(err){
    res.status(404).json({error:"Failed to add room",details:err.message});
  }
});

// room delete

app.delete("/delete-room/:room_code", async (req, res) => {
  try{
    const room_code=req.params.room_code;
    const deletedRoom=await room.findOneAndDelete(room_code);
    res.status(200).json({message:"Room deleted successfully",data:deletedRoom});
    }
    catch(error){
      res.status(404).json({error:"Failed to delete room",details:error.message});
    }
});

// all rooms

app.get("/get-rooms", async (req, res) => {
  try{
    const rooms=await room.find();
    res.status(200).json(rooms);
  }
  catch(error){
    res.status(404).json({error:"Failed to get rooms",details:error.message});
  } 
});

// update a room  

app.put("/update-room/:room_code", async (req, res) => {
  const R_code = req.params.room_code;
  const { R_capacity } = req.body;
  try {
    const updatedRoom = await room.findOneAndUpdate({ R_code }, { R_capacity }, { new: true });
    if (!updatedRoom) {
      return res.status(400).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Room updated successfully", data: updatedRoom });
  } catch (error) {
    res.status(400).json({ error: "Failed to update room", details: error.message });
  }
});
// USER MANAGEMENT API'S


const userSchema = new mongoose.Schema({
  U_name:String,
  U_id:String,
  U_phone:String,
  U_email:String,
  U_role:String,
  U_password:String
});
const user=mongoose.model('user',userSchema,'users');

// uer insert

app.post('/add-user',async (req,res)=>{
  try{
    const {U_name,U_id,U_phone,U_email,U_role,U_password}=req.body;
    const newUser=new user({
      U_name,
      U_id,
      U_phone,
      U_email,
      U_role,
      U_password
    });
    const savedUser = await newUser.save();
    res.status(200).json({message:"User added successfully",data:savedUser});
  }
  catch(error){
    res.status(404).json({error:"Failed to add user",details:error.message});
  }
});

// user delete

app.delete("/delete-user/:user_id", async (req, res) => {
  try{
    const U_id=req.params.user_id;
    const deleteUser=await user.findOneAndDelete(U_id);
    res.status(200).json({message:"User deleted successfully",data:deleteUser});
  }
  catch(error){
    res.status(404).json({error:"Failed to delete user",details:error.message});
  } 
});

// all users
app.get("/get-users", async (req, res) => {
  try{
    const users=await user.find();
    res.status(200).json(users);
  }
  catch(error){
    res.status(404).json({error:"Failed to get users",details:error.message});
  } 
});

// update a user
app.put("/update-user/:user_id", async (req, res) => {
  const U_id = req.params.user_id;
  const { U_name, U_phone, U_email, U_role, U_password } = req.body;
  try {
    const updatedUser = await user.findOneAndUpdate({ U_id }, { U_name, U_phone, U_email, U_role, U_password }, { new: true });
    if (!updatedUser) {
      return res.status(400).json({ error: "User not found" });
    }
    res.status(200).json({ success:true,message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(400).json({ error: "Failed to update user", details: error.message });
  }
});


// LOGIN API

app.use(session({
  secret: "your_secret_key",  // Used to sign the session ID cookie
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 } // 1 hour
}));
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
      res.json({ isAuthenticated: true, user: req.session.user });
  } else {
      res.json({ isAuthenticated: false });
  }
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.json({ message: `Welcome, ${req.session.user.username}!` });
});


app.post('/login',async (req,res)=>{
  console.log(req.body);
  const {username,password}=req.body;
  try{
    // console.log("Login Successful");

    const userfinal=await user.findOne({U_name:username});
    if(userfinal){
      if(userfinal.U_password===password){
        req.session.user = { id: userfinal._id, username: userfinal.U_name, role: userfinal.U_role };
        console.log("Login Successful");
        res.status(200).json({success:true,message:"Login Successful",redirect:"/home.html"});

      }
      else{
        res.status(400).json({error:"Invalid Password"});
      }
    }
    else{
      res.status(400).json({error:"Invalid User"});
    }
  }
  catch(error){
    res.status(404).json({error:"Failed to login",details:error.message});
  }
});

// LOGOUT

// app.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//       if (err) {
//           return res.status(500).json({ error: "Logout failed" });
//       }
//       res.json({ success: true, message: "Logged out successfully" });
//   });
// });




// MODULE MANAGEMENT API'S

// const moduleSchema=new mongoose.Schema({
//   M_name:String,
//   M_id:String,
//   M_subject:[String]
// })
// const module=mongoose.model('module',moduleSchema,'modules');
// // all modules

// app.get("/get-modules", async (req, res) => {
//   try{
//     const modules=await module.find();
//     res.status(200).json(modules);
//   }
//   catch(error){
//     res.status(404).json({error:"Failed to get modules",details:error.message});
//   }
// });

// // module insert

// app.post('/add-module',async (req,res)=>{
//   try{
//     const {M_name,M_id,M_subject}=req.body;
//     const newModule=new module({
//       M_name,
//       M_id,
//       M_subject
//     });
//     const savedModule = await newModule.save();
//     res.status(200).json({message:"Module added successfully",data:savedModule});
//   }
//   catch(error){
//     res.status(404).json({error:"Failed to add module",details:error.message});
//   }   
// });

// // module delete

// app.delete("/delete-module/:module_id", async (req, res) => {
//   try{
//     const M_id=req.params.module_id;
//     const deleteModule=await module.findOneAndDelete(M_id);
//     res.status(200).json({message:"Module deleted successfully",data:deleteModule});
//   }
//   catch(error){
//     res.status(404).json({error:"Failed to delete module",details:error.message});
//   } 
// });   

// BATCH MANAGEMENT API'S
const batchSchema=new mongoose.Schema({
  B_id:String,
  B_name:String,
  B_strenth:String
})
const batch=new mongoose.model('batch',batchSchema,'batches');

// all batches

app.get("/get-batches", async (req, res) => {
  try{
    const batches=await batch.find();
    res.status(200).json(batches);
  }
  catch(error){
    res.status(404).json({error:"Failed to get batches",details:error.message});
  }
});

// batch insert
app.post('/add-batch',async (req,res)=>{
  try{
    const {B_id,B_name,B_strenth}=req.body;
    const newBatch=new batch({
      B_id,
      B_name,
      B_strenth
    });
    const savedBatch = await newBatch.save();
    res.status(200).json({message:"Batch added successfully",data:savedBatch});
  }
  catch(error){
    res.status(404).json({error:"Failed to add batch",details:error.message});
  }   
});

// batch delete

app.delete("/delete-batch/:batch_id", async (req, res) => {
  try{
    const B_id=req.params.batch_id;
    const deleteBatch=await batch.findOneAndDelete(B_id);
    res.status(200).json({message:"Batch deleted successfully",data:deleteBatch});
  }
  catch(error){
    res.status(404).json({error:"Failed to delete batch",details:error.message});
  }
});

// update a batch
app.put("/update-batch/:batch_id", async (req, res) => {
  const B_id = req.params.batch_id;
  const { B_name, B_strenth } = req.body;
  try {
    const updatedBatch = await batch.findOneAndUpdate({ B_id }, { B_name, B_strenth }, { new: true });
    if (!updatedBatch) {
      return res.status(400).json({ error: "Batch not found" });
    }
    res.status(200).json({ message: "Batch updated successfully", data: updatedBatch });
  } catch (error) {
    res.status(400).json({ error: "Failed to update batch", details: error.message });
  }
});

app.listen(4000,()=>console.log("Listening on port 4000..."));
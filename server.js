const mongoose = require("mongoose");
const express = require("express");
const app = express();
const session = require("express-session");

// Connect to MongoDB

mongoose
  .connect(
    "mongodb+srv://Examiner:Exam%40123@exammanagedb.2z5zb.mongodb.net/Exammanage"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use(express.json());

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next(); // User is logged in, allow access
  } else {
    res.status(401).json({ error: "Unauthorized. Please log in." });
  }
}

// always redirect to index.html
app.get("/login", (req, res) => {
  res.redirect("/index.html");
});

app.get("/batchmanagement", (req, res) => {
  res.redirect("/batch.html");
});
app.get("/roommanagement", (req, res) => {
  res.redirect("/room.html");
});

app.get("/subjectmanagement", (req, res) => {
  res.redirect("/subject.html");
});

app.get("/usermanagement", (req, res) => {
  res.redirect("/user.html");
});

app.get("/modulemanagement", (req, res) => {
  res.redirect("/module.html");
});

const subjectSchema = new mongoose.Schema({
  S_name: String,
  S_code: String,
  S_module: String,
  S_batch: String,
  S_faculty: String,
});

const Subject = mongoose.model("Subject", subjectSchema, "subjects");

// --- Add Subject ---
app.post("/add-subject", async (req, res) => {
  try {
    const { S_name, S_code, S_module, S_batch, S_faculty } = req.body;

    // Check if a subject with the same S_code already exists
    const existingSubject = await Subject.findOne({ S_code });
    if (existingSubject) {
      return res.status(400).json({ error: "Subject code already exists" });
    }

    const newSubject = new Subject({
      S_name,
      S_code,
      S_module,
      S_batch,
      S_faculty,
    });

    await newSubject.save();
    res
      .status(201)
      .json({ message: "Subject added successfully", data: newSubject });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add subject", details: error.message });
  }
});

// --- Get Subjects ---
app.get("/get-subjects", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get subjects", details: error.message });
  }
});

// --- Delete Subject ---
app.delete("/delete-subject/:S_code", async (req, res) => {
  try {
    const { S_code } = req.params;
    const deletedSubject = await Subject.findOneAndDelete({ S_code });

    if (!deletedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res
      .status(200)
      .json({ message: "Subject deleted successfully", data: deletedSubject });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete subject", details: error.message });
  }
});

// --- Update Subject ---
app.put("/update-subject/:S_code", async (req, res) => {
  try {
    const { S_code } = req.params;
    const { S_name, S_module, S_batch, S_faculty } = req.body;

    const updatedSubject = await Subject.findOneAndUpdate(
      { S_code },
      { S_name, S_module, S_batch, S_faculty },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res
      .status(200)
      .json({ message: "Subject updated successfully", data: updatedSubject });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update subject", details: error.message });
  }
});

// ROOM MANAGMEWNT  API'S

const roomSchema = new mongoose.Schema({
  R_code: String,
  R_capacity: String,
});

const room = mongoose.model("room", roomSchema, "rooms");

// Add a room
app.post("/add-room", async (req, res) => {
  try {
    const { R_code, R_capacity } = req.body;
    const newRoom = new room({ R_code, R_capacity });
    const savedRoom = await newRoom.save();
    res
      .status(201)
      .json({ message: "Room added successfully", data: savedRoom });
  } catch (err) {
    res.status(500).json({ error: "Failed to add room", details: err.message });
  }
});

// Delete a room
app.delete("/delete-room/:room_code", async (req, res) => {
  try {
    const room_code = req.params.room_code;
    const deletedRoom = await room.findOneAndDelete({ R_code: room_code });
    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
    res
      .status(200)
      .json({ message: "Room deleted successfully", data: deletedRoom });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete room", details: error.message });
  }
});

// Get all rooms
app.get("/get-rooms", async (req, res) => {
  try {
    const rooms = await room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get rooms", details: error.message });
  }
});

// Update a room
app.put("/update-room/:room_code", async (req, res) => {
  const R_code = req.params.room_code;
  const { R_capacity } = req.body;
  try {
    const updatedRoom = await room.findOneAndUpdate(
      { R_code },
      { R_capacity },
      { new: true }
    );
    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
    res
      .status(200)
      .json({ message: "Room updated successfully", data: updatedRoom });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update room", details: error.message });
  }
});

// USER MANAGEMENT API'S

const userSchema = new mongoose.Schema({
  U_name: String,
  U_id: String,
  U_phone: String,
  U_email: String,
  U_role: [String],
  U_password: String,
});
const user = mongoose.model("user", userSchema, "users");

// user insert

app.post("/add-user", async (req, res) => {
  try {
    const { U_name, U_id, U_phone, U_email, U_role, U_password } = req.body;
    const newUser = new user({
      U_name,
      U_id,
      U_phone,
      U_email,
      U_role,
      U_password,
    });
    const savedUser = await newUser.save();
    res
      .status(200)
      .json({ message: "User added successfully", data: savedUser });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to add user", details: error.message });
  }
});

// user delete

app.delete("/delete-user/:user_id", async (req, res) => {
  try {
    const U_id = req.params.user_id;
    const deleteUser = await user.findOneAndDelete(U_id);
    res
      .status(200)
      .json({ message: "User deleted successfully", data: deleteUser });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to delete user", details: error.message });
  }
});

// all users
app.get("/get-users", async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to get users", details: error.message });
  }
});

// update a user
app.put("/update-user/:user_id", async (req, res) => {
  const U_id = req.params.user_id;
  const { U_name, U_phone, U_email, U_role, U_password } = req.body;
  try {
    const updatedUser = await user.findOneAndUpdate(
      { U_id: U_id },
      { U_name, U_phone, U_email, U_role, U_password },//req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ error: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update user", details: error.message });
  }
});

// LOGIN API

app.use(
  session({
    secret: "your_secret_key", // Used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);
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

app.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  try {
    // console.log("Login Successful");

    const userfinal = await user.findOne({ U_name: username });
    if (userfinal) {
      if (userfinal.U_password === password) {
        req.session.user = {
          id: userfinal._id,
          username: userfinal.U_name,
          role: userfinal.U_role,
        };
        console.log("Login Successful");
        res.status(200).json({
          success: true,
          message: "Login Successful",
          redirect: "/home.html",
        });
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(400).json({ error: "Invalid User" });
    }
  } catch (error) {
    res.status(404).json({ error: "Failed to login", details: error.message });
  }
});

// LOGOUT

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// MODULE MANAGEMENT API'S
const moduleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  moduleCoordinator: {
    type: String,
    required: true,
  },
  subjects: [
    {
      type: String,
      required: true,
    },
  ],
  faculties: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Module = mongoose.model("Module", moduleSchema, "modules");

// Update your existing module routes:

// GET all modules
app.get("/api/modules", async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch modules", details: error.message });
  }
});

// POST new module
app.post("/api/modules", async (req, res) => {
  try {
    const { moduleName, moduleCoordinator, subjects, faculties } = req.body;

    const newModule = new Module({
      moduleName,
      moduleCoordinator,
      subjects,
      faculties,
    });

    const savedModule = await newModule.save();
    res
      .status(201)
      .json({ message: "Module added successfully", data: savedModule });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to add module", details: error.message });
  }
});

// DELETE module
app.delete("/api/modules/:id", async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
      return res.status(404).json({ error: "Module not found" });
    }
    res
      .status(200)
      .json({ message: "Module deleted successfully", data: deletedModule });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete module", details: error.message });
  }
});

// UPDATE module
app.put("/api/modules/:id", async (req, res) => {
  try {
    const { moduleName, moduleCoordinator, subjects, faculties } = req.body;

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      {
        moduleName,
        moduleCoordinator,
        subjects,
        faculties,
      },
      { new: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ error: "Module not found" });
    }

    res
      .status(200)
      .json({ message: "Module updated successfully", data: updatedModule });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update module", details: error.message });
  }
});
// BATCH MANAGEMENT API'S
const batchSchema = new mongoose.Schema({
  B_id: String,
  B_name: String,
  B_strenth: String,
});
const batch = new mongoose.model("batch", batchSchema, "batches");

// all batches

app.get("/get-batches", async (req, res) => {
  try {
    const batches = await batch.find();
    res.status(200).json(batches);
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to get batches", details: error.message });
  }
});

// batch insert
app.post("/add-batch", async (req, res) => {
  try {
    const { B_id, B_name, B_strenth } = req.body;
    const newBatch = new batch({
      B_id,
      B_name,
      B_strenth,
    });
    const savedBatch = await newBatch.save();
    res
      .status(200)
      .json({ message: "Batch added successfully", data: savedBatch });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to add batch", details: error.message });
  }
});

// batch delete

app.delete("/delete-batch/:batch_id", async (req, res) => {
  try {
    const B_id = req.params.batch_id;
    const deleteBatch = await batch.findOneAndDelete(B_id);
    res
      .status(200)
      .json({ message: "Batch deleted successfully", data: deleteBatch });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to delete batch", details: error.message });
  }
});

app.put("/update-batch/:batch_name", async (req, res) => {
  const B_name = req.params.batch_name;
  const { B_strenth } = req.body;

  try {
    const updatedBatch = await batch.findOneAndUpdate(
      { B_name },
      { $set: { B_strenth } },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res
      .status(200)
      .json({ message: "Batch updated successfully", data: updatedBatch });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update batch", details: error.message });
  }
});

// GET a single module by ID
app.get("/api/modules/:id", async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch module", 
      details: error.message 
    });
  }
});

// UPDATE a module
app.put("/api/modules/:id", async (req, res) => {
  try {
    const { moduleCoordinator, subjects, faculties } = req.body;
    
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      {
        moduleCoordinator,
        subjects,
        faculties
      },
      { new: true, runValidators: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to update module", 
      details: error.message 
    });
  }
});

// DELETE a module
app.delete("/api/modules/:id", async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    
    if (!deletedModule) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to delete module", 
      details: error.message 
    });
  }
});

app.listen(4000, () => console.log("Listening on port 4000..."));

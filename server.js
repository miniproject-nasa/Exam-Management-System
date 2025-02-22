const mongoose = require("mongoose");
const express = require("express");
const app = express();
const session = require("express-session");
const multer = require("multer");

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

// 1) GET ALL USERS
app.get("/get-users", async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get users", details: error.message });
  }
});

// 2) ADD USER (with default password)
app.post("/add-user", async (req, res) => {
  try {
    const { U_name, U_id, U_phone, U_email, U_role } = req.body;
    const defaultPassword = "abcd1234";
    const newUser = new user({
      U_name,
      U_id,
      U_phone,
      U_email,
      U_role,
      U_password: defaultPassword,
    });
    const savedUser = await newUser.save();

    res.status(200).json({
      message: "User added successfully",
      data: { ...savedUser._doc, generatedPassword: defaultPassword },
    });
  } catch (error) {
    res.status(404).json({ error: "Failed to add user", details: error.message });
  }
});

// 3) UPDATE USER
app.put("/update-user/:user_id", async (req, res) => {
  const U_id = req.params.user_id;
  const { U_name, U_phone, U_email, U_role } = req.body;
  try {
    const updatedUser = await user.findOneAndUpdate(
      { U_id },
      { U_name, U_phone, U_email, U_role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to update user", details: error.message });
  }
});

// 4) DELETE USER
app.delete("/delete-user/:user_id", async (req, res) => {
  try {
    const U_id = req.params.user_id;
    const deleteUser = await user.findOneAndDelete({ U_id });
    if (!deleteUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User deleted successfully", data: deleteUser });
  } catch (error) {
    res
      .status(404)
      .json({ error: "Failed to delete user", details: error.message });
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
  const { userID, password } = req.body;
  try {
    // console.log("Login Successful");

    const userfinal = await user.findOne({ U_id: userID });
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


//SEATING ARRANGEMENT

// Add this near your other requires at the top
const PDFDocument = require('pdfkit');

// Add these routes to your existing server.js

// Get batches for seating dropdown
app.get("/api/seating/batches", async (req, res) => {
    try {
        const batches = await batch.find({}, 'B_name B_strenth');
        res.json(batches);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching batches' });
    }
});

// Get rooms for seating dropdown
app.get("/api/seating/rooms", async (req, res) => {
    try {
        const rooms = await room.find({}, 'R_code R_capacity');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching rooms' });
    }
});

// Generate seating arrangement
app.post("/api/generate-seating", async (req, res) => {
    try {
        const { selectedBatches, selectedRooms } = req.body;
        
        // Fetch batch and room details
        const batchDetails = await batch.find({ B_name: { $in: selectedBatches } });
        const roomDetails = await room.find({ R_code: { $in: selectedRooms } });
        
        // Generate seating arrangement
        const seatingArrangement = generateSeatingArrangement(batchDetails, roomDetails);
        
        // Generate PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=seating-arrangement.pdf');
        
        generateSeatingPDF(doc, seatingArrangement);
        doc.pipe(res);
        doc.end();
        
    } catch (error) {
        res.status(500).json({ error: 'Error generating seating arrangement' });
    }
});

// Helper function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Updated seating arrangement generation function
function generateSeatingArrangement(batches, rooms) {
  let shuffledBatches = shuffleArray([...batches]);
  let shuffledRooms = shuffleArray([...rooms]);
  
  let arrangement = {};
  let summary = {};
  let batchRollNumbers = {};
  
  // Initialize roll numbers for each batch
  shuffledBatches.forEach(batch => {
      batchRollNumbers[batch.B_name] = 1;
  });
  
  // Process each room
  shuffledRooms.forEach(room => {
      let roomCode = room.R_code;
      let remainingCapacity = room.R_capacity;
      
      arrangement[roomCode] = {
          capacity: room.R_capacity,
          seatMatrix: [],
          assignments: []
      };
      
      summary[roomCode] = {};
      
      // Record starting roll numbers for this room
      shuffledBatches.forEach(batch => {
          summary[roomCode][batch.B_name] = {
              start: batchRollNumbers[batch.B_name],
              end: batchRollNumbers[batch.B_name]
          };
      });
      
      let globalSeatCounter = 1;  // Counter for sequential seat numbers
      let currentRow = [];
      let batchIndex = 0;
      
      // Fill seats using sequential numbering
      while (remainingCapacity > 0) {
          let currentBatch = shuffledBatches[batchIndex];
          
          if (batchRollNumbers[currentBatch.B_name] <= currentBatch.B_strenth) {
              currentRow.push({
                  seatNo: globalSeatCounter,
                  batch: currentBatch.B_name,
                  rollNo: batchRollNumbers[currentBatch.B_name]
              });
              
              batchRollNumbers[currentBatch.B_name]++;
              remainingCapacity--;
              globalSeatCounter++;
              
              batchIndex = (batchIndex + 1) % shuffledBatches.length;
              
              // Start new row after processing all batches
              if (batchIndex === 0 || currentRow.length === shuffledBatches.length) {
                  arrangement[roomCode].seatMatrix.push([...currentRow]);
                  currentRow = [];
              }
          } else {
              batchIndex = (batchIndex + 1) % shuffledBatches.length;
              if (batchIndex === 0) {
                  if (currentRow.length > 0) {
                      arrangement[roomCode].seatMatrix.push([...currentRow]);
                  }
                  break;
              }
          }
      }
      
      // Push any remaining seats in the last row
      if (currentRow.length > 0) {
          arrangement[roomCode].seatMatrix.push(currentRow);
      }
      
      // Update end roll numbers in summary
      shuffledBatches.forEach(batch => {
          summary[roomCode][batch.B_name].end = 
              batchRollNumbers[batch.B_name] - 1;
      });
  });
  
  return { arrangement, summary };
}

// Updated PDF generation function
function generateSeatingPDF(doc, { arrangement, summary }) {
  // Add title
  doc.fontSize(24).text('Examination Seating Arrangement', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(new Date().toLocaleDateString(), { align: 'center' });
  doc.moveDown(2);
  
  // Summary section
  doc.fontSize(18).text('Room-wise Summary', { underline: true });
  doc.moveDown();
  
  Object.entries(summary).forEach(([roomCode, batchRanges]) => {
      doc.fontSize(14).text(`Room ${roomCode}`);
      doc.moveDown(0.5);
      
      Object.entries(batchRanges).forEach(([batch, range]) => {
          if (range.end >= range.start) {
              doc.fontSize(12)
                 .text(`${batch}: Roll Numbers ${range.start} - ${range.end}`);
          }
      });
      doc.moveDown();
  });
  
  // Detailed seating arrangements (one room per page)
  Object.entries(arrangement).forEach(([roomCode, roomData]) => {
      doc.addPage();
      
      // Room header
      doc.fontSize(18).text(`Room ${roomCode} - Seating Arrangement`, { 
          align: 'center',
          underline: true 
      });
      doc.moveDown(2);
      
      // Batch headers
      const batchHeaders = Object.keys(summary[roomCode]);
      let xPos = 100;
      batchHeaders.forEach(header => {
          doc.text(header, xPos, doc.y);
          xPos += 120;
      });
      doc.moveDown();
      
      // Seat matrix with sequential seat numbers
      roomData.seatMatrix.forEach(row => {
          const rowY = doc.y;
          let xPos = 100;
          
          row.forEach(seat => {
              if (seat) {
                  doc.text(
                      `${seat.seatNo}   ${seat.rollNo}`,
                      xPos,
                      rowY
                  );
              }
              xPos += 120;
          });
          doc.moveDown();
      });
  });
}



// NOTIFY MESSAGE ,PDF,OTHER DATA UPLOAD TO msg SCHEMA

const pdfSchema=new mongoose.Schema({
  filename:String,
  data:String,
  from:String,
  to:String,
});

const pdfmodel=mongoose.model("PDF",pdfSchema,"pdfs")

// Multer Middleware for Handling File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload",upload.single("pdfFile"),async (req,res)=>{
  try {
    console.log(req.file)
      if(!req.file)
        return res.status(400).json({message:"no file uploaded"})
      const base64dta=req.file.buffer.toString("base64")
      const from=req.body.from
      const to=req.body.to
      
      const newpdf=new pdfmodel({
        filename:req.file.originalname,
        data:base64dta,
        from:from,
        to:to
      });
      await newpdf.save();
      res.status(200).json({success:true,to})
  } catch (error) {
      res.status(400).json({success:false})
  }
})
app.listen(4000, () => console.log("Listening on port 4000..."));


// INVIGILATION DUTY ALLOCATION

// Get faculties for duty allocation dropdown
app.get("/api/duty/faculty", async (req, res) => {
  try {
    // Fetch users who have "faculty" as one of their roles
    const faculties = await user.find({ U_role: { $in: ["FC"] } }, { U_name: 1, _id: 0 });
    res.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ error: "Error fetching faculties" });
  }
});

// Get rooms for invigilation duty allocation dropdown
app.get("/api/duty/rooms", async (req, res) => {
  try {
    // Fetch all room codes
    const rooms = await room.find({}, "R_code");
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Error fetching rooms" });
  }
});

// Generate and return invigilation duty allocation
app.post("/api/generate-invigilation", async (req, res) => {
  try {
    const { selectedFaculties, selectedRooms } = req.body;

    if (!selectedFaculties || !selectedRooms || selectedFaculties.length === 0 || selectedRooms.length === 0) {
      return res.status(400).json({ error: "Please select at least one faculty and one room" });
    }

    // Generate a simple text-based invigilation duty allocation
    let allocationText = "Invigilation Duty Allocation:\n";
    selectedFaculties.forEach((faculty, index) => {
      const roomCode = selectedRooms[index % selectedRooms.length]; // Assign faculty to rooms evenly
      allocationText += `${faculty} → ${roomCode}\n`;
    });

    // Convert the allocation text to a downloadable text file
    res.setHeader("Content-Disposition", `attachment; filename=invigilation-duty.txt`);
    res.setHeader("Content-Type", "text/plain");
    res.send(allocationText);
  } catch (error) {
    console.error("Error generating invigilation duty allocation:", error);
    res.status(500).json({ error: "Error generating invigilation duty allocation" });
  }
});
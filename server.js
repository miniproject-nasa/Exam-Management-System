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

// ------------------- SUBJECT MANAGEMENT -------------------
const subjectSchema = new mongoose.Schema({
  S_name: String,
  S_code: String,
  S_batch: [String],
  S_faculty: [String],
});
const Subject = mongoose.model("Subject", subjectSchema, "subjects");

app.post("/add-subject", async (req, res) => {
  try {
    const { S_name, S_code, S_batch, S_faculty } = req.body;
    const existingSubject = await Subject.findOne({ S_code });
    if (existingSubject) {
      return res.status(400).json({ error: "Subject code already exists" });
    }
    const newSubject = new Subject({ S_name, S_code, S_batch, S_faculty });
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

app.put("/update-subject/:S_code", async (req, res) => {
  try {
    const { S_code } = req.params;
    const { S_name, S_batch, S_faculty } = req.body;
    const updatedSubject = await Subject.findOneAndUpdate(
      { S_code },
      { S_name, S_batch, S_faculty },
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

// ------------------- ROOM MANAGEMENT -------------------
const roomSchema = new mongoose.Schema({
  R_code: String,
  R_capacity: String,
});
const room = mongoose.model("room", roomSchema, "rooms");

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

// ------------------- USER MANAGEMENT -------------------
const userSchema = new mongoose.Schema({
  U_name: String,
  U_id: String,
  U_phone: String,
  U_email: String,
  U_role: [String],
  U_password: String,
});
const user = mongoose.model("user", userSchema, "users");

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
    res
      .status(404)
      .json({ error: "Failed to add user", details: error.message });
  }
});

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

// ------------------- LOGIN API -------------------
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 },
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

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ------------------- MODULE MANAGEMENT -------------------
const moduleSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  moduleCoordinator: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  faculties: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});
const Module = mongoose.model("Module", moduleSchema, "modules");

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

app.put("/api/modules/:id", async (req, res) => {
  try {
    const { moduleName, moduleCoordinator, subjects, faculties } = req.body;
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { moduleName, moduleCoordinator, subjects, faculties },
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

// GET a single module by ID
app.get("/api/modules/:id", async (req, res) => {
  try {
    const moduleData = await Module.findById(req.params.id);
    if (!moduleData) {
      return res.status(404).json({ error: "Module not found" });
    }
    res.status(200).json(moduleData);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch module", details: error.message });
  }
});

// ------------------- BATCH MANAGEMENT -------------------
const batchSchema = new mongoose.Schema({
  B_id: String,
  B_name: String,
  B_strenth: String,
});
const batch = mongoose.model("batch", batchSchema, "batches");

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

app.post("/add-batch", async (req, res) => {
  try {
    const { B_id, B_name, B_strenth } = req.body;
    const newBatch = new batch({ B_id, B_name, B_strenth });
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
// ------------------- SEATING ARRANGEMENT -------------------
// Use pdf-lib instead of pdfkit
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

// GET batches for seating dropdown
app.get("/api/seating/batches", async (req, res) => {
  try {
    const batches = await batch.find({}, "B_name B_strenth");
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching batches" });
  }
});

// GET rooms for seating dropdown
app.get("/api/seating/rooms", async (req, res) => {
  try {
    const rooms = await room.find({}, "R_code R_capacity");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Error fetching rooms" });
  }
});

// -------------- HELPER: Shuffle Array --------------
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// -------------- HELPER: Split an Array into N Contiguous Chunks --------------
function chunkify(rollArr, nChunks) {
  const total = rollArr.length;
  const baseSize = Math.floor(total / nChunks);
  let remainder = total % nChunks;
  let chunks = [];
  let startIndex = 0;
  for (let i = 0; i < nChunks; i++) {
    let size = baseSize + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    const chunk = rollArr.slice(startIndex, startIndex + size);
    chunks.push(chunk);
    startIndex += size;
  }
  return chunks;
}

// -------------- HELPER: Format Roll Ranges --------------
function formatRollRange(rolls) {
  if (rolls.length === 0) return "-";
  rolls.sort((a, b) => a - b);
  let sequences = [];
  let currentSeq = [rolls[0]];
  for (let i = 1; i < rolls.length; i++) {
    if (rolls[i] === rolls[i - 1] + 1) {
      currentSeq.push(rolls[i]);
    } else {
      sequences.push([...currentSeq]);
      currentSeq = [rolls[i]];
    }
  }
  sequences.push(currentSeq);
  return sequences
    .map(seq => (seq.length === 1 ? seq[0] : `${seq[0]}-${seq[seq.length - 1]}`))
    .join(" || ");
}

// -------------- ADJUSTED SEATING-ASSIGNMENT LOGIC --------------
function generateSeatingArrangement(batches, rooms) {
  // 1) Randomize the order of rooms
  let shuffledRooms = shuffleArray([...rooms]);

  // 2) Build sequential roll arrays for each batch
  let batchRollArrays = {};
  batches.forEach(batch => {
    const strength = parseInt(batch.B_strenth, 10);
    let arr = [];
    for (let i = 1; i <= strength; i++) {
      arr.push(i);
    }
    batchRollArrays[batch.B_name] = arr;
  });

  // 3) Decide which rooms each batch can use (store in batchRoomsMap)
  let batchRoomsMap = {};
  batches.forEach(batch => {
    batchRoomsMap[batch.B_name] = [];
  });
  shuffledRooms.forEach(room => {
    let availableBatches = batches.filter(b =>
      batchRollArrays[b.B_name].length > 0 &&
      !batchRoomsMap[b.B_name].includes(room.R_code)
    );
    if (availableBatches.length === 0) return;
    availableBatches = shuffleArray(availableBatches);
    availableBatches.forEach(batch => {
      batchRoomsMap[batch.B_name].push(room.R_code);
    });
  });

  // 4) Build chunk-based blocks for summary.
  //    arrangementBlocks[roomCode] = [ { batch, block: [rollNos] }, ... ]
  let arrangementBlocks = {};
  rooms.forEach(r => {
    arrangementBlocks[r.R_code] = [];
  });
  batches.forEach(batch => {
    const bName = batch.B_name;
    const rolls = batchRollArrays[bName];
    const assignedRooms = batchRoomsMap[bName];
    if (!assignedRooms || assignedRooms.length === 0) return;
    const chunks = chunkify(rolls, assignedRooms.length);
    const shuffledRoomCodes = shuffleArray([...assignedRooms]);
    chunks.forEach((chunk, i) => {
      const roomCode = shuffledRoomCodes[i];
      arrangementBlocks[roomCode].push({ batch: bName, block: chunk });
    });
  });

  // 5) Build the detailed seating arrangement (seat matrix) per room.
  let arrangement = {};
  let summary = {};

  // Helper: build an interleaved seat matrix that fills room capacity if possible.
  function buildInterleavedSeatMatrix(blocks, roomCapacity) {
    // Prepare round-robin copies of each block.
    let chunkCopies = blocks.map(obj => ({
      batch: obj.batch,
      rolls: [...obj.block],
      index: 0
    }));
    let seats = [];
    let totalSeatsAssigned = 0;
    
    // First round: fill by round-robin.
    while (totalSeatsAssigned < roomCapacity && chunkCopies.some(c => c.index < c.rolls.length)) {
      for (let i = 0; i < chunkCopies.length; i++) {
        let c = chunkCopies[i];
        if (c.index < c.rolls.length && totalSeatsAssigned < roomCapacity) {
          seats.push({ batch: c.batch, rollNo: c.rolls[c.index] });
          c.index++;
          totalSeatsAssigned++;
          if (totalSeatsAssigned >= roomCapacity) break;
        }
      }
    }
    
    // Second round (optional): if room still not full but some batches still have unassigned roll numbers,
    // you could try to pull additional seats. (Be aware that this may break the contiguous range summary.)
    // Uncomment the following block if you want to attempt filling extra capacity.
    /*
    while (totalSeatsAssigned < roomCapacity && chunkCopies.some(c => c.index < c.rolls.length)) {
      for (let i = 0; i < chunkCopies.length; i++) {
        let c = chunkCopies[i];
        if (c.index < c.rolls.length && totalSeatsAssigned < roomCapacity) {
          seats.push({ batch: c.batch, rollNo: c.rolls[c.index] });
          c.index++;
          totalSeatsAssigned++;
          if (totalSeatsAssigned >= roomCapacity) break;
        }
      }
    }
    */

    seats.forEach((seat, idx) => { seat.seatNo = idx + 1; });

    // Build rows to avoid having the same first-two-character group in the same row.
    let seatMatrix = [];
    let currentRow = [];
    let usedGroups = new Set();
    seats.forEach(seat => {
      const group = seat.batch.substring(0, 2);
      if (usedGroups.has(group)) {
        seatMatrix.push(currentRow);
        currentRow = [];
        usedGroups = new Set();
      }
      currentRow.push(seat);
      usedGroups.add(group);
    });
    if (currentRow.length > 0) seatMatrix.push(currentRow);
    return seatMatrix;
  }

  // Process each room.
  for (const room of rooms) {
    const roomCode = room.R_code;
    const blocks = arrangementBlocks[roomCode]; // blocks assigned to this room.
    const capacity = parseInt(room.R_capacity, 10);
    let seatMatrix = buildInterleavedSeatMatrix(blocks, capacity);

    arrangement[roomCode] = { capacity: room.R_capacity, seatMatrix };

    // Build summary from the blocks (using the original contiguous chunks)
    let roomSummaryMap = {};
    batches.forEach(b => { roomSummaryMap[b.B_name] = []; });
    blocks.forEach(({ batch, block }) => {
      roomSummaryMap[batch].push(...block);
    });
    let processedSummary = {};
    batches.forEach(b => {
      processedSummary[b.B_name] = formatRollRange(roomSummaryMap[b.B_name]);
    });
    summary[roomCode] = processedSummary;
  }

  return { arrangement, summary };
}



// -------------- HELPER: Build Rows for Front Page Table --------------
function buildFrontPageRows(summaryObject, orderedBatchNames) {
  const roomCodes = Object.keys(summaryObject); 
  let rows = [];
  let slNo = 1;

  for (const batchName of orderedBatchNames) {
    let chunkList = [];

    // Gather all roll-range chunks from each room
    for (const roomCode of roomCodes) {
      const rangeString = summaryObject[roomCode][batchName];
      if (rangeString && rangeString !== "-") {
        // e.g. "1-24 || 25-45"
        const ranges = rangeString.split(" || ");
        for (const r of ranges) {
          chunkList.push({ rollRange: r, room: roomCode });
        }
      }
    }

    // Sort chunks to ensure roll numbers appear in ascending order
    chunkList.sort((a, b) => {
      const aStart = parseInt(a.rollRange.split('-')[0]);
      const bStart = parseInt(b.rollRange.split('-')[0]);
      return aStart - bStart;
    });

    // Print the first chunk with SlNo & Class, subsequent chunks get blank in those columns
    let firstLine = true;
    chunkList.forEach(({ rollRange, room }) => {
      if (firstLine) {
        rows.push({
          slNo,
          className: batchName,
          rollRange,
          room,
        });
        firstLine = false;
      } else {
        rows.push({
          slNo: "",
          className: "",
          rollRange,
          room,
        });
      }
    });

    // Only increment SlNo if we actually assigned something to this batch
    if (chunkList.length > 0) {
      slNo++;
    }
  }

  return rows;
}

async function generateSeatingPDF({ arrangement, summary }, examName, examDate) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // ---------------------------
  // 1) FIRST PAGE (SUMMARY)
  // ---------------------------
  let currentPage = pdfDoc.addPage();
  let { width, height } = currentPage.getSize();
  const margin = 50;
  let yPos = height - margin;

  // Helper to add a new page and reset yPos.
  function addNewPage() {
    currentPage = pdfDoc.addPage();
    const size = currentPage.getSize();
    width = size.width;
    height = size.height;
    yPos = height - margin;
  }

  // Heading section for summary
  const headingFontSize = 14;
  currentPage.drawText("Rajiv Gandhi Institute of Technology, Kottayam", {
    x: width / 2 - 180,
    y: yPos,
    size: headingFontSize,
    font: timesRomanFont,
  });
  yPos -= 20;
  currentPage.drawText("Department of Computer Science and Engineering", {
    x: width / 2 - 170,
    y: yPos,
    size: headingFontSize,
    font: timesRomanFont,
  });
  yPos -= 20;
  currentPage.drawText("B. Tech Computer Science and Engineering", {
    x: width / 2 - 150,
    y: yPos,
    size: headingFontSize,
    font: timesRomanFont,
  });
  yPos -= 20;
  currentPage.drawText(examName, {
    x: width / 2 - 150,
    y: yPos,
    size: headingFontSize,
    font: timesRomanFont,
  });
  yPos -= 20;
  currentPage.drawText("Seating Arrangement", {
    x: width / 2 - 80,
    y: yPos,
    size: headingFontSize,
    font: timesRomanFont,
  });
  yPos -= 20;
  currentPage.drawText(`Date: ${examDate}`, {
    x: width / 2 - 30,
    y: yPos,
    size: 12,
    font: timesRomanFont,
  });
  yPos -= 40;

  // --- SUMMARY TABLE ---
  // Define column widths and use their sum for table width.
  const colWidths = [80, 100, 150, 150]; // SI No, Class, Roll No, Classroom
  const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);

  // Draw header row borders
  currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin + tableWidth, y: yPos }, thickness: 1 });
  currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin, y: yPos - 40 }, thickness: 1 });
  let xPos = margin;
  for (const colWidth of colWidths) {
    xPos += colWidth;
    currentPage.drawLine({ start: { x: xPos, y: yPos }, end: { x: xPos, y: yPos - 40 }, thickness: 1 });
  }
  currentPage.drawLine({ start: { x: margin, y: yPos - 40 }, end: { x: margin + tableWidth, y: yPos - 40 }, thickness: 1 });

  // Table header text
  const headerY = yPos - 25;
  currentPage.drawText("SI No", { x: margin + 25, y: headerY, size: 12, font: timesRomanFont });
  currentPage.drawText("Class", { x: margin + colWidths[0] + 30, y: headerY, size: 12, font: timesRomanFont });
  currentPage.drawText("Roll No", { x: margin + colWidths[0] + colWidths[1] + 35, y: headerY, size: 12, font: timesRomanFont });
  currentPage.drawText("Classroom", { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + 35, y: headerY, size: 12, font: timesRomanFont });

  yPos -= 40; // Move down for table content

  // Build summary data grouping by batch name.
  const batchSummary = {};
  for (const [roomCode, batchRanges] of Object.entries(summary)) {
    for (const [batchName, rangeStr] of Object.entries(batchRanges)) {
      if (!batchSummary[batchName]) {
        batchSummary[batchName] = [];
      }
      batchSummary[batchName].push({ roomCode, range: rangeStr });
    }
  }

  // Draw summary table rows (using a reduced row height for compactness)
  let slNo = 1;
  const rowHeight = 25; // slightly reduced from 30
  for (const [batchName, roomRanges] of Object.entries(batchSummary)) {
    for (const { roomCode, range } of roomRanges) {
      currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin, y: yPos - rowHeight }, thickness: 1 });
      currentPage.drawText(String(slNo), { x: margin + 25, y: yPos - 15, size: 12, font: timesRomanFont });
      currentPage.drawText(batchName, { x: margin + colWidths[0] + 30, y: yPos - 15, size: 12, font: timesRomanFont });
      currentPage.drawText(range, { x: margin + colWidths[0] + colWidths[1] + 35, y: yPos - 15, size: 12, font: timesRomanFont });
      currentPage.drawText(roomCode, { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + 45, y: yPos - 15, size: 12, font: timesRomanFont });
      
      xPos = margin + colWidths[0];
      currentPage.drawLine({ start: { x: xPos, y: yPos }, end: { x: xPos, y: yPos - rowHeight }, thickness: 1 });
      xPos += colWidths[1];
      currentPage.drawLine({ start: { x: xPos, y: yPos }, end: { x: xPos, y: yPos - rowHeight }, thickness: 1 });
      xPos += colWidths[2];
      currentPage.drawLine({ start: { x: xPos, y: yPos }, end: { x: xPos, y: yPos - rowHeight }, thickness: 1 });
      xPos += colWidths[3];
      currentPage.drawLine({ start: { x: xPos, y: yPos }, end: { x: xPos, y: yPos - rowHeight }, thickness: 1 });
      
      currentPage.drawLine({ start: { x: margin, y: yPos - rowHeight }, end: { x: margin + tableWidth, y: yPos - rowHeight }, thickness: 1 });
      
      yPos -= rowHeight;
      slNo++;
      
      if (yPos < margin + 50) {
        addNewPage();
        yPos = height - margin - 40;
        currentPage.drawLine({ start: { x: margin, y: yPos + 40 }, end: { x: margin + tableWidth, y: yPos + 40 }, thickness: 1 });
        xPos = margin;
        currentPage.drawLine({ start: { x: xPos, y: yPos + 40 }, end: { x: xPos, y: yPos }, thickness: 1 });
        for (const colWidth of colWidths) {
          xPos += colWidth;
          currentPage.drawLine({ start: { x: xPos, y: yPos + 40 }, end: { x: xPos, y: yPos }, thickness: 1 });
        }
        currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin + tableWidth, y: yPos }, thickness: 1 });
        const headerY = yPos + 15;
        currentPage.drawText("SI No", { x: margin + 25, y: headerY, size: 12, font: timesRomanFont });
        currentPage.drawText("Class", { x: margin + colWidths[0] + 30, y: headerY, size: 12, font: timesRomanFont });
        currentPage.drawText("Roll No", { x: margin + colWidths[0] + colWidths[1] + 35, y: headerY, size: 12, font: timesRomanFont });
        currentPage.drawText("Classroom", { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + 35, y: headerY, size: 12, font: timesRomanFont });
      }
    }
  }

  // -------------------------------
  // 2) DETAILED SEATING (DETAILS)
  // -------------------------------
  // The detailed seating pages now use a similar boxed table system.
  // Spacing has been reduced to try to keep a room’s seating on one page.
  for (const [roomCode, roomData] of Object.entries(arrangement)) {
    addNewPage();
    yPos = height - margin;
    
    // Room header
    currentPage.drawText("Rajiv Gandhi Institute of Technology, Kottayam", {
      x: width / 2 - 180,
      y: yPos,
      size: headingFontSize,
      font: timesRomanFont,
    });
    yPos -= 25;
    currentPage.drawText("Department of Computer Science and Engineering", {
      x: width / 2 - 170,
      y: yPos,
      size: headingFontSize,
      font: timesRomanFont,
    });
    yPos -= 25;
    currentPage.drawText(`Room No. ${roomCode}`, {
      x: width / 2 - 60,
      y: yPos,
      size: 14,
      font: timesRomanFont,
    });
    yPos -= 40;
    
    // Group seats by batch from seatMatrix or assignments.
    const batchGroups = {};
    if (roomData.seatMatrix && roomData.seatMatrix.length > 0) {
      for (const row of roomData.seatMatrix) {
        for (const seat of row) {
          if (!batchGroups[seat.batch]) {
            batchGroups[seat.batch] = [];
          }
          batchGroups[seat.batch].push(seat);
        }
      }
    } else if (roomData.assignments && roomData.assignments.length > 0) {
      for (const seat of roomData.assignments) {
        if (!batchGroups[seat.batch]) {
          batchGroups[seat.batch] = [];
        }
        batchGroups[seat.batch].push(seat);
      }
    }
    
    // For each batch, draw a table.
    for (const [batchName, seats] of Object.entries(batchGroups)) {
      seats.sort((a, b) => a.rollNo - b.rollNo);
      currentPage.drawText(batchName, { x: margin, y: yPos, size: 12, font: timesRomanFont });
      yPos -= 20; // reduced gap before table
      
      // Decide layout: use double column if more than 10 seats.
      const useDoubleColumn = seats.length > 10;
      const colWidth = 90; // cell width per column
      let tableWidth;
      if (useDoubleColumn) {
        tableWidth = 4 * colWidth;
      } else {
        tableWidth = 2 * colWidth;
      }
      
      // Draw table header borders (top row)
      currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin + tableWidth, y: yPos }, thickness: 1 });
      currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin, y: yPos - 30 }, thickness: 1 });
      if (useDoubleColumn) {
        currentPage.drawLine({ start: { x: margin + colWidth, y: yPos }, end: { x: margin + colWidth, y: yPos - 30 }, thickness: 1 });
        currentPage.drawLine({ start: { x: margin + 2 * colWidth, y: yPos }, end: { x: margin + 2 * colWidth, y: yPos - 30 }, thickness: 1 });
        currentPage.drawLine({ start: { x: margin + 3 * colWidth, y: yPos }, end: { x: margin + 3 * colWidth, y: yPos - 30 }, thickness: 1 });
        currentPage.drawLine({ start: { x: margin + 4 * colWidth, y: yPos }, end: { x: margin + 4 * colWidth, y: yPos - 30 }, thickness: 1 });
      } else {
        currentPage.drawLine({ start: { x: margin + colWidth, y: yPos }, end: { x: margin + colWidth, y: yPos - 30 }, thickness: 1 });
        currentPage.drawLine({ start: { x: margin + 2 * colWidth, y: yPos }, end: { x: margin + 2 * colWidth, y: yPos - 30 }, thickness: 1 });
      }
      currentPage.drawLine({ start: { x: margin, y: yPos - 30 }, end: { x: margin + tableWidth, y: yPos - 30 }, thickness: 1 });
      
      const headerY = yPos - 20;
      currentPage.drawText("Seat No.", { x: margin + 15, y: headerY, size: 12, font: timesRomanFont });
      currentPage.drawText("Roll No.", { x: margin + colWidth + 15, y: headerY, size: 12, font: timesRomanFont });
      if (useDoubleColumn) {
        currentPage.drawText("Seat No.", { x: margin + 2 * colWidth + 15, y: headerY, size: 12, font: timesRomanFont });
        currentPage.drawText("Roll No.", { x: margin + 3 * colWidth + 15, y: headerY, size: 12, font: timesRomanFont });
      }
      
      yPos -= 30;
      // Use a slightly reduced row height for detailed seating
      const rowHeight = 20;
      let firstColumnItems, secondColumnItems;
      if (useDoubleColumn) {
        const halfLength = Math.ceil(seats.length / 2);
        firstColumnItems = seats.slice(0, halfLength);
        secondColumnItems = seats.slice(halfLength);
      } else {
        firstColumnItems = seats;
        secondColumnItems = [];
      }
      
      const maxRows = Math.max(firstColumnItems.length, secondColumnItems.length);
      for (let i = 0; i < maxRows; i++) {
        currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin, y: yPos - rowHeight }, thickness: 1 });
        if (i < firstColumnItems.length) {
          const seat = firstColumnItems[i];
          currentPage.drawText(String(seat.seatNo || "-"), { x: margin + 15, y: yPos - 15, size: 12, font: timesRomanFont });
          currentPage.drawText(String(seat.rollNo || "-"), { x: margin + colWidth + 15, y: yPos - 15, size: 12, font: timesRomanFont });
        }
        if (useDoubleColumn) {
          currentPage.drawLine({ start: { x: margin + colWidth, y: yPos }, end: { x: margin + colWidth, y: yPos - rowHeight }, thickness: 1 });
        }
        if (useDoubleColumn) {
          if (i < secondColumnItems.length) {
            const seat = secondColumnItems[i];
            currentPage.drawText(String(seat.seatNo || "-"), { x: margin + 2 * colWidth + 15, y: yPos - 15, size: 12, font: timesRomanFont });
            currentPage.drawText(String(seat.rollNo || "-"), { x: margin + 3 * colWidth + 15, y: yPos - 15, size: 12, font: timesRomanFont });
          }
          currentPage.drawLine({ start: { x: margin + 2 * colWidth, y: yPos }, end: { x: margin + 2 * colWidth, y: yPos - rowHeight }, thickness: 1 });
          currentPage.drawLine({ start: { x: margin + 3 * colWidth, y: yPos }, end: { x: margin + 3 * colWidth, y: yPos - rowHeight }, thickness: 1 });
          currentPage.drawLine({ start: { x: margin + 4 * colWidth, y: yPos }, end: { x: margin + 4 * colWidth, y: yPos - rowHeight }, thickness: 1 });
        } else {
          currentPage.drawLine({ start: { x: margin + 2 * colWidth, y: yPos }, end: { x: margin + 2 * colWidth, y: yPos - rowHeight }, thickness: 1 });
        }
        currentPage.drawLine({ start: { x: margin, y: yPos - rowHeight }, end: { x: margin + tableWidth, y: yPos - rowHeight }, thickness: 1 });
        yPos -= rowHeight;
        
        if (yPos < margin + 50 && i < maxRows - 1) {
          addNewPage();
          yPos = height - margin;
          currentPage.drawText("Rajiv Gandhi Institute of Technology, Kottayam", {
            x: width / 2 - 180,
            y: yPos,
            size: headingFontSize,
            font: timesRomanFont,
          });
          yPos -= 25;
          currentPage.drawText("Department of Computer Science and Engineering", {
            x: width / 2 - 170,
            y: yPos,
            size: headingFontSize,
            font: timesRomanFont,
          });
          yPos -= 25;
          currentPage.drawText(`Room No. ${roomCode} - ${batchName} (continued)`, {
            x: width / 2 - 120,
            y: yPos,
            size: 14,
            font: timesRomanFont,
          });
          yPos -= 40;
          currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin + tableWidth, y: yPos }, thickness: 1 });
          currentPage.drawLine({ start: { x: margin, y: yPos }, end: { x: margin, y: yPos - 30 }, thickness: 1 });
          if (useDoubleColumn) {
            currentPage.drawLine({ start: { x: margin + colWidth, y: yPos }, end: { x: margin + colWidth, y: yPos - 30 }, thickness: 1 });
            currentPage.drawLine({ start: { x: margin + 2 * colWidth, y: yPos }, end: { x: margin + 2 * colWidth, y: yPos - 30 }, thickness: 1 });
            currentPage.drawLine({ start: { x: margin + 3 * colWidth, y: yPos }, end: { x: margin + 3 * colWidth, y: yPos - 30 }, thickness: 1 });
            currentPage.drawLine({ start: { x: margin + 4 * colWidth, y: yPos }, end: { x: margin + 4 * colWidth, y: yPos - 30 }, thickness: 1 });
          } else {
            currentPage.drawLine({ start: { x: margin + colWidth, y: yPos }, end: { x: margin + colWidth, y: yPos - 30 }, thickness: 1 });
            currentPage.drawLine({ start: { x: margin + 2 * colWidth, y: yPos }, end: { x: margin + 2 * colWidth, y: yPos - 30 }, thickness: 1 });
          }
          currentPage.drawLine({ start: { x: margin, y: yPos - 30 }, end: { x: margin + tableWidth, y: yPos - 30 }, thickness: 1 });
          const headerY = yPos - 20;
          currentPage.drawText("Seat No.", { x: margin + 15, y: headerY, size: 12, font: timesRomanFont });
          currentPage.drawText("Roll No.", { x: margin + colWidth + 15, y: headerY, size: 12, font: timesRomanFont });
          if (useDoubleColumn) {
            currentPage.drawText("Seat No.", { x: margin + 2 * colWidth + 15, y: headerY, size: 12, font: timesRomanFont });
            currentPage.drawText("Roll No.", { x: margin + 3 * colWidth + 15, y: headerY, size: 12, font: timesRomanFont });
          }
          yPos -= 30;
        }
      }
      
      yPos -= 20; // reduced gap between batch tables
      if (yPos < margin + 50) {
        addNewPage();
        yPos = height - margin;
      }
    }
  }

  // Finalize and return PDF bytes
  return await pdfDoc.save();
}



// -------------- EXPRESS ROUTE --------------
app.post("/api/generate-seating", async (req, res) => {
  try {
    const { selectedBatches, selectedRooms, examDate, examName } = req.body;

    // 1) Fetch batch and room details from the DB
    const batchDetails = await batch.find({ B_name: { $in: selectedBatches } });
    const roomDetails = await room.find({ R_code: { $in: selectedRooms } });

    // 2) Capacity check
    const totalStudents = batchDetails.reduce(
      (sum, b) => sum + parseInt(b.B_strenth, 10),
      0
    );
    const totalCapacity = roomDetails.reduce(
      (sum, r) => sum + parseInt(r.R_capacity, 10),
      0
    );
    if (totalCapacity < totalStudents) {
      return res
        .status(400)
        .json({ error: "Insufficient room capacity to seat all students." });
    }

    // 3) Generate arrangement
    const seatingArrangement = generateSeatingArrangement(batchDetails, roomDetails);
    
    // 4) Decide the order of batches for the front-page table
    const orderedBatchNames = selectedBatches;

    // 5) Generate PDF (front page + seat-by-seat)
    const pdfBytes = await generateSeatingPDF(
      seatingArrangement,
      examDate,
      examName,
      orderedBatchNames
    );

    // 6) Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=seating-arrangement-${examDate}.pdf`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating seating arrangement:", error);
    res.status(500).json({ error: "Error generating seating arrangement" });
  }
});

// ------------------- PDF UPLOAD & NOTIFICATION -------------------
const pdfSchema = new mongoose.Schema({
  filename: String,
  data: String,
  from: String,
  to: String,
});
const pdfmodel = mongoose.model("PDF", pdfSchema, "pdfs");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) return res.status(400).json({ message: "no file uploaded" });
    const base64dta = req.file.buffer.toString("base64");
    const from = req.body.from;
    const to = req.body.to;
    const newpdf = new pdfmodel({
      filename: req.file.originalname,
      data: base64dta,
      from: from,
      to: to,
    });
    await newpdf.save();
    res.status(200).json({ success: true, to });
  } catch (error) {
    res.status(400).json({ success: false });
  }
});

// ------------------- INVIGILATION DUTY ALLOCATION -------------------

const path = require('path');
const { generateInvigilationPDF } = require(path.join(__dirname, 'pdfGenerator.js'));

app.get("/api/duty/faculty", async (req, res) => {
  try {
    const faculties = await user.find(
      { U_role: { $in: ["FC"] } },
      { U_name: 1, _id: 0 }
    );
    res.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ error: "Error fetching faculties" });
  }
});

app.get("/api/duty/rooms", async (req, res) => {
  try {
    const rooms = await room.find({}, "R_code");
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Error fetching rooms" });
  }
});

app.post("/api/generate-invigilation", async (req, res) => {
  try {
    const { selectedFaculties, selectedRooms, dutyDate } = req.body;

    if (!selectedFaculties || !selectedRooms || selectedFaculties.length === 0 || selectedRooms.length === 0) {
      return res.status(400).json({ error: "Please select at least one faculty and one room" });
    }

    // Generate PDF
    const pdfBytes = await generateInvigilationPDF(selectedFaculties, selectedRooms, dutyDate);

    // Send the PDF as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invigilation-duty-${dutyDate}.pdf`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating invigilation duty allocation:", error);
    res.status(500).json({ error: "Error generating invigilation duty allocation" });
  }
});

app.listen(4000, () => console.log("Listening on port 4000..."));

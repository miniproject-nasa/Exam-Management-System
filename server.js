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
// -------------- FUNCTION: Build Front Page Rows --------------
// (Your earlier provided function, integrated here.)
function buildFrontPageRows(summaryObject) {
  const tableData = [];
  let serialNo = 1;
  const roomCodes = Object.keys(summaryObject);

  // Collect all batch names from summary data
  const batches = new Set();
  roomCodes.forEach(room => {
    Object.keys(summaryObject[room]).forEach(batch => {
      batches.add(batch);
    });
  });

  // Process each batch in the order they appear (or you can sort them as needed)
  batches.forEach(batchName => {
    let firstRow = true;
    roomCodes.forEach(roomCode => {
      if (summaryObject[roomCode][batchName]) {
        if (firstRow) {
          tableData.push({
            slNo: serialNo,
            className: batchName,
            rollRange: summaryObject[roomCode][batchName],
            room: roomCode,
          });
          firstRow = false;
        } else {
          tableData.push({
            slNo: "",
            className: "",
            rollRange: summaryObject[roomCode][batchName],
            room: roomCode,
          });
        }
      }
    });
    if (!firstRow) {
      serialNo++;
    }
  });

  return tableData;
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
      index: 0,
    }));
    let seats = [];
    let totalSeatsAssigned = 0;

    // Continuously cycle through chunkCopies until room is full.
    while (totalSeatsAssigned < roomCapacity) {
      let seatAssignedInCycle = false;
      for (let i = 0; i < chunkCopies.length && totalSeatsAssigned < roomCapacity; i++) {
        let c = chunkCopies[i];
        if (c.index < c.rolls.length) {
          seats.push({ batch: c.batch, rollNo: c.rolls[c.index] });
          c.index++;
          totalSeatsAssigned++;
          seatAssignedInCycle = true;
        }
      }
      // Break if no seat was assigned in a full cycle (to avoid infinite loop)
      if (!seatAssignedInCycle) break;
    }

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

// ------------------- PDF GENERATION -------------------
// Generate PDF with pdf-lib using the updated structure and naming
async function generateSeatingPDF(seatingArrangement, examName, examDate) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ----- Helper functions -----
  // Add a new page and return it
  function addNewPage() {
    return pdfDoc.addPage();
  }

  // Draw header for a page and return the updated y position
// ----- Helper function: Draw header for a page -----
// Now accepts a third parameter `includeInstitutionHeader` (default true)
function drawPageHeader(page, title = "", includeInstitutionHeader = true) {
  const { width, height } = page.getSize();
  let yPos = height - 50;
  const leftMargin = 50;

  // Draw institution header only if required.
  if (includeInstitutionHeader) {
    const lines = [
      "Rajiv Gandhi Institute of Technology, Kottayam",
      "Department of Computer Science and Engineering",
      "B. Tech Computer Science and Engineering",
    ];
    lines.forEach((line) => {
      page.drawText(line, {
        x: leftMargin,
        y: yPos,
        size: 12,
        font: helveticaBold,
      });
      yPos -= 20;
    });
  }

  // Draw title.
  yPos -= 10;
  page.drawText(title || "Seating Arrangement", {
    x: leftMargin,
    y: yPos,
    size: 14,
    font: helveticaBold,
  });
  yPos -= 20;

  // Draw exam name if provided.
  if (examName) {
    page.drawText(examName, {
      x: leftMargin,
      y: yPos,
      size: 12,
      font: helvetica,
    });
    yPos -= 20;
  }

  // Draw date.
  const dateString = examDate || new Date().toLocaleDateString();
  page.drawText(`Date: ${dateString}`, {
    x: leftMargin,
    y: yPos,
    size: 12,
    font: helvetica,
  });
  yPos -= 30;

  return yPos;
}


  // Draw a table row with cell borders and return the new y position
  function drawTableRow(page, y, values, columnWidths, rowHeight, font, isHeader = false) {
    let x = 50; // Left margin
    const borderWidth = 0.5;
    const padding = 5;
    const textSize = isHeader ? 11 : 10;

    for (let i = 0; i < values.length; i++) {
      // Draw cell border
      page.drawRectangle({
        x,
        y: y - rowHeight,
        width: columnWidths[i],
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth,
        color: isHeader ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1),
      });

      // Draw cell text
      page.drawText(values[i] || "", {
        x: x + padding,
        y: y - rowHeight + padding,
        size: textSize,
        font,
      });

      x += columnWidths[i];
    }

    return y - rowHeight;
  }

  // ----- 1. SUMMARY PAGE -----
  let currentPage = addNewPage();
  let currentY = drawPageHeader(currentPage);

  // Define summary table headers and column widths
  const summaryColumnWidths = [40, 100, 120, 120]; // S.No, Class, Roll No, Classroom
  const summaryHeaders = ["S. No", "Class", "Roll No", "Classroom"];
  const rowHeight = 20;

  // Draw summary table header row
  currentY = drawTableRow(currentPage, currentY, summaryHeaders, summaryColumnWidths, rowHeight, helveticaBold, true);

  // Build table data from the summary object using buildFrontPageRows
  const tableData = buildFrontPageRows(seatingArrangement.summary);

  // Draw each summary row
  tableData.forEach((rowData) => {
    const rowArray = [
      String(rowData.slNo),
      rowData.className,
      rowData.rollRange,
      rowData.room,
    ];

    // Start a new page if near the bottom
    if (currentY < 50) {
      currentPage = addNewPage();
      currentY = drawPageHeader(currentPage, "Seating Arrangement (continued)");
      currentY = drawTableRow(currentPage, currentY, summaryHeaders, summaryColumnWidths, rowHeight, helveticaBold, true);
    }

    currentY = drawTableRow(currentPage, currentY, rowArray, summaryColumnWidths, rowHeight, helvetica);
  });

  // ----- 2. DETAILED SEATING PAGES -----
  // For each room, create a detailed seating page
  Object.entries(seatingArrangement.arrangement).forEach(([roomCode, roomData]) => {
    currentPage = addNewPage();
    currentY = drawPageHeader(currentPage, `Room No. ${roomCode} - Detailed Seating`, false);

    // Group seats by batch from seatMatrix
    const batchGroups = {};
    if (roomData.seatMatrix && roomData.seatMatrix.length > 0) {
      roomData.seatMatrix.forEach(row => {
        row.forEach(seat => {
          if (!batchGroups[seat.batch]) {
            batchGroups[seat.batch] = [];
          }
          batchGroups[seat.batch].push(seat);
        });
      });
    }

    // For each batch in this room, render the detailed seating table
    Object.entries(batchGroups).forEach(([batchName, seats]) => {
      if (currentY < 100) {
        currentPage = addNewPage();
        currentY = drawPageHeader(currentPage, `Room No. ${roomCode} - Detailed Seating (continued)`, false);
      }

      // Batch header
      currentPage.drawText(batchName, {
        x: 50,
        y: currentY,
        size: 12,
        font: helveticaBold,
      });
      currentY -= 20;

      // Decide on single or double column layout based on the number of seats
      const useDoubleColumn = seats.length > 15;
      const seatColumnWidths = useDoubleColumn ? [60, 60, 60, 60] : [120, 120];
      const seatHeaders = useDoubleColumn
        ? ["Seat No.", "Roll No.", "Seat No.", "Roll No."]
        : ["Seat No.", "Roll No."];

      // Draw seating table header row for the batch
      currentY = drawTableRow(currentPage, currentY, seatHeaders, seatColumnWidths, rowHeight, helveticaBold, true);

      // Sort seats by roll number
      seats.sort((a, b) => a.rollNo - b.rollNo);

      if (useDoubleColumn) {
        // Split seats into two columns
        const halfLength = Math.ceil(seats.length / 2);
        const firstColumn = seats.slice(0, halfLength);
        const secondColumn = seats.slice(halfLength);
        const maxRows = Math.max(firstColumn.length, secondColumn.length);

        for (let i = 0; i < maxRows; i++) {
          if (currentY < 50) {
            currentPage = addNewPage();
            currentY = drawPageHeader(currentPage, `Room No. ${roomCode} - ${batchName} (continued)`);
            currentY = drawTableRow(currentPage, currentY, seatHeaders, seatColumnWidths, rowHeight, helveticaBold, true);
          }

          const rowValues = [];
          // First column data
          if (i < firstColumn.length) {
            rowValues.push(String(firstColumn[i].seatNo));
            rowValues.push(String(firstColumn[i].rollNo));
          } else {
            rowValues.push("");
            rowValues.push("");
          }
          // Second column data
          if (i < secondColumn.length) {
            rowValues.push(String(secondColumn[i].seatNo));
            rowValues.push(String(secondColumn[i].rollNo));
          } else {
            rowValues.push("");
            rowValues.push("");
          }

          currentY = drawTableRow(currentPage, currentY, rowValues, seatColumnWidths, rowHeight, helvetica);
        }
      } else {
        // Single column layout
        for (const seat of seats) {
          if (currentY < 50) {
            currentPage = addNewPage();
            currentY = drawPageHeader(currentPage, `Room No. ${roomCode} - ${batchName} (continued)`);
            currentY = drawTableRow(currentPage, currentY, seatHeaders, seatColumnWidths, rowHeight, helveticaBold, true);
          }
          currentY = drawTableRow(currentPage, currentY, [String(seat.seatNo), String(seat.rollNo)], seatColumnWidths, rowHeight, helvetica);
        }
      }

      currentY -= 20; // Space after each batch table
    });
  });

  // Return the PDF document as a buffer
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

    // 3) Generate seating arrangement
    const seatingArrangement = generateSeatingArrangement(batchDetails, roomDetails);

    // 4) Generate PDF with correct parameter order: seatingArrangement, examName, examDate
    const pdfBytes = await generateSeatingPDF(seatingArrangement, examName, examDate);

    // 5) Send PDF
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
    const { selectedFaculties, selectedRooms } = req.body;
    if (
      !selectedFaculties ||
      !selectedRooms ||
      selectedFaculties.length === 0 ||
      selectedRooms.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Please select at least one faculty and one room" });
    }
    let allocationText = "Invigilation Duty Allocation:\n";
    selectedFaculties.forEach((faculty, index) => {
      const roomCode = selectedRooms[index % selectedRooms.length];
      allocationText += `${faculty} → ${roomCode}\n`;
    });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invigilation-duty.txt`
    );
    res.setHeader("Content-Type", "text/plain");
    res.send(allocationText);
  } catch (error) {
    console.error("Error generating invigilation duty allocation:", error);
    res
      .status(500)
      .json({ error: "Error generating invigilation duty allocation" });
  }
});

app.listen(4000, () => console.log("Listening on port 4000..."));

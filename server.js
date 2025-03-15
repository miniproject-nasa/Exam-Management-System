const mongoose = require("mongoose");
const express = require("express");
const app = express();
const session = require("express-session");
const multer = require("multer");
const nodemailer = require("nodemailer");

// ______________________Connect to MongoDB_________________
mongoose
  .connect(
    "mongodb+srv://Examiner:Exam%40123@exammanagedb.2z5zb.mongodb.net/Exammanage"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// _________________Middleware______________________________
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

// _________________________ SUBJECT MANAGEMENT _________________________
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

// ______________________ROOM MANAGEMENT ______________________
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

// _________________________ USER MANAGEMENT ________________________
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

//________________________ LOGIN API________________________
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
          id: userfinal.U_id,
          username: userfinal.U_name,
          role: userfinal.U_role,
          pass: userfinal.U_password,
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

// _____________________CHANGE PASSWOD________________________
app.put("/update-password", async (req, res) => {
  const { id, password } = req.body;
  console.log(req.body);
  try {
    const olduser = await user.findOneAndUpdate(
      { U_id: id },
      { U_password: password },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
  if (!user)
    return res.status(400).json({ success: false, message: "user not found" });
  return res.status(200).json({ success: true, message: "updated" });
});

//____________________ MODULE MANAGEMENT _____________________
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

//________________________ BATCH MANAGEMENT ________________________
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
function buildFrontPageRows(summaryObject) {
  const tableData = [];
  let serialNo = 1;
  const roomCodes = Object.keys(summaryObject);

  // Collect all batch names from summary data
  const batches = new Set();
  roomCodes.forEach((room) => {
    Object.keys(summaryObject[room]).forEach((batch) => {
      batches.add(batch);
    });
  });

  // Process each batch in the order they appear
  batches.forEach((batchName) => {
    let firstRow = true;
    roomCodes.forEach((roomCode) => {
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
    .map((seq) =>
      seq.length === 1 ? seq[0] : `${seq[0]}-${seq[seq.length - 1]}`
    )
    .join(" || ");
}

// -------------- FUNCTION: Generate Seating Arrangement --------------
function generateSeatingArrangement(batchDetails, rooms) {
  const batches = [...batchDetails];
  const M = batches.length;
  let arrangement = {};
  rooms.forEach((r) => {
    const cap = parseInt(r.R_capacity, 10);
    let seats = [];
    for (let i = 1; i <= cap; i++) {
      seats.push({
        seatIndex: i,
        batch: null,
        rollNo: null,
      });
    }
    arrangement[r.R_code] = {
      capacity: cap,
      seats: seats,
    };
  });
  batches.forEach((batchObj, batchIndex) => {
    const k = batchIndex + 1;
    const bName = batchObj.B_name;
    let studentsLeft = parseInt(batchObj.B_strenth, 10);
    let nextRollNo = 1;
    const randomRoomOrder = shuffleArray([...rooms]);
    for (let roomObj of randomRoomOrder) {
      if (studentsLeft <= 0) break;
      const roomCode = roomObj.R_code;
      let seatArray = arrangement[roomCode].seats;
      for (let seatObj of seatArray) {
        if (studentsLeft <= 0) break;
        if (seatObj.batch === null) {
          const seatNum = seatObj.seatIndex;
          const seatBatchNum = ((seatNum - 1) % M) + 1;
          if (seatBatchNum === k) {
            seatObj.batch = bName;
            seatObj.rollNo = nextRollNo;
            nextRollNo++;
            studentsLeft--;
          }
        }
      }
    }
  });
  let finalArrangement = {};
  let summary = {};
  rooms.forEach((roomObj) => {
    const roomCode = roomObj.R_code;
    const seats = arrangement[roomCode].seats;
    const cap = arrangement[roomCode].capacity;
    for (let seatObj of seats) {
      seatObj.seatNo = seatObj.seatIndex;
    }
    const columns = 4;
    let seatMatrix = [];
    for (let i = 0; i < seats.length; i += columns) {
      seatMatrix.push(seats.slice(i, i + columns));
    }
    finalArrangement[roomCode] = {
      capacity: cap,
      seatMatrix: seatMatrix,
    };
    let summaryMap = {};
    batches.forEach((b) => {
      summaryMap[b.B_name] = [];
    });
    seats.forEach((seatObj) => {
      if (seatObj.batch && seatObj.rollNo !== null) {
        summaryMap[seatObj.batch].push(seatObj.rollNo);
      }
    });
    let processedSummary = {};
    Object.keys(summaryMap).forEach((bName) => {
      processedSummary[bName] = formatRollRange(summaryMap[bName]);
    });
    summary[roomCode] = processedSummary;
  });
  return { arrangement: finalArrangement, summary };
}

// ------------------- PDF GENERATION -------------------
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
  function drawTableRow(
    page,
    y,
    values,
    columnWidths,
    rowHeight,
    font,
    isHeader = false
  ) {
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
  currentY = drawTableRow(
    currentPage,
    currentY,
    summaryHeaders,
    summaryColumnWidths,
    rowHeight,
    helveticaBold,
    true
  );

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
      currentY = drawTableRow(
        currentPage,
        currentY,
        summaryHeaders,
        summaryColumnWidths,
        rowHeight,
        helveticaBold,
        true
      );
    }

    currentY = drawTableRow(
      currentPage,
      currentY,
      rowArray,
      summaryColumnWidths,
      rowHeight,
      helvetica
    );
  });

  // ----- 2. DETAILED SEATING PAGES -----
  // For each room, create a detailed seating page
  Object.entries(seatingArrangement.arrangement).forEach(
    ([roomCode, roomData]) => {
      currentPage = addNewPage();
      currentY = drawPageHeader(
        currentPage,
        `Room No. ${roomCode} - Detailed Seating`,
        false
      );

      // Group seats by batch from seatMatrix
      const batchGroups = {};
      if (roomData.seatMatrix && roomData.seatMatrix.length > 0) {
        roomData.seatMatrix.forEach((row) => {
          row.forEach((seat) => {
            // Skip seats with null batch or roll number
            if (seat.batch && seat.rollNo !== null) {
              if (!batchGroups[seat.batch]) {
                batchGroups[seat.batch] = [];
              }
              batchGroups[seat.batch].push(seat);
            }
          });
        });
      }

      // For each batch in this room, render the detailed seating table
      Object.entries(batchGroups).forEach(([batchName, seats]) => {
        // Skip if no valid seats (all null)
        if (seats.length === 0) return;

        if (currentY < 100) {
          currentPage = addNewPage();
          currentY = drawPageHeader(
            currentPage,
            `Room No. ${roomCode} - Detailed Seating (continued)`,
            false
          );
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
        const seatColumnWidths = useDoubleColumn
          ? [60, 60, 60, 60]
          : [120, 120];
        const seatHeaders = useDoubleColumn
          ? ["Seat No.", "Roll No.", "Seat No.", "Roll No."]
          : ["Seat No.", "Roll No."];

        // Draw seating table header row for the batch
        currentY = drawTableRow(
          currentPage,
          currentY,
          seatHeaders,
          seatColumnWidths,
          rowHeight,
          helveticaBold,
          true
        );

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
              currentY = drawPageHeader(
                currentPage,
                `Room No. ${roomCode} - ${batchName} (continued)`
              );
              currentY = drawTableRow(
                currentPage,
                currentY,
                seatHeaders,
                seatColumnWidths,
                rowHeight,
                helveticaBold,
                true
              );
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

            currentY = drawTableRow(
              currentPage,
              currentY,
              rowValues,
              seatColumnWidths,
              rowHeight,
              helvetica
            );
          }
        } else {
          // Single column layout
          for (const seat of seats) {
            if (currentY < 50) {
              currentPage = addNewPage();
              currentY = drawPageHeader(
                currentPage,
                `Room No. ${roomCode} - ${batchName} (continued)`
              );
              currentY = drawTableRow(
                currentPage,
                currentY,
                seatHeaders,
                seatColumnWidths,
                rowHeight,
                helveticaBold,
                true
              );
            }
            currentY = drawTableRow(
              currentPage,
              currentY,
              [String(seat.seatNo), String(seat.rollNo)],
              seatColumnWidths,
              rowHeight,
              helvetica
            );
          }
        }

        currentY -= 20; // Space after each batch table
      });
    }
  );

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
    const seatingArrangement = generateSeatingArrangement(
      batchDetails,
      roomDetails
    );

    // 4) Generate PDF with correct parameter order: seatingArrangement, examName, examDate
    const pdfBytes = await generateSeatingPDF(
      seatingArrangement,
      examName,
      examDate
    );

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

// ______________________ PDF UPLOAD & NOTIFICATION ______________________
const pdfSchema = new mongoose.Schema({
  filename: String,
  data: String,
  from: String,
  to: String,
  textmessage: String,
});
const pdfmodel = mongoose.model("PDF", pdfSchema, "notify");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "miniproject22426@gmail.com",
    pass: "vann cbpk revt frum",
  },
});

app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    const file = req.file;
    const textMessage = req.body.textmessage || "";
    // 'from' is sent as the U_id of the sender.
    const senderId = req.body.from;
    const to = req.body.to;

    if (!file && !textMessage.trim()) {
      return res
        .status(400)
        .json({ message: "Please provide a file or a text message." });
    }

    // Look up the sender by U_id to get the U_name.
    const sender = await user.findOne({ U_id: senderId });
    const senderName = sender ? sender.U_name : senderId;

    const base64data = file ? file.buffer.toString("base64") : "";
    // Save the notification using the correct model (pdfmodel)
    const newNotification = new pdfmodel({
      filename: file ? file.originalname : "",
      data: base64data,
      from: senderName, // Save sender's name instead of U_id.
      to: to,
      textmessage: textMessage,
    });
    await newNotification.save();

    // Determine recipient email addresses.
    let recipientsEmails = [];
    if (to === "all") {
      // Query all faculties (assuming "FC" is the faculty role)
      const faculties = await user.find({ U_role: { $in: ["FC"] } });
      recipientsEmails = faculties
        .filter((faculty) => faculty.U_email)
        .map((faculty) => faculty.U_email);
    } else {
      const faculty = await user.findOne({ U_name: to });
      if (faculty && faculty.U_email) {
        recipientsEmails.push(faculty.U_email);
      }
    }

    // Construct the email text with the sender's name.
    const emailText = `Notification from ${senderName}: ${
      textMessage || "You have received a new notification."
    }`;

    // Send email notification if there are any recipient emails.
    if (recipientsEmails.length > 0) {
      let mailOptions = {
        from: '"Internal Exam Management" <your-email@example.com>',
        to: recipientsEmails.join(","),
        subject: "New Notification",
        text: emailText,
        attachments: file
          ? [
              {
                filename: file.originalname,
                content: file.buffer,
              },
            ]
          : [],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    res.status(200).json({ success: true, to });
  } catch (error) {
    res.status(400).json({ success: false, details: error.message });
  }
});

// ______________________FETCHING FACULTY______________________

app.get("/api/notify/faculty", async (req, res) => {
  try {
    // Fetch users who have "faculty" as one of their roles
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

// ______________________DISPLAY INBOX______________________

app.get("/get-pdfs-to/:to", async (req, res) => {
  try {
    const { to } = req.params;

    const pdfdoc = await pdfmodel.find({
      $or: [{ to: "all" }, { to: to }],
    });
    // console.log(pdfdoc);

    if (!pdfdoc.length)
      return res.status(400).json({ message: "no inbox found" });

    const responcepdf = pdfdoc.map((doc) => ({
      filename: doc.filename,
      from: doc.from,
      to: doc.to,
      textmessage: doc.textmessage,
      data: `data:application/pdf;base64,${doc.data}`,
    }));
    res.json(responcepdf);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error in retriving pdfs" });
  }
});

//______________________DISPLAY SEND______________________

app.get("/get-pdfs-from/:from", async (req, res) => {
  try {
    const { from } = req.params;

    const pdfdoc = await pdfmodel.find({ from: from });

    if (!pdfdoc.length)
      return res.status(400).json({ message: "no inbox found" });

    const responcepdf = pdfdoc.map((doc) => ({
      filename: doc.filename,
      from: doc.from,
      to: doc.to,
      textmessage: doc.textmessage,
      data: `data:application/pdf;base64,${doc.data}`,
    }));
    res.json(responcepdf);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error in retriving pdfs" });
  }
});

//______________________TRIAL SCHEMA_______________________
const trialSchema = new mongoose.Schema({
  mode: String,
  subject: String,
  batch: String,
  fileName: String,
  data: String,
  date: String,
  from: String,
  allocate: String,
  sfileName: String,
  sdata: String,
  textmesg: String,
});

const trialModel = mongoose.model("trials", trialSchema, "TRIAL");
//_______________________TRIAL UPLOAD_______________________

app.post("/upload-trial", upload.single("pdfFile"), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file." });
    }

    const { mode, subject, batch, dt: date, from } = req.body;

    if (!mode || !subject || !batch || !date || !from) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const data64 = req.file.buffer.toString("base64");

    // Save the uploaded question paper in the trialModel
    const newTrial = new trialModel({
      mode,
      subject,
      batch,
      fileName: req.file.originalname,
      data: data64,
      date,
      from,
      allocate: null,
      sfileName: null,
      sdata: null,
      textmesg: null,
    });

    await newTrial.save();

    let recipientUser = null;

    if (mode === "trial") {
      // Find the module where the subject exists in the subjects array
      const moduleData = await Module.findOne({ subjects: { $in: [subject] } });

      if (moduleData) {
        // Get the module coordinator's name (U_name)
        const moduleCoordinator = moduleData.moduleCoordinator;
        recipientUser = await user.findOne({ U_name: moduleCoordinator });
      }
    } else if (mode === "final") {
      // For final mode, notify the Exam Coordinator (EC)
      recipientUser = await user.findOne({ U_role: "EC" });
    }

    // If a recipient is found and has an email, send the notification
    if (recipientUser?.U_email) {
      const mailText =
        mode === "trial"
          ? `User ${from} has uploaded a TRIAL question paper for subject: ${subject}.`
          : `User ${from} has uploaded a FINAL question paper for subject: ${subject}.`;

      const mailOptions = {
        from: '"Internal Exam Management" <miniproject22426@gmail.com>',
        to: recipientUser.U_email,
        subject: "Question Paper Upload Notification",
        text: mailText,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email notification:", error);
        } else {
          console.log("Email notification sent: " + info.response);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Question paper uploaded successfully.",
    });
  } catch (error) {
    console.error("Error uploading question paper:", error);
    res
      .status(500)
      .json({ success: false, message: "Error uploading question paper" });
  }
});

//______________________TRIAL TO_______________________

app.get("/get-trial/:to", async (req, res) => {
  try {
    const { to } = req.params;
    const module = await Module.findOne({ moduleCoordinator: to });
    const subjects = await module.subjects;
    const trial = await trialModel.find({ subject: { $in: subjects } });
    res.status(200).json(trial);
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
});


//____________________TRIAL FROM_____________________

app.get("/trial-from/:from",async(req,res)=>{
  try {
    const {from}=req.params;    
    const trialsfrom=await trialModel.find({from:from,mode:"trial"})
    // console.log(trialsfrom);
    
    res.status(200).json(trialsfrom);
    
  } catch (error) {
    console.log(error);
    res.status(400).json({message:`${error}`});
    
  }
  
})

//____________________UPDATE TRIAL TO ALLOCATE_____________________

app.put("/trial-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty } = req.body;

    // Update the trial paper with the allocated faculty name and change mode to "allocated"
    const trialPaper = await trialModel.findByIdAndUpdate(
      id,
      { mode: "allocated", allocate: faculty },
      { new: true }
    );

    if (!trialPaper) {
      return res
        .status(404)
        .json({ success: false, message: "Trial paper not found." });
    }

    // Look up the allocated faculty using U_name
    const allocatedFaculty = await user.findOne({ U_name: faculty });

    // If the allocated faculty is found and has an email, send the notification email
    if (allocatedFaculty && allocatedFaculty.U_email) {
      const mailText = `Dear ${allocatedFaculty.U_name},

You have been allocated a paper for scrutiny.
Subject: ${trialPaper.subject}
File Name: ${trialPaper.fileName}

Please review the paper at your earliest convenience.

Regards,
Module Coordinator`;

      const mailOptions = {
        from: '"Internal Exam Management" <miniproject22426@gmail.com>',
        to: allocatedFaculty.U_email,
        subject: "Paper Allocation Notification for Scrutiny",
        text: mailText,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email notification:", error);
        } else {
          console.log("Email notification sent: " + info.response);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Paper allocated and notification sent successfully.",
      data: trialPaper,
    });
  } catch (error) {
    console.error("Error allocating paper:", error);
    res.status(500).json({ success: false, message: "Error allocating paper" });
  }
});


//_______________________SCRUTINIZED_____________________________
app.put("/trial-scrutinized/:id", upload.single("inputFile"), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that a file is provided
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file." });
    }

    // Convert the uploaded file to a base64 string
    const sdata = req.file.buffer.toString("base64");
    const sfileName = req.file.originalname;

    // Update the trial paper: set mode to "scrutinized", save scrutinized file info
    const trialPaper = await trialModel.findByIdAndUpdate(
      id,
      {
        mode: "scrutinized",
        sfileName,
        sdata,
      },
      { new: true }
    );

    if (!trialPaper) {
      return res.status(404).json({ message: "Trial paper not found." });
    }

    // Look up the MC (Module Coordinator) for verification
    const mcUser = await user.findOne({ U_role: { $in: ["MC"] } });

    // If MC is found and has an email, send the notification
    if (mcUser && mcUser.U_email) {
      const mailText = `Dear ${mcUser.U_name},

The paper for subject "${trialPaper.subject}" has been scrutinized and is now ready for verification.
Please log in to the system to review the scrutinized document.

Regards,
Internal Exam Management System
`;

      const mailOptions = {
        from: '"Internal Exam Management" <miniproject22426@gmail.com>',
        to: mcUser.U_email,
        subject: "Scrutiny Completed - Verification Needed",
        text: mailText,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email notification:", error);
        } else {
          console.log("Email notification sent: " + info.response);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Scrutinized paper updated and notification sent successfully.",
      data: trialPaper,
    });
  } catch (error) {
    console.error("Error updating scrutinized paper:", error);
    res.status(500).json({ message: "Error updating scrutinized paper" });
  }
});


// ____________________VERIFIED TO FACULTY(FROM)__________________

app.get("/get-verified/:from", async (req, res) => {
  try {
    const { from } = req.params;
    const verified = await trialModel.find({ from: from, mode: "verified" });
    res.status(200).json(verified);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error occured in api" });
  }
});

//______________________ALLOCATED FACULTY SCRUTINY INBOX______________

app.get("/scrutiny-inbox/:allocate", async (req, res) => {
  try {
    const { allocate } = req.params;
    const allocateInbox = await trialModel.find({ allocate: allocate });
    res.status(200).json(allocateInbox);
  } catch (error) {
    res.status(400).json({ message: "error occured" });
    console.log(error);
  }
});

// ________________________VERIFY UPDATE__________________________

app.put("/verify-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { textmesg } = req.body;

    if (!textmesg) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide verification suggestions." });
    }

    // Update the trial paper: mark as "verified" and save the verification message
    const trialPaper = await trialModel.findByIdAndUpdate(
      id,
      {
        mode: "verified",
        textmesg: textmesg,
      },
      { new: true }
    );

    if (!trialPaper) {
      return res.status(404).json({ success: false, message: "Trial paper not found." });
    }

    // Look up the faculty who originally sent the paper.
    // Assumption: trialPaper.from stores the faculty's U_id.
    const facultyUser = await user.findOne({ U_id: trialPaper.from });

    // If the faculty exists and has an email, send the notification
    if (facultyUser && facultyUser.U_email) {
      const mailText = `Dear ${facultyUser.U_name},

Your question paper for subject "${trialPaper.subject}" has been scrutinised and verified.

Please log in to the system for further details.

Regards,
Internal Exam Management System`;

      const mailOptions = {
        from: '"Internal Exam Management" <miniproject22426@gmail.com>',
        to: facultyUser.U_email,
        subject: "Paper Verification Completed",
        text: mailText,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email notification:", error);
        } else {
          console.log("Email notification sent: " + info.response);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Paper verified and notification sent successfully.",
      data: trialPaper,
    });
  } catch (error) {
    console.error("Error updating verified paper:", error);
    res.status(500).json({ success: false, message: "Error updating verified paper" });
  }
});


//______________________FINAL TO EC__________________________

app.get("/final-qustion", async (req, res) => {
  try {
    const final = await trialModel.find({ mode: "final" });
    res.status(200).json(final);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to load final qustions" });
  }
});

// ------------------- INVIGILATION DUTY ALLOCATION -------------------

const path = require("path");
const { log } = require("console");
const { generateInvigilationPDF } = require(path.join(
  __dirname,
  "pdfGenerator.js"
));

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

    // Shuffle the faculties array
    const shuffledFaculties = [...selectedFaculties];
    for (let i = shuffledFaculties.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledFaculties[i], shuffledFaculties[j]] = [shuffledFaculties[j], shuffledFaculties[i]];
    }

    // Shuffle the rooms array
    const shuffledRooms = [...selectedRooms];
    for (let i = shuffledRooms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRooms[i], shuffledRooms[j]] = [shuffledRooms[j], shuffledRooms[i]];
    }

    // Generate PDF with shuffled faculties and rooms
    const pdfBytes = await generateInvigilationPDF(
      shuffledFaculties,
      shuffledRooms,
      dutyDate
    );

    // Send the PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invigilation-duty-${dutyDate}.pdf`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating invigilation duty allocation:", error);
    res
      .status(500)
      .json({ error: "Error generating invigilation duty allocation" });
  }
});

// In-memory OTP store – for production, consider using a persistent store like Redis
const otpStore = {};

app.post("/api/auth/send-reset-link", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    // Find the user by their email (U_email)
    const existingUser = await user.findOne({ U_email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate a 6-digit OTP as a string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store the OTP with an expiration time (15 minutes)
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes in milliseconds
    };

    // Prepare the email options
    const mailOptions = {
      from: '"Internal Exam Management" <miniproject22426@gmail.com>',
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
    };

    // Send the OTP email using nodemailer transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).json({ message: "Error sending OTP email." });
      } else {
        console.log("OTP email sent: " + info.response);
        return res.status(200).json({
          message: "Password reset OTP sent successfully.",
          // For development only: return the OTP for testing purposes
          testOtp: process.env.NODE_ENV === "development" ? otp : undefined,
        });
      }
    });
  } catch (err) {
    console.error("Send reset link error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    // Retrieve OTP data for the provided email
    const otpData = otpStore[email];
    if (!otpData) {
      return res
        .status(400)
        .json({
          message: "OTP not found or expired. Please request a new one.",
        });
    }
    // Check if the OTP has expired
    if (Date.now() > otpData.expiresAt) {
      delete otpStore[email];
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    // Verify the OTP value
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // OTP is valid; remove it from the store
    delete otpStore[email];

    // Find the user by email
    const existingUser = await user.findOne({ U_email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's password (storing as plain text, per your project)
    existingUser.U_password = newPassword;
    await existingUser.save();

    return res
      .status(200)
      .json({ message: "Password reset successfully. Please log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(4000, () => console.log("Listening on port 4000..."));

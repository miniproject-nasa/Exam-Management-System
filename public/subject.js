document.addEventListener("DOMContentLoaded", async function () {
  const subjectList = document.querySelector(".main-content");
  const subjectForm = document.getElementById("subjectForm");

  // Helper functions to open/close popups without changing the URL hash
  function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
      popup.classList.add("active");
    }
  }

  function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
      popup.classList.remove("active");
    }
  }

  // Event delegation for all close buttons (works for dynamically added popups)
  document.addEventListener("click", function (e) {
    if (e.target.matches(".popup .close")) {
      e.preventDefault();
      const popup = e.target.closest(".popup");
      if (popup) {
        popup.classList.remove("active");
      }
    }
  });

  // --- Inject Update and Delete Popups ---
  const updatePopupHtml = `
    <div id="update-popup" class="popup">
      <div class="popup-content">
        <a href="#" class="close">&times;</a>
        <form id="updateSubjectForm">
          <label for="update-subject-code">Subject Code</label>
          <input type="text" id="update-subject-code" name="update-subject-code" readonly style="background-color: #f0f0f0; cursor: not-allowed;" />
          
          <label for="update-subject-name">Subject Name</label>
          <input type="text" id="update-subject-name" name="update-subject-name" required />
          
          <label for="update-batch">Batch</label>
          <input type="text" id="update-batch" name="update-batch" required />
          
          <label for="update-module">Module</label>
          <input type="text" id="update-module" name="update-module" required />
          
          <label for="update-faculty">Subject Faculty</label>
          <input type="text" id="update-faculty" name="update-faculty" required />
          
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  `;

  const deletePopupHtml = `
    <div id="delete-popup" class="popup">
      <div class="popup-content">
        <a href="#" class="close">&times;</a>
        <h3>Confirm Deletion</h3>
        <p id="delete-confirm">Are you sure you want to delete subject <span id="delete-subject-name"></span>?</p>
        <div class="button-group">
          <button id="confirm-delete" class="danger">Delete</button>
          <button id="cancel-delete">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Insert popups into the document
  document.body.insertAdjacentHTML("beforeend", updatePopupHtml);
  document.body.insertAdjacentHTML("beforeend", deletePopupHtml);

  // --- Fetch and Display Subjects ---
  async function fetchSubjects() {
    try {
      const response = await fetch("/get-subjects");
      const subjects = await response.json();
      subjectList.innerHTML = "";

      subjects.forEach((subject) => {
        const subjectElement = document.createElement("div");
        subjectElement.classList.add("information-box");
        subjectElement.innerHTML = `
          <ul class="information-type">
            <li>Subject Name: ${subject.S_name}</li>
            <li>Subject Code: ${subject.S_code}</li>
            <li>Batch: ${subject.S_batch}</li>
            <li>Module: ${subject.S_module}</li>
            <li>Faculty: ${subject.S_faculty}</li>
          </ul>
          <div class="button-container">
            <button class="square-btn" onclick="editSubject('${subject.S_code}', '${subject.S_name}', '${subject.S_batch}', '${subject.S_module}', '${subject.S_faculty}')">
              <img class="small-button" src="images/edit.webp" alt="Edit">
            </button>
            <button class="square-btn" onclick="confirmDeleteSubject('${subject.S_code}', '${subject.S_name}')">
              <img class="small-button-2" src="images/trash.webp" alt="Delete">
            </button>
          </div>
        `;
        subjectList.appendChild(subjectElement);
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }

  // --- Add New Subject ---
  async function addSubject(event) {
    event.preventDefault();
    const formData = {
      S_name: document.getElementById("subject-name").value.trim(),
      S_code: document.getElementById("subject-code").value.trim(),
      S_batch: document.getElementById("batch").value.trim(),
      S_module: document.getElementById("module").value.trim(),
      S_faculty: document.getElementById("faculty").value.trim(),
    };

    try {
      const response = await fetch("/add-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSubjects();
        subjectForm.reset();
        closePopup("popup-form");
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  }

  // --- Update Subject ---
  window.editSubject = function (code, name, batch, module, faculty) {
    document.getElementById("update-subject-code").value = code;
    document.getElementById("update-subject-name").value = name;
    document.getElementById("update-batch").value = batch;
    document.getElementById("update-module").value = module;
    document.getElementById("update-faculty").value = faculty;
    openPopup("update-popup");
  };

  document
    .getElementById("updateSubjectForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = {
        S_code: document.getElementById("update-subject-code").value.trim(),
        S_name: document.getElementById("update-subject-name").value.trim(),
        S_batch: document.getElementById("update-batch").value.trim(),
        S_module: document.getElementById("update-module").value.trim(),
        S_faculty: document.getElementById("update-faculty").value.trim(),
      };

      try {
        const response = await fetch(`/update-subject/${formData.S_code}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          await fetchSubjects();
          closePopup("update-popup");
        } else {
          const error = await response.json();
          alert(error.error || "Failed to update subject");
        }
      } catch (error) {
        console.error("Error updating subject:", error);
        alert("Failed to update subject. Please try again.");
      }
    });

  // --- Delete Subject ---
  window.confirmDeleteSubject = function (code, name) {
    document.getElementById("delete-subject-name").textContent = name;
    document.getElementById("confirm-delete").onclick = async function () {
      try {
        const response = await fetch(`/delete-subject/${code}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchSubjects();
          closePopup("delete-popup");
        } else {
          alert("Failed to delete subject");
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    };
    openPopup("delete-popup");
    // Handle cancel button:
    document.getElementById("cancel-delete").onclick = function () {
      closePopup("delete-popup");
    };
  };

  // --- Event Listeners ---
  subjectForm.addEventListener("submit", addSubject);

  // Event listener for opening add subject popup
  document
    .getElementById("open-add-subject")
    .addEventListener("click", function () {
      openPopup("popup-form");
    });

  // ==========================
// For the Add Form Faculty
// ==========================
let facultyDropdown;
const facultyInput = document.getElementById("faculty");

async function createFacultyDropdown() {
  if (facultyDropdown) return;
  facultyDropdown = document.createElement("div");
  facultyDropdown.className = "dropdown";
  let usersList = [];
  try {
    const response = await fetch("/get-users");
    usersList = await response.json();
  } catch (err) {
    console.error("Error fetching users:", err);
  }
  // Create a dropdown item for each user
  usersList.forEach(user => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = user.U_name; // Modify if needed
    item.onclick = function() {
      facultyInput.value = user.U_name;
      hideFacultyDropdown();
    };
    facultyDropdown.appendChild(item);
  });
  document.body.appendChild(facultyDropdown);
}

function positionFacultyDropdown() {
  const rect = facultyInput.getBoundingClientRect();
  facultyDropdown.style.left = rect.left + "px";
  facultyDropdown.style.top = (rect.bottom + window.scrollY) + "px";
  facultyDropdown.style.width = rect.width + "px";
}

function showFacultyDropdown() {
  if (!facultyDropdown) {
    createFacultyDropdown().then(() => {
      positionFacultyDropdown();
      facultyDropdown.style.display = "block";
    });
  } else {
    positionFacultyDropdown();
    facultyDropdown.style.display = "block";
  }
}

function hideFacultyDropdown() {
  if (facultyDropdown) {
    facultyDropdown.style.display = "none";
  }
}

// Filter dropdown items as user types
facultyInput.addEventListener("input", function() {
  const filter = facultyInput.value.toLowerCase();
  if (facultyDropdown) {
    Array.from(facultyDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  }
});

facultyInput.addEventListener("focus", showFacultyDropdown);
facultyInput.addEventListener("blur", function() {
  // Delay hiding to allow click events to register
  setTimeout(hideFacultyDropdown, 200);
});


// ==============================
// For the Update Form Faculty
// ==============================
let updateFacultyDropdown;
const updateFacultyInput = document.getElementById("update-faculty");

async function createUpdateFacultyDropdown() {
  if (updateFacultyDropdown) return;
  updateFacultyDropdown = document.createElement("div");
  updateFacultyDropdown.className = "dropdown";
  let usersList = [];
  try {
    const response = await fetch("/get-users");
    usersList = await response.json();
  } catch (err) {
    console.error("Error fetching users:", err);
  }
  // Create a dropdown item for each user
  usersList.forEach(user => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = user.U_name;
    item.onclick = function() {
      updateFacultyInput.value = user.U_name;
      hideUpdateFacultyDropdown();
    };
    updateFacultyDropdown.appendChild(item);
  });
  document.body.appendChild(updateFacultyDropdown);
}

function positionUpdateFacultyDropdown() {
  const rect = updateFacultyInput.getBoundingClientRect();
  updateFacultyDropdown.style.left = rect.left + "px";
  updateFacultyDropdown.style.top = (rect.bottom + window.scrollY) + "px";
  updateFacultyDropdown.style.width = rect.width + "px";
}

function showUpdateFacultyDropdown() {
  if (!updateFacultyDropdown) {
    createUpdateFacultyDropdown().then(() => {
      positionUpdateFacultyDropdown();
      updateFacultyDropdown.style.display = "block";
    });
  } else {
    positionUpdateFacultyDropdown();
    updateFacultyDropdown.style.display = "block";
  }
}

function hideUpdateFacultyDropdown() {
  if (updateFacultyDropdown) {
    updateFacultyDropdown.style.display = "none";
  }
}

// Filter dropdown items for update form
updateFacultyInput.addEventListener("input", function() {
  const filter = updateFacultyInput.value.toLowerCase();
  if (updateFacultyDropdown) {
    Array.from(updateFacultyDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  }
});

updateFacultyInput.addEventListener("focus", showUpdateFacultyDropdown);
updateFacultyInput.addEventListener("blur", function() {
  setTimeout(hideUpdateFacultyDropdown, 200);
});

const moduleInput = document.getElementById("module");
let moduleDropdown;

async function createModuleDropdown() {
  if (moduleDropdown) return;
  moduleDropdown = document.createElement("div");
  moduleDropdown.className = "dropdown";
  let modulesList = [];
  try {
    const response = await fetch("/api/modules"); // Adjust endpoint if needed
    modulesList = await response.json();
  } catch (err) {
    console.error("Error fetching modules:", err);
  }
  // Create a dropdown item for each module
  modulesList.forEach(module => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    // Display the module name; adjust if you want additional info
    item.textContent = module.moduleName;
    item.onclick = function() {
      moduleInput.value = module.moduleName;
      hideModuleDropdown();
    };
    moduleDropdown.appendChild(item);
  });
  document.body.appendChild(moduleDropdown);
}

function positionModuleDropdown() {
  const rect = moduleInput.getBoundingClientRect();
  moduleDropdown.style.left = rect.left + "px";
  moduleDropdown.style.top = (rect.bottom + window.scrollY) + "px";
  moduleDropdown.style.width = rect.width + "px";
}

function showModuleDropdown() {
  if (!moduleDropdown) {
    createModuleDropdown().then(() => {
      positionModuleDropdown();
      moduleDropdown.style.display = "block";
    });
  } else {
    positionModuleDropdown();
    moduleDropdown.style.display = "block";
  }
}

function hideModuleDropdown() {
  if (moduleDropdown) {
    moduleDropdown.style.display = "none";
  }
}

// Filter dropdown items as user types
moduleInput.addEventListener("input", function() {
  const filter = moduleInput.value.toLowerCase();
  if (moduleDropdown) {
    Array.from(moduleDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  }
});

moduleInput.addEventListener("focus", showModuleDropdown);
moduleInput.addEventListener("blur", function() {
  // Use a short delay to allow click events to register before hiding
  setTimeout(hideModuleDropdown, 200);
});

const updateModuleInput = document.getElementById("update-module");
let updateModuleDropdown;

async function createUpdateModuleDropdown() {
  if (updateModuleDropdown) return;
  updateModuleDropdown = document.createElement("div");
  updateModuleDropdown.className = "dropdown";
  let modulesList = [];
  try {
    const response = await fetch("/api/modules"); // Adjust endpoint if needed
    modulesList = await response.json();
  } catch (err) {
    console.error("Error fetching modules:", err);
  }
  // Create a dropdown item for each module
  modulesList.forEach(module => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    // Display the module name; adjust if you want more details
    item.textContent = module.moduleName;
    item.onclick = function() {
      updateModuleInput.value = module.moduleName;
      hideUpdateModuleDropdown();
    };
    updateModuleDropdown.appendChild(item);
  });
  document.body.appendChild(updateModuleDropdown);
}

function positionUpdateModuleDropdown() {
  const rect = updateModuleInput.getBoundingClientRect();
  updateModuleDropdown.style.left = rect.left + "px";
  updateModuleDropdown.style.top = (rect.bottom + window.scrollY) + "px";
  updateModuleDropdown.style.width = rect.width + "px";
}

function showUpdateModuleDropdown() {
  if (!updateModuleDropdown) {
    createUpdateModuleDropdown().then(() => {
      positionUpdateModuleDropdown();
      updateModuleDropdown.style.display = "block";
    });
  } else {
    positionUpdateModuleDropdown();
    updateModuleDropdown.style.display = "block";
  }
}

function hideUpdateModuleDropdown() {
  if (updateModuleDropdown) {
    updateModuleDropdown.style.display = "none";
  }
}

// Filter dropdown items as user types
updateModuleInput.addEventListener("input", function() {
  const filter = updateModuleInput.value.toLowerCase();
  if (updateModuleDropdown) {
    Array.from(updateModuleDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  }
});

updateModuleInput.addEventListener("focus", showUpdateModuleDropdown);
updateModuleInput.addEventListener("blur", function() {
  // Delay hiding to allow click events to register before hiding the dropdown
  setTimeout(hideUpdateModuleDropdown, 200);
});

// ==========================
// Batches Dropdown for Add Form
// ==========================
const batchInput = document.getElementById("batch");
let batchDropdown;

async function createBatchDropdown() {
  if (batchDropdown) return;
  batchDropdown = document.createElement("div");
  batchDropdown.className = "dropdown";
  let batchesList = [];
  try {
    const response = await fetch("/get-batches"); // Using your endpoint
    batchesList = await response.json();
  } catch (err) {
    console.error("Error fetching batches:", err);
  }
  // Create a dropdown item for each batch using B_name
  batchesList.forEach(batch => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = batch.B_name;
    item.onclick = function() {
      batchInput.value = batch.B_name;
      hideBatchDropdown();
    };
    batchDropdown.appendChild(item);
  });
  document.body.appendChild(batchDropdown);
}

function positionBatchDropdown() {
  const rect = batchInput.getBoundingClientRect();
  batchDropdown.style.left = rect.left + "px";
  batchDropdown.style.top = (rect.bottom + window.scrollY) + "px";
  batchDropdown.style.width = rect.width + "px";
}

function showBatchDropdown() {
  if (!batchDropdown) {
    createBatchDropdown().then(() => {
      positionBatchDropdown();
      batchDropdown.style.display = "block";
    });
  } else {
    positionBatchDropdown();
    batchDropdown.style.display = "block";
  }
}

function hideBatchDropdown() {
  if (batchDropdown) {
    batchDropdown.style.display = "none";
  }
}

// Filter dropdown items as user types
batchInput.addEventListener("input", function() {
  const filter = batchInput.value.toLowerCase();
  if (batchDropdown) {
    Array.from(batchDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  }
});

batchInput.addEventListener("focus", showBatchDropdown);
batchInput.addEventListener("blur", function() {
  setTimeout(hideBatchDropdown, 200);
});

// ==========================
// Batches Dropdown for Update Form
// ==========================
const updateBatchInput = document.getElementById("update-batch");
let updateBatchDropdown;

async function createUpdateBatchDropdown() {
  if (updateBatchDropdown) return;
  updateBatchDropdown = document.createElement("div");
  updateBatchDropdown.className = "dropdown";
  let batchesList = [];
  try {
    const response = await fetch("/get-batches");
    batchesList = await response.json();
  } catch (err) {
    console.error("Error fetching batches:", err);
  }
  // Create a dropdown item for each batch using B_name
  batchesList.forEach(batch => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = batch.B_name;
    item.onclick = function() {
      updateBatchInput.value = batch.B_name;
      hideUpdateBatchDropdown();
    };
    updateBatchDropdown.appendChild(item);
  });
  document.body.appendChild(updateBatchDropdown);
}

function positionUpdateBatchDropdown() {
  const rect = updateBatchInput.getBoundingClientRect();
  updateBatchDropdown.style.left = rect.left + "px";
  updateBatchDropdown.style.top = (rect.bottom + window.scrollY) + "px";
  updateBatchDropdown.style.width = rect.width + "px";
}

function showUpdateBatchDropdown() {
  if (!updateBatchDropdown) {
    createUpdateBatchDropdown().then(() => {
      positionUpdateBatchDropdown();
      updateBatchDropdown.style.display = "block";
    });
  } else {
    positionUpdateBatchDropdown();
    updateBatchDropdown.style.display = "block";
  }
}

function hideUpdateBatchDropdown() {
  if (updateBatchDropdown) {
    updateBatchDropdown.style.display = "none";
  }
}

// Filter dropdown items for update form as user types
updateBatchInput.addEventListener("input", function() {
  const filter = updateBatchInput.value.toLowerCase();
  if (updateBatchDropdown) {
    Array.from(updateBatchDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  }
});

updateBatchInput.addEventListener("focus", showUpdateBatchDropdown);
updateBatchInput.addEventListener("blur", function() {
  setTimeout(hideUpdateBatchDropdown, 200);
});

  fetchSubjects();
});

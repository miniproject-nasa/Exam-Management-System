  document.addEventListener("DOMContentLoaded", async function () {
    const subjectList = document.querySelector(".main-content");
    const subjectForm = document.getElementById("subjectForm");

    // --- Tag Functionality Setup ---
    // Global arrays for Add form tags
    let selectedBatches = [];
    let selectedFaculties = [];
    // Global arrays for Update form tags
    let updateSelectedBatches = [];
    let updateSelectedFaculties = [];

    function setupTagInput(inputElement, containerElement, itemsList) {
      inputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          const value = inputElement.value.trim();
          if (value && !itemsList.includes(value)) {
            itemsList.push(value);
            renderTags(containerElement, itemsList);
            inputElement.value = "";
          }
        }
      });
    }

    function renderTags(container, items) {
      container.innerHTML = "";
      items.forEach((item, index) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerHTML = `${item} <span class="delete-tag" data-index="${index}" data-container="${container.id}">&times;</span>`;
        container.appendChild(tag);
      });
      
      // Add event listeners to delete buttons
      container.querySelectorAll('.delete-tag').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const containerId = this.getAttribute('data-container');
          removeTag(index, containerId);
        });
      });
    }

    function removeTag(index, containerId) {
      if (containerId === "batch-container") {
        selectedBatches.splice(index, 1);
        renderTags(document.getElementById("batch-container"), selectedBatches);
      } else if (containerId === "faculty-container") {
        selectedFaculties.splice(index, 1);
        renderTags(
          document.getElementById("faculty-container"),
          selectedFaculties
        );
      } else if (containerId === "update-batch-container") {
        updateSelectedBatches.splice(index, 1);
        renderTags(
          document.getElementById("update-batch-container"),
          updateSelectedBatches
        );
      } else if (containerId === "update-faculty-container") {
        updateSelectedFaculties.splice(index, 1);
        renderTags(
          document.getElementById("update-faculty-container"),
          updateSelectedFaculties
        );
      }
    }

    // Make removeTag accessible globally
    window.removeTag = removeTag;

    // --- Popup Helper Functions ---
    function openPopup(popupId) {
      const popup = document.getElementById(popupId);
      if (popup) popup.classList.add("active");
    }

    function closePopup(popupId) {
      const popup = document.getElementById(popupId);
      if (popup) popup.classList.remove("active");
    }

    // Event delegation for all close buttons (works for dynamically added popups)
    document.addEventListener("click", function (e) {
      if (e.target.matches(".popup .close")) {
        e.preventDefault();
        const popup = e.target.closest(".popup");
        if (popup) popup.classList.remove("active");
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
            <input type="text" id="update-batch" name="update-batch" placeholder="Select or type and press Enter" />
            <div id="update-batch-container" class="tags-container"></div>
            
            <label for="update-faculty">Subject Faculty</label>
            <input type="text" id="update-faculty" name="update-faculty" placeholder="Select or type and press Enter" />
            <div id="update-faculty-container" class="tags-container"></div>
            
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
              <li>Faculty: ${subject.S_faculty}</li>
            </ul>
            <div class="button-container">
              <button class="square-btn edit-btn" data-code="${subject.S_code}" data-name="${subject.S_name}" data-batch="${subject.S_batch}" data-faculty="${subject.S_faculty}">
                <img class="small-button" src="images/edit.webp" alt="Edit">
              </button>
              <button class="square-btn delete-btn" data-code="${subject.S_code}" data-name="${subject.S_name}">
                <img class="small-button-2" src="images/trash.webp" alt="Delete">
              </button>
            </div>
          `;
          subjectList.appendChild(subjectElement);
        });

        // Add event listeners to the newly created buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const name = this.getAttribute('data-name');
            const batch = this.getAttribute('data-batch');
            const faculty = this.getAttribute('data-faculty');
            editSubject(code, name, batch, faculty);
          });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const name = this.getAttribute('data-name');
            confirmDeleteSubject(code, name);
          });
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
        // Use the tag arrays instead of single text values
        S_batch: selectedBatches,
        S_faculty: selectedFaculties,
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
          // Reset tag arrays and clear tag containers
          selectedBatches = [];
          selectedFaculties = [];
          renderTags(document.getElementById("batch-container"), selectedBatches);
          renderTags(
            document.getElementById("faculty-container"),
            selectedFaculties
          );
          closePopup("popup-form");
        } else {
          const error = await response.json();
          alert(error.error);
        }
      } catch (error) {
        console.error("Error adding subject:", error);
      }
    }

    subjectForm.addEventListener("submit", addSubject);

    // --- Update Subject ---
    function editSubject(code, name, batch, faculty) {
      document.getElementById("update-subject-code").value = code;
      document.getElementById("update-subject-name").value = name;
      // Convert comma-separated values into arrays for tags
      updateSelectedBatches = batch
        ? batch
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      updateSelectedFaculties = faculty
        ? faculty
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      renderTags(
        document.getElementById("update-batch-container"),
        updateSelectedBatches
      );
      renderTags(
        document.getElementById("update-faculty-container"),
        updateSelectedFaculties
      );
      // Clear the update input fields to allow additional entries
      document.getElementById("update-batch").value = "";
      document.getElementById("update-faculty").value = "";
      openPopup("update-popup");
    }

    // Make editSubject accessible globally
    window.editSubject = editSubject;

    document
      .getElementById("updateSubjectForm")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = {
          S_code: document.getElementById("update-subject-code").value.trim(),
          S_name: document.getElementById("update-subject-name").value.trim(),
          S_batch: updateSelectedBatches,
          S_faculty: updateSelectedFaculties,
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
    function confirmDeleteSubject(code, name) {
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
    }

    // Make confirmDeleteSubject accessible globally
    window.confirmDeleteSubject = confirmDeleteSubject;

    // --- Dropdown Functionality for Add Form Faculty ---
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
      // Create a dropdown item for each user and tag on click
      usersList.forEach((user) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = user.U_name;
        item.addEventListener('click', function() {
          if (!selectedFaculties.includes(user.U_name)) {
            selectedFaculties.push(user.U_name);
            renderTags(
              document.getElementById("faculty-container"),
              selectedFaculties
            );
          }
          facultyInput.value = "";
          hideFacultyDropdown();
        });
        facultyDropdown.appendChild(item);
      });
      document.body.appendChild(facultyDropdown);
    }

    function positionFacultyDropdown() {
      const rect = facultyInput.getBoundingClientRect();
      facultyDropdown.style.left = rect.left + "px";
      facultyDropdown.style.top = rect.bottom + window.scrollY + "px";
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

    facultyInput.addEventListener("input", function () {
      const filter = facultyInput.value.toLowerCase();
      if (facultyDropdown) {
        Array.from(facultyDropdown.children).forEach((item) => {
          item.style.display = item.textContent.toLowerCase().includes(filter)
            ? "block"
            : "none";
        });
      }
    });

    facultyInput.addEventListener("focus", showFacultyDropdown);
    facultyInput.addEventListener("blur", function () {
      setTimeout(hideFacultyDropdown, 200);
    });

    // --- Dropdown Functionality for Update Form Faculty ---
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
      usersList.forEach((user) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = user.U_name;
        item.addEventListener('click', function() {
          if (!updateSelectedFaculties.includes(user.U_name)) {
            updateSelectedFaculties.push(user.U_name);
            renderTags(
              document.getElementById("update-faculty-container"),
              updateSelectedFaculties
            );
          }
          updateFacultyInput.value = "";
          hideUpdateFacultyDropdown();
        });
        updateFacultyDropdown.appendChild(item);
      });
      document.body.appendChild(updateFacultyDropdown);
    }

    function positionUpdateFacultyDropdown() {
      const rect = updateFacultyInput.getBoundingClientRect();
      updateFacultyDropdown.style.left = rect.left + "px";
      updateFacultyDropdown.style.top = rect.bottom + window.scrollY + "px";
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

    updateFacultyInput.addEventListener("input", function () {
      const filter = updateFacultyInput.value.toLowerCase();
      if (updateFacultyDropdown) {
        Array.from(updateFacultyDropdown.children).forEach((item) => {
          item.style.display = item.textContent.toLowerCase().includes(filter)
            ? "block"
            : "none";
        });
      }
    });

    updateFacultyInput.addEventListener("focus", showUpdateFacultyDropdown);
    updateFacultyInput.addEventListener("blur", function () {
      setTimeout(hideUpdateFacultyDropdown, 200);
    });

    // --- Dropdown Functionality for Batches in Add Form ---
    const batchInput = document.getElementById("batch");
    let batchDropdown;
    async function createBatchDropdown() {
      if (batchDropdown) return;
      batchDropdown = document.createElement("div");
      batchDropdown.className = "dropdown";
      let batchesList = [];
      try {
        const response = await fetch("/get-batches");
        batchesList = await response.json();
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
      batchesList.forEach((batch) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = batch.B_name;
        item.addEventListener('click', function() {
          if (!selectedBatches.includes(batch.B_name)) {
            selectedBatches.push(batch.B_name);
            renderTags(
              document.getElementById("batch-container"),
              selectedBatches
            );
          }
          batchInput.value = "";
          hideBatchDropdown();
        });
        batchDropdown.appendChild(item);
      });
      document.body.appendChild(batchDropdown);
    }

    function positionBatchDropdown() {
      const rect = batchInput.getBoundingClientRect();
      batchDropdown.style.left = rect.left + "px";
      batchDropdown.style.top = rect.bottom + window.scrollY + "px";
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

    batchInput.addEventListener("input", function () {
      const filter = batchInput.value.toLowerCase();
      if (batchDropdown) {
        Array.from(batchDropdown.children).forEach((item) => {
          item.style.display = item.textContent.toLowerCase().includes(filter)
            ? "block"
            : "none";
        });
      }
    });

    batchInput.addEventListener("focus", showBatchDropdown);
    batchInput.addEventListener("blur", function () {
      setTimeout(hideBatchDropdown, 200);
    });

    // --- Dropdown Functionality for Batches in Update Form ---
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
      batchesList.forEach((batch) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = batch.B_name;
        item.addEventListener('click', function() {
          if (!updateSelectedBatches.includes(batch.B_name)) {
            updateSelectedBatches.push(batch.B_name);
            renderTags(
              document.getElementById("update-batch-container"),
              updateSelectedBatches
            );
          }
          updateBatchInput.value = "";
          hideUpdateBatchDropdown();
        });
        updateBatchDropdown.appendChild(item);
      });
      document.body.appendChild(updateBatchDropdown);
    }

    function positionUpdateBatchDropdown() {
      const rect = updateBatchInput.getBoundingClientRect();
      updateBatchDropdown.style.left = rect.left + "px";
      updateBatchDropdown.style.top = rect.bottom + window.scrollY + "px";
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

    updateBatchInput.addEventListener("input", function () {
      const filter = updateBatchInput.value.toLowerCase();
      if (updateBatchDropdown) {
        Array.from(updateBatchDropdown.children).forEach((item) => {
          item.style.display = item.textContent.toLowerCase().includes(filter)
            ? "block"
            : "none";
        });
      }
    });

    updateBatchInput.addEventListener("focus", showUpdateBatchDropdown);
    updateBatchInput.addEventListener("blur", function () {
      setTimeout(hideUpdateBatchDropdown, 200);
    });

    // --- Attach Tag Functionality to Input Fields ---
    // For Add form:
    const batchTagContainer = document.getElementById("batch-container");
    const facultyTagContainer = document.getElementById("faculty-container");
    setupTagInput(batchInput, batchTagContainer, selectedBatches);
    setupTagInput(facultyInput, facultyTagContainer, selectedFaculties);

    // For Update form:
    const updateBatchTagContainer = document.getElementById(
      "update-batch-container"
    );
    const updateFacultyTagContainer = document.getElementById(
      "update-faculty-container"
    );
    setupTagInput(
      updateBatchInput,
      updateBatchTagContainer,
      updateSelectedBatches
    );
    setupTagInput(
      updateFacultyInput,
      updateFacultyTagContainer,
      updateSelectedFaculties
    );

    // --- Event Listener for Opening Add Subject Popup ---
    document
      .getElementById("open-add-subject")
      .addEventListener("click", function () {
        openPopup("popup-form");
      });

    // ----- Initial Load -----
    fetchSubjects();
  }); 
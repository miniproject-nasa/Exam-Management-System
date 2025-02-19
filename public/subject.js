document.addEventListener("DOMContentLoaded", async function () {
  const subjectList = document.querySelector(".main-content");
  const subjectForm = document.getElementById("subjectForm");

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
        <p>Are you sure you want to delete subject <span id="delete-subject-name"></span>?</p>
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
    window.location.href = "#update-popup";
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
          window.location.href = "#"; // Close popup
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
          window.location.href = "#"; // Close popup
        } else {
          alert("Failed to delete subject");
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    };
    window.location.href = "#delete-popup";
    // Also handle cancel button:
    document.getElementById("cancel-delete").onclick = function () {
      window.location.href = "#"; // Close popup
    };
  };

  // --- Event Listeners ---
  subjectForm.addEventListener("submit", addSubject);
  fetchSubjects();
});

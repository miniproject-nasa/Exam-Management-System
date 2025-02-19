document.addEventListener("DOMContentLoaded", async function () {
    const subjectList = document.querySelector(".main-content");
    const subjectForm = document.querySelector("#popup-form form");
  
    // Create Update Popup HTML
    const updatePopupHtml = `
      <div id="update-popup" class="popup">
        <div class="popup-content">
          <a href="#" class="close">&times;</a>
          <form id="updateSubjectForm">
            <label for="update-subject-name">Subject Name</label>
            <input type="text" id="update-subject-name" name="update-subject-name" required />
  
            <label for="update-subject-code">Subject Code</label>
            <input type="text" id="update-subject-code" name="update-subject-code" readonly required />
  
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
  
    // Create Delete Popup HTML
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
  
    // Append Popups to Document Body
    document.body.insertAdjacentHTML("beforeend", updatePopupHtml);
    document.body.insertAdjacentHTML("beforeend", deletePopupHtml);
  
    // Check if subject exists by subject_code
    async function checkSubjectExists(subjectCode) {
      try {
        const response = await fetch("/get-subjects");
        const subjects = await response.json();
        return subjects.some(subject => subject.subject_code === subjectCode);
      } catch (error) {
        console.error("Error checking subject:", error);
        return false;
      }
    }
  
    // Fetch and display all subjects
    async function fetchSubjects() {
      try {
        const response = await fetch("/get-subjects");
        const subjects = await response.json();
        subjectList.innerHTML = ""; // Clear existing content
  
        subjects.forEach(subject => {
          const subjectElement = document.createElement("div");
          subjectElement.classList.add("information-box");
          subjectElement.innerHTML = `
            <ul class="information-type">
              <li>Subject Name: ${subject.subject_name}</li>
              <li>Subject Code: ${subject.subject_code}</li>
              <li>Batch: ${subject.batch}</li>
              <li>Module: ${subject.module}</li>
              <li>Subject Faculty: ${subject.faculty}</li>
            </ul>
            <div class="button-container">
              <button class="square-btn" onclick="editSubject('${subject.subject_code}', '${subject.subject_name}', '${subject.batch}', '${subject.module}', '${subject.faculty}')">
                <img class="small-button" src="images/edit.webp" alt="Edit">
              </button>
              <button class="square-btn" onclick="deleteSubject('${subject.subject_code}', '${subject.subject_name}')">
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
  
    // Add a new subject
    async function addSubject(event) {
      event.preventDefault();
      const formData = {
        subject_name: document.getElementById("subject-name").value.trim(),
        subject_code: document.getElementById("subject-code").value.trim(),
        batch: document.getElementById("batch").value.trim(),
        module: document.getElementById("module").value.trim(),
        faculty: document.getElementById("faculty").value.trim()
      };
  
      if (!formData.subject_name || !formData.subject_code || !formData.batch ||
          !formData.module || !formData.faculty) {
        alert("Please fill in all fields.");
        return;
      }
  
      const exists = await checkSubjectExists(formData.subject_code);
      if (exists) {
        alert("Subject code already exists. Please use a different code.");
        return;
      }
  
      try {
        const response = await fetch("/add-subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
  
        if (response.ok) {
          await fetchSubjects();
          subjectForm.reset();
          window.location.href = "#"; // Close popup
        } else {
          const error = await response.json();
          alert(error.error || "Failed to add subject");
        }
      } catch (error) {
        console.error("Error adding subject:", error);
        alert("Failed to add subject. Please try again.");
      }
    }
  
    // Global functions for edit and delete operations
    window.editSubject = function(code, name, batch, module, faculty) {
      document.getElementById("update-subject-code").value = code;
      document.getElementById("update-subject-name").value = name;
      document.getElementById("update-batch").value = batch;
      document.getElementById("update-module").value = module;
      document.getElementById("update-faculty").value = faculty;
      window.location.href = "#update-popup";
    };
  
    window.deleteSubject = function(code, name) {
      document.getElementById("delete-subject-name").textContent = name;
      window.location.href = "#delete-popup";
  
      document.getElementById("confirm-delete").onclick = async function() {
        try {
          const response = await fetch(`/delete-subject/${code}`, {
            method: "DELETE"
          });
  
          if (response.ok) {
            await fetchSubjects();
            window.location.href = "#"; // Close popup
          } else {
            const error = await response.json();
            alert(error.error || "Failed to delete subject");
          }
        } catch (error) {
          console.error("Error deleting subject:", error);
          alert("Failed to delete subject. Please try again.");
        }
      };
  
      document.getElementById("cancel-delete").onclick = function() {
        window.location.href = "#"; // Close popup
      };
    };
  
    // Handle update form submission
    document.getElementById("updateSubjectForm").addEventListener("submit", async function(event) {
      event.preventDefault();
      const formData = {
        subject_name: document.getElementById("update-subject-name").value.trim(),
        subject_code: document.getElementById("update-subject-code").value.trim(),
        batch: document.getElementById("update-batch").value.trim(),
        module: document.getElementById("update-module").value.trim(),
        faculty: document.getElementById("update-faculty").value.trim()
      };
  
      try {
        const response = await fetch(`/update-subject/${formData.subject_code}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
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
  
    // Event listener for adding a subject
    subjectForm.addEventListener("submit", addSubject);
    fetchSubjects(); // Initial load of subjects
  });
  
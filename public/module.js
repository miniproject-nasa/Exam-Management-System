document.addEventListener("DOMContentLoaded", async function () {
  async function checkAuthStatus() {
    try {
        const response = await fetch("/check-auth");
         data = await response.json();

        if (!data.isAuthenticated) {
            window.location.href = "/index.html"; 
        }
        else
        {
            return data;
        }
    } catch (error) {
        console.error("Error checking auth status:", error);
    }
}
await checkAuthStatus();
  const moduleList = document.getElementById("module-list");
  const moduleForm = document.getElementById("moduleForm");
  const subjectsInput = document.getElementById("subjects");
  const facultiesInput = document.getElementById("faculties");
  const subjectsContainer = document.getElementById("subjects-container");
  const facultiesContainer = document.getElementById("faculties-container");

  let selectedSubjects = [];
  let selectedFaculties = [];
  let currentModuleId = null; // Stores the module ID for updates

  // Helper functions to open and close popups without changing the URL hash
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

  // Event delegation for all close buttons in popups
  document.addEventListener("click", function (e) {
    if (e.target.matches(".popup .close")) {
      e.preventDefault();
      const popup = e.target.closest(".popup");
      if (popup) {
        popup.classList.remove("active");
      }
    }
  });

  // Create update popup
  const updatePopupHtml = `
    <div id="update-popup" class="popup">
      <div class="popup-content">
        <a href="#" class="close">&times;</a>
        <form id="updateModuleForm">
          <label for="update-module-name">Module Name</label>
          <input type="text" id="update-module-name" readonly style="background-color: #f0f0f0; cursor: not-allowed;" />
          
          <label for="update-coordinator">Module Coordinator</label>
          <input type="text" id="update-coordinator" required />

          <label for="update-subjects">Subjects</label>
          <input type="text" id="update-subjects" placeholder="Select or type subject (e.g., CS101 - Intro to CS)" />
          <div id="update-subjects-container" class="tags-container"></div>

          <label for="update-faculties">Faculties</label>
          <input type="text" id="update-faculties" placeholder="Press Enter or comma to add multiple faculties" />
          <div id="update-faculties-container" class="tags-container"></div>

          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  `;

  // Create delete popup
  const deletePopupHtml = `
    <div id="delete-popup" class="popup">
      <div class="popup-content">
        <a href="#" class="close">&times;</a>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete module <span id="delete-module-name"></span>?</p>
        <div class="button-group">
          <button id="confirm-delete" class="danger">Delete</button>
          <button id="cancel-delete">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Append popups to document
  document.body.insertAdjacentHTML("beforeend", updatePopupHtml);
  document.body.insertAdjacentHTML("beforeend", deletePopupHtml);

  // Utility: Setup tag input for both add and update forms
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

  // Render the tags (chips)
  function renderTags(container, items) {
    container.innerHTML = "";
    items.forEach((item, index) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.innerHTML = `
        ${item}
        <span class="delete-tag" onclick="removeTag(this, ${index}, '${container.id}')">&times;</span>
      `;
      container.appendChild(tag);
    });
  }

  // Setup tag inputs for add form
  setupTagInput(subjectsInput, subjectsContainer, selectedSubjects);
  setupTagInput(facultiesInput, facultiesContainer, selectedFaculties);

  async function checkModuleExists(moduleName) {
    try {
      const response = await fetch("/api/modules");
      const modules = await response.json();
      return modules.some((module) => module.moduleName === moduleName);
    } catch (error) {
      console.error("Error checking module:", error);
      return false;
    }
  }

  async function fetchModules() {
    try {
      const response = await fetch("/api/modules");
      const modules = await response.json();

      moduleList.innerHTML = ""; // Clear existing content

      modules.forEach((module) => {
        const moduleElement = document.createElement("div");
        moduleElement.classList.add("information-box");
        moduleElement.innerHTML = `
          <ul class="information-type">
            <li>Module Name: ${module.moduleName}</li>
            <li>Module Coordinator: ${module.moduleCoordinator}</li>
            <li>Subjects: ${module.subjects.join(" | ")}</li>
            <li>Faculties: ${module.faculties.join(" | ")}</li>
          </ul>
          <div class="button-container">
            <button class="square-btn" onclick="editModule('${module._id}')">
              <img class="small-button" src="images/edit.webp" alt="Edit">
            </button>
            <button class="square-btn" onclick="deleteModule('${module._id}', '${module.moduleName}')">
              <img class="small-button-2" src="images/trash.webp" alt="Delete">
            </button>
          </div>
        `;
        moduleList.appendChild(moduleElement);
      });
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }

  // Handle add form submission
  moduleForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const moduleName = document.getElementById("module-name").value.trim();
    const moduleCoordinator = document.getElementById("module-coordinator").value.trim();

    if (
      !moduleName ||
      !moduleCoordinator ||
      selectedSubjects.length === 0 ||
      selectedFaculties.length === 0
    ) {
      alert("Please fill in all fields and add at least one subject and faculty.");
      return;
    }

    const exists = await checkModuleExists(moduleName);
    if (exists) {
      alert("Module name already exists. Please use a different name.");
      return;
    }

    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName,
          moduleCoordinator,
          subjects: selectedSubjects,
          faculties: selectedFaculties,
        }),
      });

      if (response.ok) {
        await fetchModules();
        moduleForm.reset();
        selectedSubjects = [];
        selectedFaculties = [];
        renderTags(subjectsContainer, selectedSubjects);
        renderTags(facultiesContainer, selectedFaculties);
        closePopup("popup-form");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add module");
      }
    } catch (error) {
      console.error("Error adding module:", error);
      alert("Failed to add module. Please try again.");
    }
  });

  // Global removeTag function
  window.removeTag = function (element, index, containerId) {
    const container = document.getElementById(containerId);
    const list = containerId.includes("subjects") ? selectedSubjects : selectedFaculties;
    list.splice(index, 1);
    renderTags(container, list);
  };

  // Delete module function
  window.deleteModule = function (moduleId, moduleName) {
    document.getElementById("delete-module-name").textContent = moduleName;
    openPopup("delete-popup");

    document.getElementById("confirm-delete").onclick = async function () {
      try {
        const response = await fetch(`/api/modules/${moduleId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchModules();
          closePopup("delete-popup");
        } else {
          const error = await response.json();
          alert(error.error || "Failed to delete module");
        }
      } catch (error) {
        console.error("Error deleting module:", error);
        alert("Failed to delete module. Please try again.");
      }
    };

    document.getElementById("cancel-delete").onclick = function () {
      closePopup("delete-popup");
    };
  };

  // Edit module function – now stores the module ID for updating
  window.editModule = async function (moduleId) {
    try {
      const response = await fetch(`/api/modules/${moduleId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const module = await response.json();
      
      // Check if we received valid module data
      if (!module || !module.moduleName) {
        throw new Error('Invalid module data received');
      }

      currentModuleId = moduleId;
      
      // Update form fields with module data
      const updateModuleNameInput = document.getElementById("update-module-name");
      const updateCoordinatorInput = document.getElementById("update-coordinator");
      const updateSubjectsContainer = document.getElementById("update-subjects-container");
      const updateFacultiesContainer = document.getElementById("update-faculties-container");

      if (!updateModuleNameInput || !updateCoordinatorInput || 
          !updateSubjectsContainer || !updateFacultiesContainer) {
        throw new Error('Required form elements not found');
      }

      updateModuleNameInput.value = module.moduleName;
      updateCoordinatorInput.value = module.moduleCoordinator;

      // Reset and update the selected arrays
      selectedSubjects = Array.isArray(module.subjects) ? [...module.subjects] : [];
      selectedFaculties = Array.isArray(module.faculties) ? [...module.faculties] : [];

      // Render the tags
      renderTags(updateSubjectsContainer, selectedSubjects);
      renderTags(updateFacultiesContainer, selectedFaculties);

      openPopup("update-popup");
    } catch (error) {
      console.error("Error in editModule:", error);
      console.error("Module ID:", moduleId);
      alert(`Failed to load module details: ${error.message}`);
    }
  };

  // Modified update form submission handler with better error handling
  document.getElementById("updateModuleForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    if (!currentModuleId) {
      alert("No module selected for update");
      return;
    }

    const moduleCoordinator = document.getElementById("update-coordinator").value.trim();

    if (!moduleCoordinator) {
      alert("Module coordinator is required");
      return;
    }

    if (selectedSubjects.length === 0 || selectedFaculties.length === 0) {
      alert("At least one subject and one faculty are required");
      return;
    }

    try {
      const response = await fetch(`/api/modules/${currentModuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleCoordinator,
          subjects: selectedSubjects,
          faculties: selectedFaculties,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchModules();
      closePopup("update-popup");
    } catch (error) {
      console.error("Error updating module:", error);
      alert(`Failed to update module: ${error.message}`);
    }
  });

  // Setup tag inputs for update form
  setupTagInput(
    document.getElementById("update-subjects"),
    document.getElementById("update-subjects-container"),
    selectedSubjects
  );
  setupTagInput(
    document.getElementById("update-faculties"),
    document.getElementById("update-faculties-container"),
    selectedFaculties
  );

  // --- Dropdown functionality for subjects in the add form ---
  let subjectsDropdown;

  async function createSubjectsDropdown() {
    if (subjectsDropdown) return;
    subjectsDropdown = document.createElement("div");
    subjectsDropdown.className = "dropdown";
    let subjectsList = [];
    try {
      const response = await fetch("/get-subjects");
      subjectsList = await response.json();
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
    subjectsList.forEach(subject => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = `${subject.S_code} - ${subject.S_name}`;
      item.onclick = function() {
        const subjectStr = `${subject.S_code} - ${subject.S_name}`;
        if (!selectedSubjects.includes(subjectStr)) {
          selectedSubjects.push(subjectStr);
          renderTags(subjectsContainer, selectedSubjects);
        }
        subjectsInput.value = "";
        hideSubjectsDropdown();
      };
      subjectsDropdown.appendChild(item);
    });
    document.body.appendChild(subjectsDropdown);
  }

  function showSubjectsDropdown() {
    if (!subjectsDropdown) {
      createSubjectsDropdown().then(() => {
        positionDropdown();
        subjectsDropdown.style.display = "block";
      });
    } else {
      positionDropdown();
      subjectsDropdown.style.display = "block";
    }
  }

  function hideSubjectsDropdown() {
    if (subjectsDropdown) {
      subjectsDropdown.style.display = "none";
    }
  }

  function positionDropdown() {
    const rect = subjectsInput.getBoundingClientRect();
    subjectsDropdown.style.left = rect.left + "px";
    subjectsDropdown.style.top = (rect.bottom + window.scrollY) + "px";
    subjectsDropdown.style.width = rect.width + "px";
  }

  subjectsInput.addEventListener("input", function() {
    const filter = subjectsInput.value.toLowerCase();
    Array.from(subjectsDropdown.children).forEach(item => {
      if (item.textContent.toLowerCase().includes(filter)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });

  subjectsInput.addEventListener("focus", showSubjectsDropdown);
  subjectsInput.addEventListener("blur", function() {
    setTimeout(hideSubjectsDropdown, 200);
  });

  // --- Dropdown functionality for subjects in the update form ---
  let updateSubjectsDropdown;
  const updateSubjectsInput = document.getElementById("update-subjects");

  async function createUpdateSubjectsDropdown() {
    if (updateSubjectsDropdown) return;
    updateSubjectsDropdown = document.createElement("div");
    updateSubjectsDropdown.className = "dropdown";
    let subjectsList = [];
    try {
      const response = await fetch("/get-subjects");
      subjectsList = await response.json();
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
    subjectsList.forEach(subject => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = `${subject.S_code} - ${subject.S_name}`;
      item.onclick = function() {
        const subjectStr = `${subject.S_code} - ${subject.S_name}`;
        if (!selectedSubjects.includes(subjectStr)) {
          selectedSubjects.push(subjectStr);
          renderTags(document.getElementById("update-subjects-container"), selectedSubjects);
        }
        updateSubjectsInput.value = "";
        hideUpdateSubjectsDropdown();
      };
      updateSubjectsDropdown.appendChild(item);
    });
    document.body.appendChild(updateSubjectsDropdown);
  }

  function showUpdateSubjectsDropdown() {
    if (!updateSubjectsDropdown) {
      createUpdateSubjectsDropdown().then(() => {
        positionUpdateSubjectsDropdown();
        updateSubjectsDropdown.style.display = "block";
      });
    } else {
      positionUpdateSubjectsDropdown();
      updateSubjectsDropdown.style.display = "block";
    }
  }

  function hideUpdateSubjectsDropdown() {
    if (updateSubjectsDropdown) {
      updateSubjectsDropdown.style.display = "none";
    }
  }

  function positionUpdateSubjectsDropdown() {
    const rect = updateSubjectsInput.getBoundingClientRect();
    updateSubjectsDropdown.style.left = rect.left + "px";
    updateSubjectsDropdown.style.top = (rect.bottom + window.scrollY) + "px";
    updateSubjectsDropdown.style.width = rect.width + "px";
  }

  updateSubjectsInput.addEventListener("input", function() {
    const filter = updateSubjectsInput.value.toLowerCase();
    if (updateSubjectsDropdown) {
      Array.from(updateSubjectsDropdown.children).forEach(item => {
        if (item.textContent.toLowerCase().includes(filter)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    }
  });

  updateSubjectsInput.addEventListener("focus", showUpdateSubjectsDropdown);
  updateSubjectsInput.addEventListener("blur", function() {
    setTimeout(hideUpdateSubjectsDropdown, 200);
  });

  // Event listener for opening add module popup
  document.getElementById("open-add-module").addEventListener("click", function() {
    openPopup("popup-form");
  });

  fetchModules(); // Initial load of modules
});
    
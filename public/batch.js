document.addEventListener("DOMContentLoaded", async function () {
  const batchList = document.getElementById("batch-list");
  const batchForm = document.getElementById("batchForm");
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

  // Helper functions to open/close popups by toggling the "active" class
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

  // Event delegation for all close buttons in popups (works for dynamically added ones)
  document.addEventListener("click", function (e) {
    if (e.target.matches(".popup .close")) {
      e.preventDefault();
      const popup = e.target.closest(".popup");
      if (popup) {
        popup.classList.remove("active");
      }
    }
  });

  // Create update popup (using template literal)
  const updatePopupHtml = `
      <div id="update-popup" class="popup">
        <div class="popup-content">
          <a href="#" class="close">&times;</a>
          <form id="updateBatchForm">
            <label for="update-batch-name">Batch No</label>
            <input type="text" id="update-batch-name" name="update-batch-name" readonly style="background-color: #f0f0f0; cursor: not-allowed;" />
            
            <label for="update-strength">Strength</label>
            <input type="text" id="update-strength" name="update-strength" required />
            
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
          <p id="delete-confirm">Are you sure you want to delete batch <span id="delete-batch-name"></span>?</p>
          <div class="button-group">
            <button id="confirm-delete" class="danger">Delete</button>
            <button id="cancel-delete">Cancel</button>
          </div>
        </div>
      </div>
    `;

  // Insert update and delete popups into the document
  document.body.insertAdjacentHTML("beforeend", updatePopupHtml);
  document.body.insertAdjacentHTML("beforeend", deletePopupHtml);

  async function checkBatchExists(batchName) {
    try {
      const response = await fetch("/get-batches");
      const batches = await response.json();
      return batches.some((batch) => batch.B_name === batchName);
    } catch (error) {
      console.error("Error checking batch:", error);
      return false;
    }
  }

  async function fetchBatches() {
    try {
      const response = await fetch("/get-batches");
      const batches = await response.json();

      batchList.innerHTML = ""; // Clear existing content

      batches.forEach((batch) => {
        const batchElement = document.createElement("div");
        batchElement.classList.add("information-box");
        batchElement.innerHTML = `
            <ul class="information-type">
              <li>Batch: ${batch.B_name}</li>
              <li>Strength: ${batch.B_strenth}</li>
            </ul>
            <div class="button-container">
              <button class="square-btn" onclick="editBatch('${batch.B_name}', '${batch.B_strenth}')">
                <img class="small-button" src="images/edit.webp" alt="Edit">
              </button>
              <button class="square-btn" onclick="deleteBatch('${batch.B_name}')">
                <img class="small-button-2" src="images/trash.webp" alt="Delete">
              </button>
            </div>
          `;
        batchList.appendChild(batchElement);
      });
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  }

  async function addBatch(event) {
    event.preventDefault();
    const batchName = document.getElementById("batch-name").value.trim();
    const strength = document.getElementById("strength").value.trim();

    if (!batchName || !strength) {
      alert("Please fill in all fields.");
      return;
    }

    // Check if batch already exists
    const exists = await checkBatchExists(batchName);
    if (exists) {
      alert("Batch number already exists. Please use a different batch name.");
      return;
    }

    try {
      const response = await fetch("/add-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ B_name: batchName, B_strenth: strength }),
      });

      if (response.ok) {
        await fetchBatches();
        batchForm.reset();
        closePopup("popup-form");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add batch");
      }
    } catch (error) {
      console.error("Error adding batch:", error);
      alert("Failed to add batch. Please try again.");
    }
  }

  // Global functions for edit and delete (exposed to window)
  window.editBatch = function (batchName, currentStrength) {
    document.getElementById("update-batch-name").value = batchName;
    document.getElementById("update-strength").value = currentStrength;
    openPopup("update-popup");
  };

  window.deleteBatch = function (batchName) {
    document.getElementById("delete-batch-name").textContent = batchName;
    openPopup("delete-popup");

    document.getElementById("confirm-delete").onclick = async function () {
      try {
        const response = await fetch(`/delete-batch/${batchName}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchBatches();
          closePopup("delete-popup");
        } else {
          const error = await response.json();
          alert(error.error || "Failed to delete batch");
        }
      } catch (error) {
        console.error("Error deleting batch:", error);
        alert("Failed to delete batch. Please try again.");
      }
    };

    document.getElementById("cancel-delete").onclick = function () {
      closePopup("delete-popup");
    };
  };

  // Handle update form submission
  document
    .getElementById("updateBatchForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const batchName = document.getElementById("update-batch-name").value;
      const strength = document.getElementById("update-strength").value;

      try {
        const response = await fetch(`/update-batch/${batchName}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ B_strenth: strength }),
        });

        if (response.ok) {
          await fetchBatches();
          closePopup("update-popup");
        } else {
          const error = await response.json();
          alert(error.error || "Failed to update batch");
        }
      } catch (error) {
        console.error("Error updating batch:", error);
        alert("Failed to update batch. Please try again.");
      }
    });

  // Event listener for add batch popup button
  document
    .getElementById("open-add-batch")
    .addEventListener("click", function () {
      openPopup("popup-form");
    });

  batchForm.addEventListener("submit", addBatch);
  fetchBatches(); // Initial load of batches
});

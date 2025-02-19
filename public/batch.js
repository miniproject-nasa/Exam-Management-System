document.addEventListener("DOMContentLoaded", async function () {
    const batchList = document.getElementById("batch-list");
    const batchForm = document.getElementById("batchForm");

    // Create update popup
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
                <p>Are you sure you want to delete batch <span id="delete-batch-name"></span>?</p>
                <div class="button-group">
                    <button id="confirm-delete" class="danger">Delete</button>
                    <button id="cancel-delete">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Add popups to document
    document.body.insertAdjacentHTML("beforeend", updatePopupHtml);
    document.body.insertAdjacentHTML("beforeend", deletePopupHtml);

    async function checkBatchExists(batchName) {
        try {
            const response = await fetch("/get-batches");
            const batches = await response.json();
            return batches.some(batch => batch.B_name === batchName);
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

            batches.forEach(batch => {
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
                body: JSON.stringify({ 
                    B_name: batchName, 
                    B_strenth: strength 
                }),
            });

            if (response.ok) {
                await fetchBatches();
                batchForm.reset();
                window.location.href = "#"; // Close popup
            } else {
                const error = await response.json();
                alert(error.error || "Failed to add batch");
            }
        } catch (error) {
            console.error("Error adding batch:", error);
            alert("Failed to add batch. Please try again.");
        }
    }

    // Global functions for edit and delete
    window.editBatch = function(batchName, currentStrength) {
        document.getElementById("update-batch-name").value = batchName;
        document.getElementById("update-strength").value = currentStrength;
        window.location.href = "#update-popup";
    };

    window.deleteBatch = function(batchName) {
        document.getElementById("delete-batch-name").textContent = batchName;
        window.location.href = "#delete-popup";

        document.getElementById("confirm-delete").onclick = async function() {
            try {
                const response = await fetch(`/delete-batch/${batchName}`, {
                    method: "DELETE"
                });

                if (response.ok) {
                    await fetchBatches();
                    window.location.href = "#"; // Close popup
                } else {
                    const error = await response.json();
                    alert(error.error || "Failed to delete batch");
                }
            } catch (error) {
                console.error("Error deleting batch:", error);
                alert("Failed to delete batch. Please try again.");
            }
        };

        document.getElementById("cancel-delete").onclick = function() {
            window.location.href = "#"; // Close popup
        };
    };

    // Handle update form submission
    document.getElementById("updateBatchForm").addEventListener("submit", async function(event) {
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
                window.location.href = "#"; // Close popup
            } else {
                const error = await response.json();
                alert(error.error || "Failed to update batch");
            }
        } catch (error) {
            console.error("Error updating batch:", error);
            alert("Failed to update batch. Please try again.");
        }
    });

    // Event listeners
    batchForm.addEventListener("submit", addBatch);
    fetchBatches(); // Initial load of batches
});
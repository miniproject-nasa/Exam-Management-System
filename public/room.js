document.addEventListener("DOMContentLoaded", async function () {
  
  async function checkAuthStatus() {
    try {
      const response = await fetch("/check-auth");
      data = await response.json();

      if (!data.isAuthenticated) {
        window.location.href = "/index.html"; 
      } else {
        return data;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }
  await checkAuthStatus();
  const roomList = document.getElementById("room-list");
  const roomForm = document.getElementById("roomForm");

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

  // Event listener for the add new room button to open the add room popup
  const addRoomButton = document.getElementById("open-add-room");
  if (addRoomButton) {
    addRoomButton.addEventListener("click", function () {
      openPopup("popup-form");
    });
  }

  // Event delegation for all close buttons in popups (works even for dynamically added ones)
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
                <form id="updateRoomForm">
                <label for="update-room-no">Room No</label>
                <input type="text" id="update-room-no" name="update-room-no" readonly style="background-color: #f0f0f0; cursor: not-allowed;" />
                
                <label for="update-capacity">Capacity</label>
                <input type="text" id="update-capacity" name="update-capacity" required />
      
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
          <p id="delete-confirm">Are you sure you want to delete room <span id="delete-room-no"></span>?</p>
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

  async function checkRoomExists(roomNo) {
    try {
      const response = await fetch("/get-rooms");
      const rooms = await response.json();
      return rooms.some((room) => room.R_code === roomNo);
    } catch (error) {
      console.error("Error checking room:", error);
      return false;
    }
  }

  async function fetchRooms() {
    try {
      const response = await fetch("/get-rooms");
      const rooms = await response.json();

      roomList.innerHTML = ""; // Clear existing content

      rooms.forEach((room) => {
        const roomElement = document.createElement("div");
        roomElement.classList.add("information-box");
        roomElement.innerHTML = `
            <ul class="information-type">
              <li>Room No: ${room.R_code}</li>
              <li>Capacity: ${room.R_capacity}</li>
            </ul>
            <div class="button-container">
              <button class="square-btn" onclick="editRoom('${room.R_code}', '${room.R_capacity}')">
                <img class="small-button" src="images/edit.webp" alt="Edit">
              </button>
              <button class="square-btn" onclick="deleteRoom('${room.R_code}')">
                <img class="small-button-2" src="images/trash.webp" alt="Delete">
              </button>
            </div>
          `;
        roomList.appendChild(roomElement);
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  async function addRoom(event) {
    event.preventDefault();
    const roomNo = document.getElementById("room-no").value.trim();
    const capacity = document.getElementById("capacity").value.trim();

    if (!roomNo || !capacity) {
      alert("Please fill in all fields.");
      return;
    }

    // Check if room number already exists
    const exists = await checkRoomExists(roomNo);
    if (exists) {
      alert("Room number already exists. Please use a different room number.");
      return;
    }

    try {
      const response = await fetch("/add-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ R_code: roomNo, R_capacity: capacity }),
      });

      if (response.ok) {
        await fetchRooms();
        roomForm.reset();
        closePopup("popup-form"); // Close popup using helper
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add room");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Failed to add room. Please try again.");
    }
  }

  // Add these functions to the global scope
  window.deleteRoom = function (roomCode) {
    // Show delete popup
    document.getElementById("delete-room-no").textContent = roomCode;
    openPopup("delete-popup");

    // Handle delete confirmation
    document.getElementById("confirm-delete").onclick = async function () {
      try {
        const response = await fetch(`/delete-room/${roomCode}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchRooms();
          closePopup("delete-popup"); // Close popup using helper
        } else {
          const error = await response.json();
          alert(error.error || "Failed to delete room");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        alert("Failed to delete room. Please try again.");
      }
    };

    // Handle cancel
    document.getElementById("cancel-delete").onclick = function () {
      closePopup("delete-popup"); // Close popup using helper
    };
  };

  window.editRoom = function (roomCode, currentCapacity) {
    // Populate update form
    document.getElementById("update-room-no").value = roomCode;
    document.getElementById("update-capacity").value = currentCapacity;
    openPopup("update-popup");
  };

  // Handle update form submission
  document
    .getElementById("updateRoomForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const roomCode = document.getElementById("update-room-no").value;
      const capacity = document.getElementById("update-capacity").value;

      try {
        const response = await fetch(`/update-room/${roomCode}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ R_capacity: capacity }),
        });

        if (response.ok) {
          await fetchRooms();
          closePopup("update-popup"); // Close popup using helper
        } else {
          const error = await response.json();
          alert(error.error || "Failed to update room");
        }
      } catch (error) {
        console.error("Error updating room:", error);
        alert("Failed to update room. Please try again.");
      }
    });

  roomForm.addEventListener("submit", addRoom);
  fetchRooms(); // Initial load of rooms
});

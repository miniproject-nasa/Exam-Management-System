document.addEventListener("DOMContentLoaded", async function () {
  // 1. Check authentication status
  async function checkAuthStatus() {
    try {
      const response = await fetch("/check-auth");
      const data = await response.json();
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

  // 2. Grab DOM elements
  const userList = document.getElementById("user-list");
  const userForm = document.getElementById("userForm");
  const updateUserForm = document.getElementById("updateUserForm");
  let currentUserId = null;

  // For roles dropdown in add form
  const rolesInput = document.getElementById("roles");
  const rolesContainer = document.getElementById("roles-container");
  let rolesDropdown;
  const fixedRoles = ["FC", "MC", "EC", "AEC","HOD"];
  let selectedRoles = [];

  // For roles dropdown in update form
  const updateRolesInput = document.getElementById("update-roles");
  const updateRolesContainer = document.getElementById("update-roles-container");
  let updateRolesDropdown;
  let selectedRolesUpdate = [];

  // 3. Helper: Open/Close Popup
  function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) popup.classList.add("active");
  }
  function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) popup.classList.remove("active");
  }
  document.addEventListener("click", function (e) {
    if (e.target.matches(".popup .close")) {
      e.preventDefault();
      const popup = e.target.closest(".popup");
      if (popup) popup.classList.remove("active");
    }
  });

  // 4. Dropdown functionality for roles in the Add form
  async function createRolesDropdown() {
    if (rolesDropdown) return;
    rolesDropdown = document.createElement("div");
    rolesDropdown.className = "dropdown";
    fixedRoles.forEach(role => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = role;
      item.onclick = function () {
        if (!selectedRoles.includes(role)) {
          selectedRoles.push(role);
          renderTags(rolesContainer, selectedRoles);
        }
        rolesInput.value = "";
        hideRolesDropdown();
      };
      rolesDropdown.appendChild(item);
    });
    document.body.appendChild(rolesDropdown);
  }
  function showRolesDropdown() {
    if (!rolesDropdown) {
      createRolesDropdown().then(() => {
        positionRolesDropdown();
        rolesDropdown.style.display = "block";
      });
    } else {
      positionRolesDropdown();
      rolesDropdown.style.display = "block";
    }
  }
  function hideRolesDropdown() {
    if (rolesDropdown) rolesDropdown.style.display = "none";
  }
  function positionRolesDropdown() {
    const rect = rolesInput.getBoundingClientRect();
    rolesDropdown.style.left = rect.left + "px";
    rolesDropdown.style.top = (rect.bottom + window.scrollY) + "px";
    rolesDropdown.style.width = rect.width + "px";
  }
  rolesInput.addEventListener("input", function () {
    const filter = rolesInput.value.toLowerCase();
    Array.from(rolesDropdown.children).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(filter)
        ? "block"
        : "none";
    });
  });
  rolesInput.addEventListener("focus", showRolesDropdown);
  rolesInput.addEventListener("blur", function () {
    setTimeout(hideRolesDropdown, 200);
  });

  // 5. Dropdown functionality for roles in the Update form
  async function createUpdateRolesDropdown() {
    if (updateRolesDropdown) return;
    updateRolesDropdown = document.createElement("div");
    updateRolesDropdown.className = "dropdown";
    fixedRoles.forEach(role => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = role;
      item.onclick = function () {
        if (!selectedRolesUpdate.includes(role)) {
          selectedRolesUpdate.push(role);
          renderTags(updateRolesContainer, selectedRolesUpdate);
        }
        updateRolesInput.value = "";
        hideUpdateRolesDropdown();
      };
      updateRolesDropdown.appendChild(item);
    });
    document.body.appendChild(updateRolesDropdown);
  }
  function showUpdateRolesDropdown() {
    if (!updateRolesDropdown) {
      createUpdateRolesDropdown().then(() => {
        positionUpdateRolesDropdown();
        updateRolesDropdown.style.display = "block";
      });
    } else {
      positionUpdateRolesDropdown();
      updateRolesDropdown.style.display = "block";
    }
  }
  function hideUpdateRolesDropdown() {
    if (updateRolesDropdown) updateRolesDropdown.style.display = "none";
  }
  function positionUpdateRolesDropdown() {
    const rect = updateRolesInput.getBoundingClientRect();
    updateRolesDropdown.style.left = rect.left + "px";
    updateRolesDropdown.style.top = (rect.bottom + window.scrollY) + "px";
    updateRolesDropdown.style.width = rect.width + "px";
  }
  updateRolesInput.addEventListener("input", function () {
    const filter = updateRolesInput.value.toLowerCase();
    if (updateRolesDropdown) {
      Array.from(updateRolesDropdown.children).forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(filter)
          ? "block"
          : "none";
      });
    }
  });
  updateRolesInput.addEventListener("focus", showUpdateRolesDropdown);
  updateRolesInput.addEventListener("blur", function () {
    setTimeout(hideUpdateRolesDropdown, 200);
  });

  // 6. Helper: Render tags
  function renderTags(container, items) {
    container.innerHTML = "";
    items.forEach((item, index) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.innerHTML = `
        ${item}
        <span class="delete-tag" onclick="removeTag('${container.id}', ${index})">&times;</span>
      `;
      container.appendChild(tag);
    });
  }
  // Expose removeTag globally for inline onclick
  window.removeTag = function (containerId, index) {
    if (containerId === "roles-container") {
      selectedRoles.splice(index, 1);
      renderTags(rolesContainer, selectedRoles);
    } else if (containerId === "update-roles-container") {
      selectedRolesUpdate.splice(index, 1);
      renderTags(updateRolesContainer, selectedRolesUpdate);
    }
  };

  // 7. Fetch & Render Users
  async function fetchUsers() {
    try {
      const response = await fetch("/get-users");
      const users = await response.json();
      renderUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  function renderUsers(users) {
    userList.innerHTML = "";
    users.forEach((user) => {
      const userDiv = document.createElement("div");
      userDiv.classList.add("information-box");
      userDiv.innerHTML = `
        <ul class="information-type">
          <li>Name: ${user.U_name}</li>
          <li>Phone: ${user.U_phone}</li>
          <li>Email: ${user.U_email}</li>
          <li>Roles: ${user.U_role.join(", ")}</li>
          <li>Username: ${user.U_id}</li>
        </ul>
        <div class="button-container">
          <button class="square-btn" onclick="editUser('${user.U_id}')">
            <img class="small-button" src="images/edit.webp" alt="Edit">
          </button>
          <button class="square-btn" onclick="deleteUser('${user.U_id}')">
            <img class="small-button-2" src="images/trash.webp" alt="Delete">
          </button>
        </div>
      `;
      userList.appendChild(userDiv);
    });
  }

  // 8. Show Credentials Popup after adding user
  function showCredentialsPopup(username) {
    // Assuming default password is "abcd1234"
    const popup = document.getElementById("credentials-popup");
    const text = document.getElementById("credentials-text");
    text.textContent = `Username: ${username}\nPassword: abcd1234`;
    openPopup("credentials-popup");
  }

  // Copy credentials function
  window.copyCredentials = function () {
    const text = document.getElementById("credentials-text").textContent;
    navigator.clipboard.writeText(text)
      .then(() => alert("Credentials copied to clipboard!"))
      .catch(err => console.error("Error copying credentials:", err));
  };

  // 9. Add New User
  userForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const U_name = document.getElementById("userName").value.trim();
    const U_phone = document.getElementById("phone").value.trim();
    const U_email = document.getElementById("email").value.trim();
    const U_id = document.getElementById("username").value.trim();

    if (!U_name || !U_phone || !U_email || !U_id || selectedRoles.length === 0) {
      alert("Please fill in all fields and add at least one role.");
      return;
    }

    try {
      const response = await fetch("/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          U_name,
          U_phone,
          U_email,
          U_role: selectedRoles,
          U_id,
        }),
      });
      if (response.ok) {
        await fetchUsers();
        userForm.reset();
        selectedRoles = [];
        renderTags(rolesContainer, selectedRoles);
        closePopup("popup-form");
        showCredentialsPopup(U_id);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Please try again.");
    }
  });

  // 10. Edit User
  window.editUser = async function (userId) {
    try {
      const response = await fetch("/get-users");
      const users = await response.json();
      const foundUser = users.find((u) => u.U_id === userId);
      if (!foundUser) {
        alert("User not found");
        return;
      }
      currentUserId = foundUser.U_id;
      document.getElementById("update-userName").value = foundUser.U_name;
      document.getElementById("update-phone").value = foundUser.U_phone;
      document.getElementById("update-email").value = foundUser.U_email;
      document.getElementById("update-username").value = foundUser.U_id;

      // Pre-select roles for update
      selectedRolesUpdate = [...foundUser.U_role];
      renderTags(updateRolesContainer, selectedRolesUpdate);
      updateRolesInput.value = "";
      openPopup("update-popup");
    } catch (error) {
      console.error("Error fetching user for edit:", error);
    }
  };

  // 11. Update User
  updateUserForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!currentUserId) {
      alert("No user selected for update");
      return;
    }
    const U_phone = document.getElementById("update-phone").value.trim();
    const U_email = document.getElementById("update-email").value.trim();
    if (!U_phone || !U_email || selectedRolesUpdate.length === 0) {
      alert("Please fill in phone, email, and add at least one role.");
      return;
    }
    try {
      const response = await fetch(`/update-user/${currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          U_phone,
          U_email,
          U_role: selectedRolesUpdate,
        }),
      });
      if (response.ok) {
        await fetchUsers();
        closePopup("update-popup");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  });

  // 12. Delete User
  window.deleteUser = function (userId) {
    document.getElementById("delete-user-id").textContent = userId;
    openPopup("delete-popup");
    document.getElementById("confirm-delete").onclick = async function () {
      try {
        const response = await fetch(`/delete-user/${userId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchUsers();
          closePopup("delete-popup");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    };
    document.getElementById("cancel-delete").onclick = function () {
      closePopup("delete-popup");
    };
  };

  // 13. Open "Add User" Popup
  document.getElementById("open-add-user").addEventListener("click", function () {
    userForm.reset();
    selectedRoles = [];
    renderTags(rolesContainer, selectedRoles);
    openPopup("popup-form");
  });

  // 14. Initial load
  await fetchUsers();
});

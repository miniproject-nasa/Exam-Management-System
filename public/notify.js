document.addEventListener("DOMContentLoaded", async function () {
    fetchFaculties();

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
            showPopup("Error checking authentication status", "error");
        }
    }
    await checkAuthStatus();

    const inputFile = document.getElementById("inputFile");
    const pdfContainer = document.querySelector(".pdf-container");

    pdfContainer.innerHTML = ``;
    inputFile.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const fileURL = URL.createObjectURL(file);
            pdfContainer.innerHTML = `<div class="pdf-box">
                <p class="pdf-box-content"><a href="${fileURL}" target="_blank">${file.name} (${(file.size / 1024).toFixed(2)})KB</a></p>`;
        } else {
            pdfContainer.innerHTML = `<p class="pdf-box-content">No file chosen</p>`;
        }
    });

    const notifyForm = document.querySelector("#notifyForm");

    notifyForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const to = document.querySelector("#faculties").value;
        const textMessage = document.querySelector("#textmessage").value.trim();
        const file = document.querySelector("#inputFile").files[0];

        if (!file && !textMessage) {
            showPopup("Please provide at least a text message or a file.", "warning");
            return;
        }

        const formData = new FormData();
        if (file) {
            formData.append('pdfFile', file);
        }
        formData.append('to', to);
        formData.append('textmessage', textMessage);
        formData.append('from', data.user.username);

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                showPopup("Notification sent successfully!", "success", () => location.reload(true));
            } else {
                showPopup("Failed to send notification.", "error");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            showPopup("Error sending notification.", "error");
        }
    });

    async function fetchFaculties() {
        try {
            const facultyResponse = await fetch('/api/notify/faculty');
            const faculties = await facultyResponse.json();
            populateDropdown('faculties', faculties.map(f => f.U_name));
        } catch (error) {
            console.error('Error fetching data:', error);
            showPopup('Error loading data from server', "error");
        }
    }

    function populateDropdown(id, items) {
        const select = document.getElementById(id);
        while (select.options.length > 1) {
            select.remove(1);
        }
        const option = document.createElement('option');
        option.text = "all";
        option.value = "all";
        select.add(option);
        items.forEach(item => {
            const option = document.createElement('option');
            option.text = item;
            option.value = item;
            select.add(option);
        });
    }
});

// Function to Show Styled Popups
function showPopup(message, type = "info", callback = null) {
    const popup = document.createElement("div");
    popup.classList.add("popup", "active");
    
    let bgColor = "#0f62fe"; // Default blue
    if (type === "success") bgColor = "green";
    if (type === "warning") bgColor = "orange";
    if (type === "error") bgColor = "red";

    popup.innerHTML = `
        <div class="popup-content" style="border-left: 5px solid ${bgColor};">
            <span class="close">&times;</span>
            <p>${message}</p>
            <button class="close-popup">OK</button>
        </div>
    `;

    document.body.appendChild(popup);

    document.querySelector(".close-popup").addEventListener("click", () => {
        popup.classList.remove("active");
        setTimeout(() => {
            popup.remove();
            if (callback) callback();
        }, 300);
    });

    document.querySelector(".close").addEventListener("click", () => {
        popup.classList.remove("active");
        setTimeout(() => popup.remove(), 300);
    });
}

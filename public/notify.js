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
            alert("Please provide at least a text message or a file.");
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
                alert("Notification sent successfully!");
                location.reload(true);
            } else {
                alert("Failed to send notification.");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    });

    async function fetchFaculties() {
        try {
            const facultyResponse = await fetch('/api/notify/faculty');
            const faculties = await facultyResponse.json();
            populateDropdown('faculties', faculties.map(f => f.U_name));
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error loading data from server');
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

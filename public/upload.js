document.addEventListener("DOMContentLoaded", async function () {
    let data = [];

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

    async function subjectDropdown() {
        try {
            const response = await fetch("/get-subjects");
            const subjects = await response.json();
            const subSection = document.querySelector("#subject");
            subjects.forEach(subject => {
                subSection.innerHTML += `
                    <option value="${subject.S_code} - ${subject.S_name}">${subject.S_code} - ${subject.S_name}</option>
                `;
            });
        } catch (error) {
            console.log("Error loading subjects:", error);
        }
    }
    await subjectDropdown();

    async function batchDropdown() {
        try {
            const response = await fetch("/get-batches");
            const batches = await response.json();
            const batchSection = document.querySelector("#batch");

            batches.forEach(batch => {
                batchSection.innerHTML += `
                    <option value="${batch.B_name}">${batch.B_name}</option>
                `;
            });
        } catch (error) {
            console.log("Error loading batches:", error);
        }
    }
    await batchDropdown();

    const now = new Date();
    console.log(now.toISOString().replace("T", " ").split(".")[0]);
    console.log(data.user);

    const inputFile = document.getElementById("inputFile");
    const pdfContainer = document.querySelector(".pdf-container");

    // Show PDF preview
    pdfContainer.innerHTML = ``;
    inputFile.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const fileURL = URL.createObjectURL(file);
            pdfContainer.innerHTML = `
                <div class="pdf-box">
                    <p class="pdf-box-content">
                        <a href="${fileURL}" target="_blank">${file.name} (${(file.size / 1024).toFixed(2)} KB)</a>
                    </p>
                </div>`;
        } else {
            pdfContainer.innerHTML = `<p class="pdf-box-content">No file chosen</p>`;
        }
    });

    document.querySelector("#upload").addEventListener("submit", async function (e) {
        e.preventDefault();
        const mode = document.querySelector("#mode").value;
        const subject = document.querySelector("#subject").value;
        const batch = document.querySelector("#batch").value;
        const file = document.querySelector("#inputFile").files[0];
        const dAndT = now.toISOString().replace("T", " ").split(".")[0];

        if (!file) {
            showPopup("Please select a file", "error");
            return;
        }

        const formData = new FormData();
        formData.append("pdfFile", file);
        formData.append("mode", mode);
        formData.append("subject", subject);
        formData.append("batch", batch);
        formData.append("dt", dAndT);
        formData.append("from", data.user.username);

        try {
            const response = await fetch("/upload-trial", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                showPopup("File uploaded successfully!", "success");
                setTimeout(() => location.reload(true), 1000);
            } else {
                showPopup("Upload failed. Please try again.", "error");
            }
        } catch (error) {
            console.log("Error uploading file:", error);
            showPopup("Something went wrong. Please try again later.", "error");
        }
    });

    function showPopup(message, type = "info") {
        const popup = document.createElement("div");
        popup.classList.add("popup", "active");

        let bgColor = "#0f62fe"; // Default blue
        if (type === "success") bgColor = "green";
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
            setTimeout(() => popup.remove(), 300);
        });
        document.querySelector(".close").addEventListener("click", () => {
            popup.classList.remove("active");
            setTimeout(() => popup.remove(), 300);
        });
    }
});

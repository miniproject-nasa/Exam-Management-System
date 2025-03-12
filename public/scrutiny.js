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
            showPopup("Error checking authentication status", "error");
        }
    }
    await checkAuthStatus();

    async function inbox(to) {
        try {
            const response = await fetch(`/get-trial/${to}`);
            if (!response.ok) {
                showPopup("Failed to load inbox", "error");
                return;
            }

            const inboxs = await response.json();
            const mainContainer = document.querySelector(".main-content");

            mainContainer.innerHTML = "";
            inboxs.reverse();

            inboxs.forEach((inbox) => {
                // Convert base64 to Blob URL
                const byteCharacters = atob(inbox.data);
                const byteNumbers = new Array(byteCharacters.length)
                    .fill()
                    .map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);

                if (inbox.mode === "trial") {
                    mainContainer.innerHTML += `
                    <section class="content-section" data-section='${inbox._id}'>
                        <div class="allocated-container"></div>
                        <ul class="information-type">
                            <li><span class="highlight-text">${inbox.subject}</span></li>
                        </ul>
                        <div class="pdf-container">
                            <div class="pdf-box">
                                <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${inbox.fileName}</a>
                            </div>
                        </div>
                        <div class="bottom-right-container">
                            <div class="form-group">
                                <div class="dropdown">
                                    <select id="faculties" name="reciever">
                                        <option value="" disabled selected>Select the recipient</option>
                                    </select>
                                </div>
                            </div>
                            <button class="send-button">Allocate</button>
                        </div>
                    </section>`;
                } else {
                    mainContainer.innerHTML += `
                    <section class="content-section" data-section='${inbox._id}'>
                        <div class="allocated-container"></div>
                        <ul class="information-type">
                            <li><span class="highlight-text">${inbox.subject}</span></li>
                        </ul>
                        <div class="pdf-container">
                            <div class="pdf-box">
                                <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${inbox.fileName}</a>
                            </div>
                        </div>
                        <div class="bottom-right-container">
                            <div class="form-group">
                                <div class="dropdown">
                                    <p id="faculty">${inbox.allocate}</p>
                                </div>
                            </div>
                        </div>
                    </section>`;
                }
            });
        } catch (error) {
            console.log(error);
            showPopup("Error loading inbox", "error");
        }
    }
    console.log(data.user.username);
    await inbox(data.user.username);

    document.querySelectorAll(".send-button").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            const sec = e.target.closest("section");
            const id = sec.dataset.section;
            const rtContainer = e.target.parentElement;
            const secContainer = rtContainer.parentElement;
            const selection = rtContainer.querySelector(".form-group .dropdown #faculties");
            const faculty = selection.value;

            if (!faculty) {
                showPopup("Please select a faculty", "error");
                return;
            }

            try {
                fetch(`/trial-update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ faculty })
                });
            } catch (error) {
                console.error(error);
                showPopup("Error allocating faculty", "error");
                return;
            }

            showPopup(`Allocated to ${faculty}`, "success");
            e.target.style.display = "none";
            let Fpara = document.createElement("p");
            Fpara.innerText = faculty;
            Fpara.id = "faculty";
            selection.replaceWith(Fpara);
        });
    });

    async function fetchFaculties() {
        try {
            const facultyResponse = await fetch('/api/notify/faculty');
            const faculties = await facultyResponse.json();
            populateDropdown('faculties', faculties.map(f => f.U_name));
        } catch (error) {
            console.error("Error fetching data:", error);
            showPopup("Error loading faculties", "error");
        }
    }

    function populateDropdown(id, items) {
        const counts = document.querySelectorAll("#faculties");
        counts.forEach((select) => {
            while (select.options.length > 1) {
                select.remove(1);
            }
            items.forEach(item => {
                const option = document.createElement("option");
                option.text = item;
                option.value = item;
                select.add(option);
            });
        });
    }

    await fetchFaculties();
});
function showPopup(message, type = "info", callback = null) {
    const alertPopup = document.createElement("div");
    alertPopup.classList.add("alert-popup", "active");

    let bgColor = "#0f62fe"; // Default blue
    if (type === "success") bgColor = "green";
    if (type === "warning") bgColor = "orange";
    if (type === "error") bgColor = "red";

    alertPopup.innerHTML = `
        <div class="alert-popup-content" style="border-left: 5px solid ${bgColor};">
            <span class="alert-close">&times;</span>
            <p>${message}</p>
            <button class="alert-close-btn">OK</button>
        </div>
    `;

    document.body.appendChild(alertPopup);
    alertPopup.querySelector(".alert-close-btn").addEventListener("click", () => {
        alertPopup.classList.remove("active");
        setTimeout(() => {
            alertPopup.remove();
            if (callback) callback();
        }, 300);
    });
    alertPopup.querySelector(".alert-close").addEventListener("click", () => {
        alertPopup.classList.remove("active");
        setTimeout(() => alertPopup.remove(), 300);
    });
}

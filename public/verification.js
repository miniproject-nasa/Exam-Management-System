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

    console.log(data.user.username);

    async function inbox(to) {
        try {
            const response = await fetch(`/get-trial/${to}`);
            if (!response.ok) {
                showPopup("Failed to load inbox", "error");
                return;
            }

            const inboxs = await response.json();
            const mainContainer = document.querySelector(".main-content");

            inboxs.reverse();
            inboxs.forEach((inbox) => {
                if (inbox.mode === "scrutinized" || inbox.mode === "verified") {
                    const pdfUrl = createBlobUrl(inbox.data);
                    const SpdfUrl = createBlobUrl(inbox.sdata);

                    mainContainer.innerHTML += `
                        <section class="content-section" data-session="${inbox._id}">
                            <ul class="information-type">
                                <li><span class="highlight-text">${inbox.date}</span></li>
                            </ul>

                            <div class="pdf-container">
                                <div class="pdf-box">
                                    <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${inbox.fileName}</a>
                                </div>
                                <div class="pdf-box">
                                    <a href="${SpdfUrl}" target="_blank" class="pdf-box-content">${inbox.sfileName}</a>
                                </div>
                            </div>

                            <div class="bottom-right-container">
                                <div class="form-group">
                                    ${
                                      inbox.mode === "scrutinized"
                                        ? `<input class="suggestions" type="text" placeholder="Suggestions">`
                                        : `<p id="message">${inbox.textmesg}</p><span style="color:blue;font-size:15px;font-weight:600;">Verified</span>`
                                    }
                                </div>
                                ${
                                  inbox.mode === "scrutinized"
                                    ? `<button class="send-button">Verify</button>`
                                    : ""
                                }
                            </div>
                        </section>
                    `;
                }
            });

            attachVerifyEventListeners();
        } catch (error) {
            console.error("Error loading inbox:", error);
        }
    }

    await inbox(data.user.username);

    function attachVerifyEventListeners() {
        document.querySelectorAll(".send-button").forEach((btn) => {
            btn.addEventListener("click", async function (e) {
                const section = e.target.closest("section");
                const id = section.dataset.session;
                const textArea = section.querySelector(".suggestions");
                const textMessage = textArea.value.trim();

                if (!textMessage) {
                    showPopup("Please type a suggestion", "error");
                    return;
                }

                try {
                    await fetch(`/verify-update/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ textmesg: textMessage }),
                    });

                    showPopup("Verified successfully", "success");
                    e.target.style.display = "none";
                    textArea.replaceWith(
                        `<span style="color:blue;font-size:15px;font-weight:600;">Verified</span>`
                    );
                } catch (error) {
                    console.error("Error verifying:", error);
                }
            });
        });
    }

    function createBlobUrl(base64String) {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length)
            .fill()
            .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
        return URL.createObjectURL(pdfBlob);
    }

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

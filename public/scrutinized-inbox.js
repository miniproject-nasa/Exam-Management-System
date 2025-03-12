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

    async function loadScrutiny(to) {
        try {
            const response = await fetch(`/get-verified/${to}`);
            if (!response.ok) {
                showPopup("Failed to load scrutiny", "error");
                return;
            }

            const verifieded = await response.json();
            verifieded.reverse();

            const mainContainer = document.querySelector(".main-content");

            if (verifieded.length === 0) {
                showPopup("No verified scrutiny found", "info");
                return;
            }

            verifieded.forEach((verified) => {
                const pdfUrl = getPdfUrl(verified.sdata);

                mainContainer.innerHTML += `
                <section class="content-section">
                    <ul class="information-type">
                        <li>
                            <p class="message-text">${verified.textmesg}</p>
                            <ul class="pdf-container">
                                <li class="pdf-box">
                                    <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${verified.sfileName}</a>
                                </li>
                            </ul>
                        </li>
                    </ul>            
                </section>`;
            });

        } catch (error) {
            console.log(error);
            showPopup("Error loading scrutiny", "error");
        }
    }

    console.log(data.user.username);
    await loadScrutiny(data.user.username);
});

// Convert Base64 to Blob URL
function getPdfUrl(base64Data) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
    return URL.createObjectURL(pdfBlob);
}

// Function to Show Styled Popups
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

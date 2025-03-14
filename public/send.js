document.addEventListener("DOMContentLoaded", async function() {
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

    async function send(from) {
        try {
            const response = await fetch(`/get-pdfs-from/${from}`);
            if (!response.ok) {
                return; 
            }

            const sends = await response.json();
            const mainContainer = document.querySelector(".main-content");
            mainContainer.innerHTML = "";

            sends.reverse();
            sends.forEach((send) => {
                // Convert base64 to Blob URL
                const byteCharacters = atob(send.data.split(',')[1]); 
                const byteNumbers = new Array(byteCharacters.length)
                    .fill()
                    .map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
                mainContainer.innerHTML += `
                    <section class="content-section">
                        <ul class="information-type">
                            <li>
                                <span class="highlight-text">Send To: ${send.to}</span>
                                <p class="message-text">${send.textmessage}</p>
                                <ul class="pdf-container">
                                    <li class="pdf-box">
                                        <a href="${pdfUrl}" target="_blank" class="pdf-box-content"> ${send.filename}</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </section>
                `;
            });
        } catch (error) {
            console.error("Error loading sent messages:", error);
        }
    }

    console.log(data.user.username);
    send(data.user.username);
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

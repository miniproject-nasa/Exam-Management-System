document.addEventListener("DOMContentLoaded",  async function () {
    let data =[]
    async function checkAuthStatus() {
        try {
            const response = await fetch("/check-auth");
            data = await response.json();

            if (!data.isAuthenticated) {
                window.location.href = "/index.html"; 
            }
            else
            {
                return data;
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
        }
    }
    await checkAuthStatus();

    async function loadScrutiny(to) {
        try {
            const response = await fetch(`/get-verified/${to}`);
            if (!response.ok) return console.log("Failed to load scrutiny");
    
            const verifieded = await response.json();
            verifieded.reverse();
    
            const mainContainer = document.querySelector(".main-content");
    
            verifieded.forEach((verified) => {
                // Convert base64 to Blob URL
                const byteCharacters = atob(verified.sdata);
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
    
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
                </section>
                `;
            });
    
        } catch (error) {
            console.log(error);
        }
    }
    
    console.log(data.user.username);
    await loadScrutiny(data.user.username);    

});
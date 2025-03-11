document.addEventListener("DOMContentLoaded",async function() {
   
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

    async function send(from) {
        try {
            const responce=await fetch(`/get-pdfs-from/${from}`);
            if(!responce.ok)
                return console.log("failed to load inbox");

            const sends=await responce.json();

            const mainContainer=document.querySelector(".main-content")

            mainContainer.innerHTML=''
            console.log(sends)
            sends.reverse();
            sends.forEach((send)=>{
                // base64 to blob url
                const byteCharacters = atob(send.data.split(',')[1]); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                console.log("hai");
                
                mainContainer.innerHTML+=`
                <section class="content-section">
                <ul class="information-type">
                    <li>
                        <span class="highlight-text">Send To: ${send.to}</span>
                        <p class="message-text">${send.textmessage}</p>

                        <ul class="pdf-container">
                            <li class="pdf-box">
                                <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${send.filename}</a>
                            </li>
                        
                        </ul>
                    </li>
                </ul>            
                </section>
                `
                console.log("hai");
                
            })
        } catch (error) {
            
        }
    }
    console.log(data.user.username)
    send(data.user.username)
});
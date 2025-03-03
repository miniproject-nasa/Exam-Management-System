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

    async function send(allocate) {
        try {
            const responce=await fetch(`/scrutiny-inbox/${allocate}`);
            if(!responce.ok)
                return console.log("failed to load inbox");

            const scrutinys=await responce.json();

            const mainContainer=document.querySelector(".main-content")

            mainContainer.innerHTML=''
            console.log(scrutinys)
            scrutinys.forEach((send)=>{
                // base64 to blob url
                const byteCharacters = atob(send.data); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                console.log("hai");
                
                mainContainer.innerHTML+=`
                <section class="content-section"  data-section='${send._id}'>
                    <div class="allocated-container">
                       
                    </div>
                
                    <ul class="information-type">
                        <li><span class="highlight-text">subject:${send.subject}</span></li>
                        <li>mode:${send.mode}</li>
                    </ul>
                
                    <div class="pdf-container">
                        <div class="pdf-box">
                            <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${send.fileName}</a>
                        </div>
                        
                    </div>
                
                    <div class="bottom-right-container">
                        
                        <button class="send-button" >Allocate</button>
                    </div>
                </section> 
                `
            })
        } catch (error) {
            console.log(error);
            
        }
    }
    console.log(data.user.username)
    send(data.user.username)
});
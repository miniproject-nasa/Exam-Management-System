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

    async function inbox(to) {
        try {
            const responce=await fetch(`/get-pdfs/${to}`);
            if(!responce.ok)
                return console.log("failed to load inbox");

            const inboxs=await responce.json();

            const mainContainer=document.querySelector(".main-content")

            mainContainer.innerHTML=''
            console.log(inboxs)
            inboxs.forEach((inbox)=>{

                // base64 to blob url
                const byteCharacters = atob(inbox.data.split(',')[1]); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                mainContainer.innerHTML+=`
                <section class="content-section">
                <ul class="information-type">
                    <li>
                        <span class="highlight-text">${inbox.from}</span>
                        <p>${inbox.textmessage}</p>

                        <ul class="pdf-container">
                            <li class="pdf-box">
                                <div class="pdf-box-small">
                                    <p class="info-new-type">PDF</p>
                                </div>  
                            
                                <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${inbox.filename}</a>
                            
                            </li>
                        
                        </ul>
                    </li>
                </ul>            
                </section>
                `
            })
        } catch (error) {
            
        }
    }
    console.log(data.user.username)
    inbox(data.user.username)

});
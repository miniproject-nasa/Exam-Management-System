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
            const responce=await fetch(`/get-pdfs-to/${to}`);
            if(!responce.ok)
                return console.log("failed to load inbox");

            const inboxs=await responce.json();

            const mainContainer=document.querySelector(".main-content")

            mainContainer.innerHTML=''
            // console.log(inboxs)
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
                        <p class="message-text">${inbox.textmessage}</p>

                        <ul class="pdf-container">
                            <li class="pdf-box">
                                <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${inbox.filename}</a>
                            </li>
                        
                        </ul>
                    </li>
                </ul>            
                </section>
                `
            
            })
            const respon=await fetch(`/get-verified/${to}`);
            if(!respon.ok)
                return console.log("failed to load inbox");

            const verifieded=await respon.json();
            verifieded.reverse();

            // const mainContainer=document.querySelector(".main-content")

            // mainContainer.innerHTML=''
            // console.log(verifieded)
            verifieded.forEach((verified)=>{

                // base64 to blob url
                const byteCharacters = atob(verified.sdata); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                mainContainer.innerHTML+=`
                <section class="content-section">
                <p>SCRUTINY</p>
                <ul class="information-type">
                    <li>
                        <span class="highlight-text">${verified.mode}</span>
                        <p>MC:${verified.textmesg}</p>

                        <ul class="pdf-container">
                            <li class="pdf-box">
                                <div class="pdf-box-small">
                                    <p class="info-new-type">PDF</p>
                                </div>  
                            
                                <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${verified.sfileName}</a>
                            
                            </li>
                        
                        </ul>
                    </li>
                </ul>            
                </section>
                `
            
            })
            
        } catch (error) {
            console.log(error);
            
        }
    }
    console.log(data.user.username)
    await inbox(data.user.username)
    console.log(data.user.role)
    async function examcord(roles) {
        if(roles.includes("EC"))
        {
            console.log("hai");
            
            try {
                const responce= await fetch(`/final-qustion`);
                if(!responce.ok)
                    return console.log("error occured");

                const finals=await responce.json();
                
                const mainContainer=document.querySelector(".main-content")
                
                finals.forEach((final)=>{
                    const byteCharacters = atob(final.data); 
                    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                    const byteArray = new Uint8Array(byteNumbers);
                    const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    // console.log(final);
                    mainContainer.innerHTML+=`
                    <section class="content-section">
                    <ul class="information-type">
                        <li>
                            
                            <span class="highlight-text">${final.subject}</span>
                            <br>
                            <span class="highlight-text">${final.batch}</span>
                            <br>
                            <ul class="pdf-container">
                                <li class="pdf-box">
                                    <div class="pdf-box-small">
                                        <p class="info-new-type">PDF</p>
                                    </div>  
                                
                                    <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${final.fileName}</a>
                                
                                </li>
                            
                            </ul>
                        </li>
                    </ul>            
                    </section>
                    `
                
                })
                    
            } catch (error) {
                console.log(error);
                
            }
        }
            
    }
    await examcord(data.user.role)


});
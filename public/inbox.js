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
                console.log(inbox)
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
                            <p class="pdf-box-content"><iframe src="${inbox.data}" width="100%" height="300px"></iframe>
        <br>
        <a href="${inbox.data}" download="${inbox.filename}">Download ${inbox.filename}</a>
        <hr</p>
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
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
            const responce=await fetch(`/get-trial/${to}`);
            if(!responce.ok)
                return console.log("failed to load inbox");

            const inboxs=await responce.json();

            const mainContainer=document.querySelector(".main-content")

            mainContainer.innerHTML=''
            inboxs.reverse();
            // console.log(inboxs)
            inboxs.forEach((inbox)=>{
                if(inbox.mode=="trial")
                {
                    // console.log(inbox);
                
                // base64 to blob url
                const byteCharacters = atob(inbox.data); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                mainContainer.innerHTML+=`
                <section class="content-section"  data-section='${inbox._id}'>
                    <div class="allocated-container">
                       
                    </div>
                
                    <ul class="information-type">
                        <li><span class="highlight-text">${inbox.subject}</span></li>
                    </ul>
                
                    <div class="pdf-container">
                        <div class="pdf-box">
                            <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${inbox.fileName}</a>
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
                        <button class="send-button" >Allocate</button>
                    </div>
                </section> 
                `
                }
                else{
                    // console.log(inbox);
                
                // base64 to blob url
                const byteCharacters = atob(inbox.data); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                mainContainer.innerHTML+=`
                <section class="content-section"  data-section='${inbox._id}'>
            <div class="allocated-container">
                
            </div>
        
            <ul class="information-type">
                <li><span class="highlight-text">${inbox.subject}</span></li>
            </ul>
        
            <div class="pdf-container">
                <div class="pdf-box">
                    <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${inbox.fileName}</a>
                </div>
                
            </div>
        
            <div class="bottom-right-container">
                <div class="form-group">
                    <div class="dropdown">
                        <p id="faculty">${inbox.allocate}</p>
                    </select>
                    </div>
                </div>
            </div>
        </section> 
                `
                }
            })
        } catch (error) {
            console.log(error);
            
        }
    }
    console.log(data.user.username)
    await inbox(data.user.username)
    
    
    document.querySelectorAll(".send-button").forEach((btn) => {
        
        btn.addEventListener("click",function(e) {
                const sec=e.target.closest("section");
                const id=sec.dataset.section;
                console.log(id);
                console.log(e.target.parentElement.parentElement);
                const rtContainer=e.target.parentElement;
                const secContainer=rtContainer.parentElement;
                const selection=rtContainer.querySelector(".form-group").querySelector(".dropdown").querySelector("#faculties");    
                const faculty=rtContainer.querySelector(".form-group").querySelector(".dropdown").querySelector("#faculties").value
                if(!faculty)
                    return alert("please select a faculty");
                console.log("id: ",id);
                console.log("faculty:" ,faculty)

                try {
                    const responce=fetch(`/trial-update/${id}`,{
                        method:"PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({faculty})
                    })
                } catch (error) {
                    
                }
                alert("allocated to ",faculty);
                e.target.style.display="none";
                let Fpara=document.createElement("p");
                Fpara.innerText=faculty;
                Fpara.id="faculty"
                selection.replaceWith(Fpara);
                
        
        })
    })
    async function fetchFaculties() {
        try {
            // Fetch faculties
            const facultyResponse = await fetch('/api/notify/faculty');
            const faculties = await facultyResponse.json();
            populateDropdown('faculties', faculties.map(f => f.U_name));
            
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error loading data from server');
        }
    }
    function populateDropdown(id, items) {
        const counts=document.querySelectorAll("#faculties")
        console.log(counts.length)
        counts.forEach((select)=>{

            while (select.options.length > 1) {
                select.remove(1);
            }
            items.forEach(item => {
                const option = document.createElement('option');
                    option.text = item;
                    option.value = item;
                    select.add(option);
                });
        })
        }
        
        await fetchFaculties();
    });
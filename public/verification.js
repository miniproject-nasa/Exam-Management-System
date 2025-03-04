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
    
    console.log(data.user.username)
    async function inbox(to) {
        try {
            const responce=await fetch(`/get-trial/${to}`);
            if(!responce.ok)
                return console.log("failed to load inbox");

            const inboxs=await responce.json();

            const mainContainer=document.querySelector(".main-content")

            mainContainer.innerHTML=''
            console.log(inboxs)
            inboxs.forEach((inbox)=>{
                if(inbox.mode=="scrutinized")
                {
                    // console.log(inbox);
                
                // base64 to blob url
                const byteCharacters = atob(inbox.data); 
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);

                const SbyteCharacters = atob(inbox.sdata); 
                const SbyteNumbers = new Array(SbyteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const SbyteArray = new Uint8Array(SbyteNumbers);
                const SpdfBlob = new Blob([SbyteArray], { type: "application/pdf" });
                const SpdfUrl = URL.createObjectURL(SpdfBlob);
                mainContainer.innerHTML+=`
                <section class="content-section" data-session="${inbox._id}">
                    <ul class="information-type">
                        <li><span class="highlight-text">Exam Coordinator, ${inbox.date}</span></li>
                        <li>mode:${inbox.mode}</li>
                    </ul>
                
                    <div class="pdf-container">
                        <div class="pdf-box">
                            <a href="${pdfUrl}" target="_blank"  class="pdf-box-content"> ${inbox.fileName}</a>
                        </div>
                        <div class="pdf-box">
                            <a href="${SpdfUrl}" target="_blank"  class="pdf-box-content"> ${inbox.sfileName}</a>
                        </div>
                        
                    </div>
                
                    <div class="bottom-right-container">
                        <div class="form-group">
                            <input class="suggestions" type="text" id="message" name="message" placeholder="Suggestions">
                        </div>
                        <button class="send-button">Verify</button>
                    </div>
                </section>   
                `
                }
                
            })
        } catch (error) {
            console.log(error);
            
        }
    }
    await inbox(data.user.username)
    
    
    document.querySelectorAll(".send-button").forEach((btn) => {
        
        btn.addEventListener("click",function(e) {
                const sec=e.target.closest("section");
                const id=sec.dataset.session;
                console.log(id);
                console.log(e.target.parentElement.parentElement);
                const rtContainer=e.target.parentElement;
                const secContainer=rtContainer.parentElement;
                const textArea=secContainer.querySelector(".suggestions")
                const textmesg=secContainer.querySelector(".suggestions").value;
                if(!textmesg)
                    return alert("please type any suggestion");
                console.log("id: ",id);
                console.log("textmesg:" ,textmesg)

                try {
                    const responce=fetch(`/verify-update/${id}`,{
                        method:"PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({textmesg})
                    })
                } catch (error) {
                    
                }
                alert("verified successfully");
                e.target.style.display="none";
                let Fpara=document.createElement("p");
                Fpara.innerText=textmesg;
                Fpara.id="message"
                textArea.replaceWith(Fpara);
                
        
        })
    })
    // async function fetchFaculties() {
    //     try {
    //         // Fetch faculties
    //         const facultyResponse = await fetch('/api/notify/faculty');
    //         const faculties = await facultyResponse.json();
    //         populateDropdown('faculties', faculties.map(f => f.U_name));
            
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //         alert('Error loading data from server');
    //     }
    // }
    // function populateDropdown(id, items) {
    //     const counts=document.querySelectorAll("#faculties")
    //     console.log(counts.length)
    //     counts.forEach((select)=>{

    //         while (select.options.length > 1) {
    //             select.remove(1);
    //         }
    //         items.forEach(item => {
    //             const option = document.createElement('option');
    //                 option.text = item;
    //                 option.value = item;
    //                 select.add(option);
    //             });
    //     })
    //     }
        
    //     await fetchFaculties();
    });
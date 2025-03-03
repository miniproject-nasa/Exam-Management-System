// const { FieldAlreadyExistsError } = require("pdf-lib");

document.addEventListener("DOMContentLoaded", async function () {
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
    }
  }
  await checkAuthStatus();

  async function send(allocate) {
    try {
      const responce = await fetch(`/scrutiny-inbox/${allocate}`);
      if (!responce.ok) return console.log("failed to load inbox");

      const scrutinys = await responce.json();

      const mainContainer = document.querySelector(".main-content");

      mainContainer.innerHTML = "";
    //   console.log(scrutinys);
      scrutinys.forEach((send) => {
        // Convert base64 to blob URL for PDF file
        const byteCharacters = atob(send.data);
        const byteNumbers = new Array(byteCharacters.length)
          .fill()
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        if(send.mode=="allocated")
        {

            mainContainer.innerHTML += `
                    <section class="content-section" data-section='${send._id}'>
                        <div class="allocated-container"></div>
                    
                        <ul class="information-type">
                            <li><span class="highlight-text">subject: ${send.subject}</span></li>
                            <li>mode: ${send.mode}</li>
                        </ul>
                    
                        <div class="pdf-container">
                            <div class="pdf-box">
                                <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${send.fileName}</a>
                            </div>
                            <div class="pdf-box">
                                <label for="inputFile" class="information-type">Choose File</label>
                                <input type="file" name="scrutFile" id="scrutFile" class="information-type" hidden >   
                            </div>
                        </div>
                    
                        <div class="bottom-right-container">
                            <button class="send-button">Scrutiny</button>
                            <button class="submit-button">submit</button>
                        </div>
                        
                    </section> 
                    `;
        }
        else{
            const SbyteCharacters = atob(send.sdata);
        const SbyteNumbers = new Array(SbyteCharacters.length)
          .fill()
          .map((_, i) => SbyteCharacters.charCodeAt(i));
        const SbyteArray = new Uint8Array(SbyteNumbers);
        const SpdfBlob = new Blob([SbyteArray], { type: "application/pdf" });
        const SpdfUrl = URL.createObjectURL(SpdfBlob);
            mainContainer.innerHTML += `
                    <section class="content-section" data-section='${send._id}'>
                        <div class="allocated-container"></div>
                    
                        <ul class="information-type">
                            <li><span class="highlight-text">subject: ${send.subject}</span></li>
                            <li>mode: ${send.mode}</li>
                        </ul>
                    
                        <div class="pdf-container">
                            <div class="pdf-box">
                                <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${send.fileName}</a>
                            </div>
                            <div class="pdf-box">
                                <a href="${SpdfUrl}" target="_blank" class="pdf-box-content">${send.sfileName}</a>   
                            </div>
                        </div>
                    
                        <div class="bottom-right-container">
                            
                        </div>
                        
                    </section> 
                    `;
        }

      });
    } catch (error) {
      console.log(error);
    }
  }

  console.log(data.user.username);
  await send(data.user.username);

  const inputFiles=document.querySelectorAll("#inputFile")
  inputFiles.forEach((inputFile)=>{

      inputFile.addEventListener("change",function(){
            const file=this.files[0];
    
            if(file){
                const fileURL = URL.createObjectURL(file);
                pdfcotainer.innerHTML=`<div class="pdf-box">
                            
                            <p class="pdf-box-content"><a href="${fileURL}"  target="_blank">${file.name} (${(file.size / 1024).toFixed(2)})KB</a></p>`;
                        
            }
            else{
                inputFile.innerHTML=`<p class="pdf-box-content">No file chosen</p>`;
            }
        });
  })

  document.querySelectorAll(".submit-button").forEach((btn)=>{
        btn.addEventListener("click",async function(e){
            
            const par=e.target.parentElement.parentElement
            const file=par.querySelector("#scrutFile").files[0]
            if(!file)
                return alert("select a file")
            else{

                const id=par.dataset.section
                const formdata=new FormData();
                formdata.append("scrutFile",file);
                try{
                    const response=await fetch(`/trial-scrutinized/${id}`,
                        {
                            method:"PUT",
                            body:formdata,
                            
                            
                        }
                    );
                    if(!response.ok)
                        return console.log("failed");
                    
                }
                catch (error) {
                    console.log(error);
                    
                }
            }
            
            alert("sended successfully");
            location.reload(true)
        })
  })
  document.querySelectorAll(".send-button").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default action if necessary
      document.getElementById("scrutiny-popup").classList.add("show"); // Show the popup
    });
  });

  // Close popup when clicking the close button
  document.querySelector(".close").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("scrutiny-popup").classList.remove("show"); // Hide the popup
  });

  const form = document.querySelector("#scrutiny-popup form");

  if (form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault(); // Prevent default form submission
      
      // Collect form data as question/answer pairs
      const qaPairs = [];
      form.querySelectorAll("label").forEach(label => {
        const fieldId = label.getAttribute("for");
        const input = form.querySelector(`#${fieldId}`);
        if (input) {
          const question = label.innerText.trim();
          const answer = input.value.trim();
          qaPairs.push({ question, answer });
        }
      });
      
      // Initialize jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Set a line height factor close to 1 (or < 1 to reduce further)
      doc.setLineHeightFactor(1); 
      
      // Font settings for body text
      doc.setFontSize(12);
      
      // Positioning variables
      let x = 10;
      let y = 20;
      
      // This controls the vertical jump after each line
      // Lower this value for tighter spacing
      const lineHeight = 5; 
      
      // Title - Increase heading size
      doc.setFont(undefined, 'bold');
      doc.setFontSize(18);  // Increased heading size
      doc.text("Scrutiny Form Responses", x, y);
      y += lineHeight * 2; // extra space after title
      
      // Reset font size for the rest of the content
      doc.setFontSize(12);
      
      // Loop over each question/answer pair
      qaPairs.forEach(pair => {
        // Question in bold
        doc.setFont(undefined, 'bold');
        doc.text(pair.question + ":", x, y);
        y += lineHeight * 1.2; // move down for the answer
        
        // Answer in normal font
        doc.setFont(undefined, 'normal');
        // Split text to wrap within 180 width
        const lines = doc.splitTextToSize(pair.answer || "N/A", 180);
        
        // Print each wrapped line manually
        lines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight; 
        });
        
        // Small extra gap before the next Q/A pair
        y += lineHeight;
        
        // Add a new page if needed
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      
      // Save the PDF
      doc.save("scrutiny_form.pdf");
    });
  }
});
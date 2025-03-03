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
      console.log(scrutinys);
      scrutinys.forEach((send) => {
        // Convert base64 to blob URL for PDF file
        const byteCharacters = atob(send.data);
        const byteNumbers = new Array(byteCharacters.length)
          .fill()
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);

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
                    </div>
                
                    <div class="bottom-right-container">
                        <button class="send-button">Scrutiny</button>
                    </div>
                </section> 
                `;
      });
    } catch (error) {
      console.log(error);
    }
  }

  console.log(data.user.username);
  await send(data.user.username);

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
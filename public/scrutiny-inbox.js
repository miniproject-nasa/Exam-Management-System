// const { FieldAlreadyExistsError } = require("pdf-lib");

document.addEventListener("DOMContentLoaded", async function () {
  // Check authentication and store response in global variable "data"
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

  // Fetch and display the scrutiny inbox data.
  async function send(allocate) {
    try {
      const responce = await fetch(`/scrutiny-inbox/${allocate}`);
      if (!responce.ok) return console.log("failed to load inbox");

      const scrutinys = await responce.json();
      const mainContainer = document.querySelector(".main-content");
      mainContainer.innerHTML = "";
      scrutinys.reverse();

      scrutinys.forEach((send) => {
        // Convert trial PDF data (base64) to a Blob URL.
        const byteCharacters = atob(send.data);
        const byteNumbers = new Array(byteCharacters.length)
          .fill()
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // If mode is "allocated", include data attributes for paper and faculty.
        if (send.mode === "allocated") {
          mainContainer.innerHTML += `
                    <section class="content-section" data-section="${send._id}" data-paper-name="${send.subject}" data-faculty-name="${send.allocate}">
                        <div class="allocated-container"></div>
                    
                        <ul class="information-type">
                            <li><span class="highlight-text">${send.subject}</span></li>
                        </ul>
                    
                        <div class="pdf-container">
                            <div class="pdf-box">
                                <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${send.fileName}</a>
                            </div>
                            <div class="file-box">
                                <label for="inputFile" class="file-label">Choose File</label>
                                <input type="file" name="inputFile" id="inputFile" class="information-type" hidden required>   
                            </div>
                        </div>
                    
                        <div class="bottom-right-container">
                            <button class="send-button">Scrutiny</button>
                            <button class="submit-button">submit</button>
                        </div>
                    </section> 
                    `;
        } else {
          // For non-allocated papers (e.g., already scrutinized/verified), show both original and scrutinized PDFs.
          const SbyteCharacters = atob(send.sdata);
          const SbyteNumbers = new Array(SbyteCharacters.length)
            .fill()
            .map((_, i) => SbyteCharacters.charCodeAt(i));
          const SbyteArray = new Uint8Array(SbyteNumbers);
          const SpdfBlob = new Blob([SbyteArray], { type: "application/pdf" });
          const SpdfUrl = URL.createObjectURL(SpdfBlob);
          mainContainer.innerHTML += `
                    <section class="content-section" data-section="${send._id}">
                        <div class="allocated-container"></div>
                    
                        <ul class="information-type">
                            <li><span class="highlight-text">${send.subject}</span></li>
                        </ul>
                    
                        <div class="pdf-container">
                            <div class="pdf-box">
                                <a href="${pdfUrl}" target="_blank" class="pdf-box-content">${send.fileName}</a>
                            </div>
                            <div class="pdf-box">
                                <a href="${SpdfUrl}" target="_blank" class="pdf-box-content">${send.sfileName}</a>   
                            </div>
                        </div>
                    
                        <div class="bottom-right-container"></div>
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

  // Handle file input change (if a file is selected for scrutiny upload)
  const inputFiles = document.querySelectorAll("#inputFile");
  inputFiles.forEach((inputFile) => {
    inputFile.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const fileURL = URL.createObjectURL(file);
        pdfcotainer.innerHTML = `<div class="pdf-box">
                            <p class="pdf-box-content"><a href="${fileURL}" target="_blank">${
          file.name
        } (${(file.size / 1024).toFixed(2)})KB</a></p>`;
      }
    });
  });

  // Handle submission of the trial scrutinized file.
  document.querySelectorAll(".submit-button").forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      const par = e.target.closest("section");
      const file = par.querySelector("#inputFile").files[0];
      if (!file) return alert("select a file");
      const id = par.dataset.section;
      const formdata = new FormData();
      formdata.append("inputFile", file);
      try {
        const response = await fetch(`/trial-scrutinized/${id}`, {
          method: "PUT",
          body: formdata,
        });
        if (!response.ok) return console.log("failed");
      } catch (error) {
        console.log(error);
      }
      alert("sended successfully");
      location.reload(true);
    });
  });

  // When "Scrutiny" button is clicked, open the scrutiny popup and populate hidden fields.
  document.querySelectorAll(".send-button").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const section = e.target.closest("section");
      // Retrieve paper name (subject) and allocated faculty name from data attributes.
      const paperName = section.dataset.paperName || "Unknown Paper";
      const facultyName = section.dataset.facultyName || "Unknown Faculty";
      // Populate hidden inputs in the popup.
      const popup = document.getElementById("scrutiny-popup");
      const paperNameInput = popup.querySelector("#paperName");
      const facultyNameInput = popup.querySelector("#facultyName");
      if (paperNameInput) paperNameInput.value = paperName;
      if (facultyNameInput) facultyNameInput.value = facultyName;
      // Show the popup.
      popup.classList.add("show");
    });
  });

  // Close the scrutiny popup.
  document.querySelector(".close").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("scrutiny-popup").classList.remove("show");
  });

  // PDF Generation from the scrutiny form.
  const formPopup = document.querySelector("#scrutiny-popup form");
  if (formPopup) {
    formPopup.addEventListener("submit", function (event) {
      event.preventDefault();

      // Collect all question-answer pairs.
      const qaPairs = [];
      formPopup.querySelectorAll("label").forEach((label) => {
        const fieldId = label.getAttribute("for");
        const input = formPopup.querySelector(`#${fieldId}`);
        if (input) {
          const question = label.innerText.trim();
          const answer = input.value.trim();
          qaPairs.push({ question, answer });
        }
      });

      // Retrieve question paper name and faculty name from hidden inputs.
      const paperNameInput = document.querySelector("#paperName");
      const paperName = paperNameInput ? paperNameInput.value : "Unknown Paper";
      const facultyNameInput = document.querySelector("#facultyName");
      const facultyName = facultyNameInput
        ? facultyNameInput.value
        : "Unknown Faculty";

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setLineHeightFactor(1);
      doc.setFontSize(12);
      let x = 10;
      let y = 20;
      const lineHeight = 5;

      // Get page width
      const pageWidth = doc.internal.pageSize.getWidth();

      // Set font and size
      doc.setFont(undefined, "bold");
      doc.setFontSize(18);

      // Calculate the x position for centering
      const text = "Scrutiny Form Response";
      const textWidth = doc.getTextWidth(text);
      const xCentered = (pageWidth - textWidth) / 2;

      // Draw the text at the centered position
      doc.text(text, xCentered, y);
      y += lineHeight * 2;

      doc.setFontSize(12);
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB");
      doc.text(`Date: ${formattedDate}`, x, y);
      y += lineHeight * 1.5;

      // Display paper details and faculty name.
      doc.setFontSize(12);
      doc.text(`Question Paper: ${paperName}`, x, y);
      y += lineHeight * 1.2;
      doc.text(`Scrutinised by: ${facultyName}`, x, y);
      y += lineHeight * 1.2;
      y += lineHeight; // Extra space.

      // Write each question-answer pair.
      doc.setFontSize(12);
      qaPairs.forEach((pair) => {
        doc.setFont(undefined, "bold");
        doc.text(pair.question + ":", x, y);
        y += lineHeight * 1.2;
        doc.setFont(undefined, "normal");
        const lines = doc.splitTextToSize(pair.answer || "N/A", 180);
        lines.forEach((line) => {
          doc.text(line, x, y);
          y += lineHeight;
        });
        y += lineHeight;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      // Save the PDF with the name "scrutiny - [question paper name].pdf"
      const fileName = `scrutiny-${paperName}.pdf`;
      doc.save(fileName);

      // Close the popup.
      document.getElementById("scrutiny-popup").classList.remove("show");
    });
  }
});

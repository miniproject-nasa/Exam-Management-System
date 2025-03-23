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
      showPopup("Error checking authentication status", "error");
    }
  }
  await checkAuthStatus();

  async function send(allocate) {
    try {
      const response = await fetch(`/scrutiny-inbox/${allocate}`);
      if (!response.ok) {
        showPopup("Failed to load inbox", "error");
        return;
      }

      const scrutinys = await response.json();
      const mainContainer = document.querySelector(".main-content");
      mainContainer.innerHTML = "";
      scrutinys.reverse();

      scrutinys.forEach((send) => {
        const pdfUrl = getPdfUrl(send.data);
        if (send.mode === "allocated") {
          mainContainer.innerHTML += `
            <section class="content-section" data-section="${send._id}" data-paper-name="${send.subject}" data-faculty-name="${send.allocate}">
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
                <div class="right-container">
                    <button class="send-button">Scrutiny</button>
                    <button class="submit-button">Submit</button>
                </div>
            </section>`;
        } else {
          const SpdfUrl = getPdfUrl(send.sdata);
          mainContainer.innerHTML += `
            <section class="content-section" data-section="${send._id}">
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
            </section>`;
        }
      });
      
      // Fix for duplicate IDs by making each file input ID unique
      document.querySelectorAll('.content-section').forEach((section, index) => {
        const fileInput = section.querySelector('#inputFile');
        if (fileInput) {
          const newId = `inputFile-${index}`;
          fileInput.id = newId;
          
          const fileLabel = section.querySelector('.file-label');
          if (fileLabel) {
            fileLabel.setAttribute('for', newId);
          }
        }
      });
      
    } catch (error) {
      console.log(error);
      showPopup("Error loading inbox", "error");
    }
  }

  console.log(data.user.username);
  await send(data.user.username);

  document.querySelectorAll(".submit-button").forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      const section = e.target.closest("section");
      const file = section.querySelector("input[type='file']").files[0];
      if (!file) {
        showPopup("Please select a file", "error");
        return;
      }

      const id = section.dataset.section;
      const formdata = new FormData();
      formdata.append("inputFile", file);

      try {
        const response = await fetch(`/trial-scrutinized/${id}`, {
          method: "PUT",
          body: formdata,
        });
        if (!response.ok) {
          showPopup("Failed to send scrutiny file", "error");
          return;
        }
      } catch (error) {
        console.log(error);
        showPopup("Error submitting scrutiny", "error");
        return;
      }

      showPopup("Scrutiny file sent successfully!", "success");
      setTimeout(() => location.reload(true), 1000);
    });
  });

  document.querySelectorAll(".send-button").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const section = e.target.closest("section");
      const paperName = section.dataset.paperName || "Unknown Paper";
      const facultyName = section.dataset.facultyName || "Unknown Faculty";
      
      // Store the section ID to use later for file input selection
      const sectionId = section.dataset.section;

      const popup = document.getElementById("scrutiny-popup");
      popup.querySelector("#paperName").value = paperName;
      popup.querySelector("#facultyName").value = facultyName;
      
      // Store the section ID in a data attribute on the form
      popup.querySelector("form").dataset.sectionId = sectionId;

      popup.classList.add("show");
    });
  });

  document.querySelector(".close").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("scrutiny-popup").classList.remove("show");
  });

  document.querySelector("#scrutiny-popup form").addEventListener("submit", function (event) {
    event.preventDefault();
    const sectionId = this.dataset.sectionId;
    generateScrutinyPdf(sectionId);
    document.getElementById("scrutiny-popup").classList.remove("show");
  });
});

function getPdfUrl(base64Data) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length)
    .fill()
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
  return URL.createObjectURL(pdfBlob);
}

function generateScrutinyPdf(sectionId) {
  const formPopup = document.querySelector("#scrutiny-popup form");
  const qaPairs = [];
  formPopup.querySelectorAll("label").forEach((label) => {
    const fieldId = label.getAttribute("for");
    const input = formPopup.querySelector(`#${fieldId}`);
    if (input) {
      qaPairs.push({ question: label.innerText.trim(), answer: input.value.trim() });
    }
  });

  const paperName = document.querySelector("#paperName").value || "Unknown Paper";
  const facultyName = document.querySelector("#facultyName").value || "Unknown Faculty";

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  const text = "Scrutiny Form Response";
  const textWidth = doc.getTextWidth(text);
  const xCentered = (doc.internal.pageSize.getWidth() - textWidth) / 2;
  doc.text(text, xCentered, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 10, 30);
  doc.text(`Question Paper: ${paperName}`, 10, 40);
  doc.text(`Scrutinised by: ${facultyName}`, 10, 50);

  let y = 60;
  qaPairs.forEach((pair) => {
    doc.setFont(undefined, "bold");
    doc.text(pair.question + ":", 10, y);
    y += 6;
    doc.setFont(undefined, "normal");
    const lines = doc.splitTextToSize(pair.answer || "N/A", 180);
    lines.forEach((line) => {
      doc.text(line, 10, y);
      y += 6;
    });
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Instead of saving directly, create a blob
  const pdfBlob = doc.output('blob');
  
  // Create a File object from the Blob (browsers only accept File objects for file inputs)
  const pdfFile = new File([pdfBlob], `scrutiny-${paperName}.pdf`, { type: 'application/pdf' });
  
  // Find the section that triggered this form
  const section = sectionId 
    ? document.querySelector(`.content-section[data-section="${sectionId}"]`)
    : document.querySelector('.content-section[data-paper-name="' + paperName + '"]');
    
  if (section) {
    // Get the file input from this section
    const fileInput = section.querySelector('input[type="file"]');
    
    // Create a new DataTransfer object
    const dataTransfer = new DataTransfer();
    
    // Add our file to it
    dataTransfer.items.add(pdfFile);
    
    // Set the file input's files property to our DataTransfer files list
    fileInput.files = dataTransfer.files;
    
    // Trigger change event to update any UI that might depend on file selection
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
    
    // Update the file label to show the selected file name
    const fileLabel = section.querySelector('.file-label');
    if (fileLabel) {
      fileLabel.textContent = pdfFile.name;
      fileLabel.classList.add('file-selected');
    }
    
    // Add visual feedback
    section.querySelector('.file-box').classList.add('highlight-selected');
    setTimeout(() => {
      section.querySelector('.file-box').classList.remove('highlight-selected');
    }, 2000);
    
    // Show success message
    showPopup("Scrutiny form completed. File automatically selected.", "success");
    
    // Optional: Auto-scroll to the submit button
    section.querySelector('.submit-button').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    // Fallback to download if we can't find the right section
    doc.save(`scrutiny-${paperName}.pdf`);
    showPopup("Scrutiny form completed. Please select the downloaded file.", "info");
  }
}

function showPopup(message, type = "info", callback = null) {
  const alertPopup = document.createElement("div");
  alertPopup.classList.add("alert-popup", "active");

  let bgColor = "#0f62fe"; // Default blue
  if (type === "success") bgColor = "green";
  if (type === "warning") bgColor = "orange";
  if (type === "error") bgColor = "red";

  alertPopup.innerHTML = `
      <div class="alert-popup-content" style="border-left: 5px solid ${bgColor};">
          <span class="alert-close">&times;</span>
          <p>${message}</p>
          <button class="alert-close-btn">OK</button>
      </div>
  `;

  document.body.appendChild(alertPopup);
  alertPopup.querySelector(".alert-close-btn").addEventListener("click", () => {
      alertPopup.classList.remove("active");
      setTimeout(() => {
          alertPopup.remove();
          if (callback) callback();
      }, 300);
  });
  alertPopup.querySelector(".alert-close").addEventListener("click", () => {
      alertPopup.classList.remove("active");
      setTimeout(() => alertPopup.remove(), 300);
  });
}

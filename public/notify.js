document.addEventListener("DOMContentLoaded", async function () {

    const inputFile=document.getElementById("inputFile");
    const pdfcotainer=document.querySelector(".pdf-container");
    pdfcotainer.innerHTML=``;
    inputFile.addEventListener("change",function(){
        const file=this.files[0];

        if(file){
            const fileURL = URL.createObjectURL(file);
            pdfcotainer.innerHTML=`<div class="pdf-box">
                        <div class="pdf-box-small">
                            <p class="info-new-type">PDF</p>
                        </div>
                        <p class="pdf-box-content"><a href="${fileURL}"  target="_blank">${file.name} (${(file.size / 1024).toFixed(2)}</a>KB</p>`;
                    
        }
        else{
            inputFile.innerHTML=`<p class="pdf-box-content">No file chosen</p>`;
        }
    });



});
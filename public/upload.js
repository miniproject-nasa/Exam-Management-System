document.addEventListener("DOMContentLoaded",async function (){

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
    async function subjectDropdown(){

        try {
            const response=await fetch("/get-subjects")
            const subjects=await response.json()
            const subSection=document.querySelector("#subject")
            subjects.forEach(subject => {
                subSection.innerHTML+=`
                    <option value="${subject.S_code} - ${subject.S_name}" >${subject.S_code} - ${subject.S_name}</option>
                `            
            });

        } catch (error) {
            console.log(error);
            
        }
    }
    await subjectDropdown()

    async function batchDropdown() {
        try {
            const response=await fetch("/get-batches")
            const batches=await response.json();
            const batchSection=document.querySelector("#batch")

            batches.forEach(batch=>{
                batchSection.innerHTML+=`
                    <option value="${batch.B_name}">${batch.B_name}</option>
                `
            })
            
        } catch (error) {
            console.log(error)
        }
    }
    await batchDropdown();
    const inputFile=document.getElementById("inputFile");
    const pdfcotainer=document.querySelector(".pdf-container");

    // show pdf in frontent
    pdfcotainer.innerHTML=``;
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

    document.querySelector("#upload").addEventListener("submit",async function (e) {
        e.preventDefault();
        const mode=document.querySelector("#mode").value;
        const subject=document.querySelector("#subject").value;
        const batch=document.querySelector("#batch").value;
        const file=document.querySelector("#inputFile").files[0];
        if(!file){
            alert("select a file")
            return;
        }
        const formdata=new FormData();
        formdata.append("pdfFile",file);
        formdata.append("mode",mode);
        formdata.append("subject",subject);
        formdata.append("batch",batch);

        try {
            const response=fetch("/upload-trial",
                {
                    method:"POST",
                    body:formdata,
                }
            )
        } catch (error) {
            console.log(error)
        }
        alert("send successfully");
        location.reload(true)
        

    })

});
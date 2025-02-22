// const { file } = require("pdfkit");

document.addEventListener("DOMContentLoaded",  async function () {
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
    
    // console.log(data);

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

    // JUST FOR TESTING
    const reciever=document.querySelector("#reciever");   
    reciever.addEventListener("change",function(){
        const reciverValue=this.value;
        console.log(reciverValue);  
    });

    //  sending notification by submitting form

    const notifyForm=document.querySelector("#notifyForm");
    
     notifyForm.addEventListener("submit",async function(e){
        e.preventDefault();
        const to=document.querySelector("#reciever").value;
        const textmessage=document.querySelector("#textmessage").value;
        
        // storing file in formdata for sending to server

        const file=document.querySelector("#inputFile").files[0];
        if(!file){
            alert("Please select a file");
            return;
        }
        const formData= new FormData();
        formData.append('pdfFile',file);
        formData.append('to',to);
        formData.append('textmessage',textmessage);
        formData.append('from',data.user.username);
        console.log(formData)
        try{
            const response=await fetch("/upload",
                {
                    method:"POST",
                    body:formData,
                    
                    
                }
            );
            
        }
        catch(error){
            console.log(error);
        }

    });


});
        
        


        
   
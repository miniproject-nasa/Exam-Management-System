// const { file } = require("pdfkit");

document.addEventListener("DOMContentLoaded",  async function () {
    fetchFaculties();
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
    const reciever=document.querySelector("#faculties");   
    reciever.addEventListener("change",function(){
        const reciverValue=this.value;
        console.log(reciverValue);  
    });

    //  sending notification by submitting form

    const notifyForm=document.querySelector("#notifyForm");
    
     notifyForm.addEventListener("submit",async function(e){
        e.preventDefault();
        console.log(reciever.value)
        const to=document.querySelector("#faculties").value;
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
            alert("send successfully");
            notifyForm.reset();
            inputFile.value = null;
            
        }
        catch(error){
            console.log(error);
        }

    });


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
        const select = document.getElementById(id);
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        items.forEach(item => {
            const option = document.createElement('option');
            option.text = item;
            option.value = item;
            select.add(option);
        });
    }
});
        

// function addToDisplayBox(selectId, boxId) {
//     const select = document.getElementById(selectId);
//     const box = document.getElementById(boxId);
//     const selectedOption = select.options[select.selectedIndex];
    
//     if (selectedOption && selectedOption.value) {
//         if (!box.textContent.includes(selectedOption.value)) {
//             const item = document.createElement('span');
//             item.textContent = selectedOption.value + ' ';
//             item.style.marginRight = '10px';
            
//             const deleteBtn = document.createElement('span');
//             deleteBtn.textContent = '×';
//             deleteBtn.style.cursor = 'pointer';
//             deleteBtn.style.color = 'red';
//             deleteBtn.style.marginLeft = '2px';
//             deleteBtn.onclick = () => item.remove();
            
//             item.appendChild(deleteBtn);
//             box.appendChild(item);
//         }
//     }
// }

// async function handleFormSubmit(event) {
//     event.preventDefault();
    
//     const facultyBox = document.getElementById('faculty-box');
    
//     const selectedFaculties = Array.from(facultyBox.children)
//         .map(span => span.textContent.trim().replace('×', '').trim())
//         .filter(Boolean);
    
//     if (selectedFaculties.length === 0) {
//         alert('Please select at least one faculty');
//         return;
//     }        
// }

        
   
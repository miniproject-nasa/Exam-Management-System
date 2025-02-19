let data={};

document.addEventListener("DOMContentLoaded",async function () {

    const mainContainer=document.querySelector(".main-container")
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
    
    console.log(data);
    
    function displayItems(data) {
        if(data.isAuthenticated){
            const role=data.user.role;

            if(role==='HOD'){
                mainContainer.querySelector('.user').style.display='flex';
                mainContainer.querySelector('.module').style.display='flex';
 
            }
            else if(role==='FC'){
                mainContainer.querySelector('.upload').style.display='flex';
                mainContainer.querySelector('.inbox').style.display='flex';

            }
            else if(role==='MC'){
                mainContainer.querySelector('.scutiny').style.display='flex';
                mainContainer.querySelector('.inbox').style.display='flex';
                mainContainer.querySelector('.upload').style.display='flex';

            }
            else if(role==='EC'){
                mainContainer.querySelector('.notify').style.display='flex';
                mainContainer.querySelector('.seating').style.display='flex';
                mainContainer.querySelector('.duty').style.display='flex';
                mainContainer.querySelector('.subject').style.display='flex';
                mainContainer.querySelector('.batch').style.display='flex';
                mainContainer.querySelector('.room').style.display='flex';
                mainContainer.querySelector('.inbox').style.display='flex';
                
            }
            else if(role==='AEC'){
                mainContainer.querySelector('.notify').style.display='flex';
                mainContainer.querySelector('.seating').style.display='flex';
                mainContainer.querySelector('.duty').style.display='flex';
                mainContainer.querySelector('.subject').style.display='flex';
                mainContainer.querySelector('.batch').style.display='flex';
                mainContainer.querySelector('.room').style.display='flex';
                mainContainer.querySelector('.inbox').style.display='flex';
            }
        }
        
    }
    await displayItems(data);


    const items=document.querySelectorAll('.item');
    await items.forEach(item=>{
        item.addEventListener('click',()=>{
            if(item.classList.contains('user')){
                window.location.href = "/user.html";
            }
            else if(item.classList.contains('module')){
                window.location.href = "/module.html";
            }
            else if(item.classList.contains('upload')){
                window.location.href = "/upload.html";
            }
            else if(item.classList.contains('inbox')){
                window.location.href = "/inbox.html";
            }
            else if(item.classList.contains('scutiny')){
                window.location.href = "/scutiny.html";
            }
            else if(item.classList.contains('notify')){
                window.location.href = "/notify.html";
            }
            else if(item.classList.contains('seating')){
                window.location.href = "/seating.html";
            }
            else if(item.classList.contains('duty')){
                window.location.href = "/duty.html";
            }
            else if(item.classList.contains('subject')){
                window.location.href = "/subject.html";
            }
            else if(item.classList.contains('batch')){
                window.location.href = "/batch.html";
            }
            else if(item.classList.contains('room')){
                window.location.href = "/room.html";
            }

            // window.location.href = `/${item.id}.html`;
        })
    })
    
    // function itemclick(e){
        //     console.log(e.target.classList);
        // if(e.target.classList.contains('item')){
            //     console.log('item clicked'); 
            // }
            // }
            // mainContainer.addEventListener('click',itemclick);
            
            
            const logout=document.querySelector('.logout')
            console.log(logout);
            
            logout.addEventListener("click",async function (e) {
                try
                {
                    const response = await fetch("/logout", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    }); 
                    const reslt=await response.json();
                    if(reslt.success)
                        window.location.href = "/index.html";
                        
                }
                catch(error){
                        console.log(error)
                }
                    
            })
            
});

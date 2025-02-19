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
    

});

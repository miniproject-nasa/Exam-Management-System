
        // const container = document.querySelector('.input-container')
        
        // let contentTxt=''
        // let mask=true
        // function maskinput(e){
        //     let input =e.target
        //     let typechr=input.value[input.value.length-1]
        //     if(e.inputType==='deleteContentBackward'){
        //         contentTxt=contentTxt.slice(0,-1)
        //     }
        //     else{
        //         contentTxt+=typechr
        //     }
        //     if(mask){
        //         input.value='•'.repeat(contentTxt.length)
        //     }
        //     else{
        //         input.value=contentTxt
        //     }
        //     console.log(contentTxt)
        // }
        
        //     function showHide(e){
        //         if(e.target.id === 'hide'){
        //             // console.log('clicked')
        //             e.target.src = 'eye-open.webp'
        //             e.target.id = 'show'
        //             let input=document.getElementById("password")
        //             input.value =contentTxt
    
        //         }
        //     else if(e.target.id === 'show'){
        //         // console.log('clicked')
        //         e.target.src = 'eye-close.webp'
        //         e.target.id = 'hide'
                
        //         let input = document.getElementById("password");
        //         input.value = "•".repeat(input.value.length);
        //     }
            
            
        // }


        document.addEventListener("DOMContentLoaded", async function () {
            const loginForm = document.getElementById("loginForm");
            
            async function checkAuthStatus() {
                try {
                    const response = await fetch("/check-auth");
                    const data = await response.json();
        
                    if (data.isAuthenticated) {
                        window.location.href = "/home.html"; 
                    }
                } catch (error) {
                    console.error("Error checking auth status:", error);
                }
            }
        
            await checkAuthStatus();
            const showHide = document.querySelector(".input-icon");
            const password = document.getElementById("password");
            const userID = document.getElementById("userID");
            const invalidCredentials = document.getElementById("invalid-credentials");
            password.addEventListener("click", function (e) {
                invalidCredentials.innerHTML = "";
                
            });
            userID.addEventListener("click", function (e) {
                invalidCredentials.innerHTML = "";
                
            });
              
            showHide.addEventListener("click", function (e) {
                let input = document.getElementById("password");
                if (input.type === "password") {
                    input.type = "text";
                    showHide.src = "/images/eye-open.webp";
                } else {
                    input.type = "password";
                    showHide.src = "/images/eye-close.webp";
                    
                }
            });
            
            loginForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                console.log("Form submitted");
        
                const userID = document.getElementById("userID").value;
                const password = document.getElementById("password").value;
        
                if (!userID || !password) {
                    document.getElementById("invalid-credentials").innerHTML = `<p id="invalid-msg">Enter both username and password</p>`;
                    return;
                }
        
                try {
                    const response = await fetch("/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userID, password })
                    });
        
                    const data = await response.json();
        
                    if (data.success) {
                        window.location.href = data.redirect;
                    } else {
                        document.getElementById("invalid-credentials").innerHTML = `<p id="invalid-msg">${data.error}</p>`;
                    }
                } catch (error) {
                    console.error("Error logging in:", error);
                    document.getElementById("invalid-credentials").innerHTML = `<p id="invalid-msg">An error occurred. Please try again later</p>`;
                }
            });
        });
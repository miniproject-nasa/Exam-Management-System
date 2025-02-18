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


        document.addEventListener("DOMContentLoaded", function () {
            document.querySelector("form").addEventListener("submit", async function (event) {
                event.preventDefault();
                console.log("Form submitted");
                
        
                const username = document.getElementById("username").value;
                const password = document.getElementById("password").value;
                console.log(username, password);
        
                if (!username || !password) {
                    console.log("Please enter both username and password.");
                    document.getElementById("invalid-credentials").innerHTML = <p id="invalid-msg">enter both username and password</p>;
                    // alert("Please enter both username and password.");
                    return;
                }
        
                try {
                    const response = await fetch("/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ username, password })
                    });
        
                    const data = await response.json();
        
                    if (data.success) {
                        window.location.href = data.redirect;
                    } else {
                        // alert(data.error);
                        document.getElementById("invalid-credentials").innerHTML = <p id="invalid-msg">${data.error}</p>;
                    }
                } catch (error) {
                    console.error("Error logging in:", error);
                    document.getElementById("invalid-credentials").innerHTML = <p id="invalid-msg">An error occurred. Please try again later</p>;
                    // alert("An error occurred. Please try again later.");
                }
            });
        });
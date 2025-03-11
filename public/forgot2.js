document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    
    if (!email) {
      alert("Invalid access. Please go back and enter your email.");
      window.location.href = "forgotpass.html";
      return;
    }
    
    // Optionally, display a masked version of the email
    const emailParts = email.split("@");
    const username = emailParts[0];
    const maskedUsername = username.substring(0, 2) + "***" + username.substring(username.length - 2);
    const domain = emailParts[1];
    
    const otpText = document.querySelector(".otp-gone");
    if (otpText) {
      otpText.innerHTML = `An OTP has been sent to<br>${maskedUsername}@${domain}`;
    }
    
    const form = document.querySelector("form");
    
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      
      const otp = document.getElementById("otp").value.trim();
      const newPassword = document.getElementById("new-password").value.trim();
      
      if (!otp || !newPassword) {
        alert("Please fill in all fields.");
        return;
      }
      
      // Password validation: minimum 8 characters
      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }
      
      // Set loading state
      const button = form.querySelector("button");
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Processing...";
      
      try {
        // Call the backend endpoint to reset the password
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, otp, newPassword }),
          credentials: "include"
        });
        
        const result = await response.json();
        console.log("Server response:", result);
        
        button.disabled = false;
        button.textContent = originalText;
        
        if (response.ok) {
          alert(result.message || "Password reset successful!");
          window.location.href = "index.html"; // Redirect to login page
        } else {
          alert(result.message || "Failed to reset password. Please try again.");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        alert("Something went wrong. Please try again later.");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
    
    // Resend OTP functionality
    const resendLink = document.querySelector(".resend");
    if (resendLink) {
      resendLink.addEventListener("click", async function (event) {
        event.preventDefault();
        
        // Disable the resend link temporarily to avoid spamming
        resendLink.style.pointerEvents = "none";
        resendLink.style.opacity = "0.5";
        resendLink.textContent = "Sending...";
        
        try {
          const response = await fetch("/api/auth/send-reset-link", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email }),
            credentials: "include"
          });
          
          const result = await response.json();
          if (response.ok) {
            alert(result.message || "OTP resent successfully!");
          } else {
            alert(result.message || "Failed to resend OTP. Please try again.");
          }
        } catch (error) {
          console.error("Error resending OTP:", error);
          alert("Something went wrong. Please try again.");
        } finally {
          // Re-enable the resend link after 30 seconds
          setTimeout(() => {
            resendLink.style.pointerEvents = "auto";
            resendLink.style.opacity = "1";
            resendLink.textContent = "Resend";
          }, 30000);
        }
      });
    }
  });
  
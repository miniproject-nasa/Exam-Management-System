document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      
      // Get the email value from the input (assuming input with name="email")
      const emailInput = document.querySelector('input[name="email"]');
      const email = emailInput ? emailInput.value.trim() : "";
      
      if (!email) {
        alert("Please enter your email.");
        return;
      }
      
      // Validate the email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      
      // Set loading state
      const button = form.querySelector("button");
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Sending...";
      
      try {
        // Call the backend endpoint to send the reset OTP
        const response = await fetch("/api/auth/send-reset-link", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email }),
          credentials: "include"
        });
        
        const result = await response.json();
        console.log("Server response:", result);
        
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
        
        if (response.ok) {
          alert(result.message || "Reset link sent successfully. Please check your email.");
          // Redirect to forgot2.html with the email as a query parameter
          window.location.href = `forgot2.html?email=${encodeURIComponent(email)}`;
        } else {
          alert(result.message || "Failed to send reset link. Please try again.");
        }
      } catch (error) {
        console.error("Error sending reset link:", error);
        alert("Something went wrong. Please try again later.");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
  
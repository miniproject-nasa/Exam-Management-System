let data = [];
document.addEventListener("DOMContentLoaded", async function () {
  async function checkAuthStatus() {
    try {
      const response = await fetch("/check-auth");
      data = await response.json();

      if (!data.isAuthenticated) {
        window.location.href = "/index.html";
      } else {
        return data;
        console.log(data);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }
  await checkAuthStatus();

  console.log(data);
  console.log(data.user.id);

  document.querySelector("#changePassFrm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const oldPs = document.getElementById("old-password").value;
    const password = document.getElementById("new-password").value;
    const conP = document.getElementById("Confirm-password").value;
    const id = data.user.id;

    if (oldPs != data.user.pass) {
      alert("Invalid old password");
    } else {
      if (password != conP) {
        alert("The new password does not match");
      } else if (password.length < 8) {
        alert("New password must be at least 8 characters long");
      } else {
        await fetch("/update-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, password }),
        });

        try {
          const response = await fetch("/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const reslt = await response.json();
          if (reslt.success) window.location.href = "/index.html";
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
});

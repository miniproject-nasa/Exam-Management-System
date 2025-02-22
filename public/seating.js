async function addToDisplayBox(selectId, displayBoxId) {
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
    let selectElement = document.getElementById(selectId);
    let selectedValue = selectElement.value.trim();
    let displayBox = document.getElementById(displayBoxId);

    if (!selectedValue) return; // Prevent adding empty values

    // Check for duplicate values
    if ([...displayBox.children].some(item => item.textContent === selectedValue)) {
        return; // If duplicate, exit silently
    }

    // Create a new item
    let newItem = document.createElement("p");
    newItem.textContent = selectedValue;
    newItem.style.margin = "5px 0";
    newItem.style.cursor = "pointer";

    displayBox.appendChild(newItem);
}

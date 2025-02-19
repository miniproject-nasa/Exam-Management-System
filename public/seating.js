function addToDisplayBox(selectId, displayBoxId) {
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

document.addEventListener('DOMContentLoaded', function() {
    fetchFacultiesAndRooms();
    document.querySelector('form').addEventListener('submit', handleFormSubmit);
});

async function fetchFacultiesAndRooms() {
    try {
        // Fetch faculties
        const facultyResponse = await fetch('/api/duty/faculty');
        const faculties = await facultyResponse.json();
        populateDropdown('faculties', faculties.map(f => f.U_name));
        
        // Fetch rooms
        const roomResponse = await fetch('/api/duty/rooms');
        const rooms = await roomResponse.json();
        populateDropdown('rooms', rooms.map(r => r.R_code));
    } catch (error) {
        console.error('Error fetching data:', error);
        showPopup('Error loading data from server', 'error');
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

function addToDisplayBox(selectId, boxId) {
    const select = document.getElementById(selectId);
    const box = document.getElementById(boxId);
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        if (!box.textContent.includes(selectedOption.value)) {
            const item = document.createElement('span');
            item.textContent = selectedOption.value + ' ';
            item.style.marginRight = '10px';
            
            const deleteBtn = document.createElement('span');
            deleteBtn.textContent = '×';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.color = 'red';
            deleteBtn.style.marginLeft = '2px';
            deleteBtn.onclick = () => item.remove();
            
            item.appendChild(deleteBtn);
            box.appendChild(item);
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const facultyBox = document.getElementById('faculty-box');
    const roomBox = document.getElementById('room-box');
    const dateInput = document.getElementById('duty-date');
    
    const selectedFaculties = Array.from(facultyBox.children)
        .map(span => span.textContent.trim().replace('×', '').trim())
        .filter(Boolean);
    
    const selectedRooms = Array.from(roomBox.children)
        .map(span => span.textContent.trim().replace('×', '').trim())
        .filter(Boolean);
    
    if (selectedFaculties.length === 0 || selectedRooms.length === 0) {
        showPopup('Please select at least one faculty and one room', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/generate-invigilation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selectedFaculties,
                selectedRooms,
                dutyDate: dateInput.value
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invigilation-duty-${dateInput.value}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showPopup('Invigilation duty allocation downloaded successfully!', 'success');
        } else {
            throw new Error('Failed to generate invigilation duty allocation');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Error generating invigilation duty allocation', 'error');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let dateInput = document.getElementById("duty-date");
    let today = new Date().toISOString().split("T")[0];
    //dateInput.value = today; // Set default value to today's date
});

function showPopup(message, type = "info") {
    const popup = document.createElement("div");
    popup.classList.add("popup", "active");

    let bgColor = "#0f62fe"; // Default blue
    if (type === "success") bgColor = "green";
    if (type === "error") bgColor = "red";

    popup.innerHTML = `
        <div class="popup-content" style="border-left: 5px solid ${bgColor};">
            <span class="close">&times;</span>
            <p>${message}</p>
            <button class="close-popup">OK</button>
        </div>
    `;

    document.body.appendChild(popup);
    document.querySelector(".close-popup").addEventListener("click", () => {
        popup.classList.remove("active");
        setTimeout(() => popup.remove(), 300);
    });
    document.querySelector(".close").addEventListener("click", () => {
        popup.classList.remove("active");
        setTimeout(() => popup.remove(), 300);
    });
}

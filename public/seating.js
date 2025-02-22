document.addEventListener('DOMContentLoaded', function() {
    fetchBatchesAndRooms();
    document.querySelector('form').addEventListener('submit', handleFormSubmit);
});

async function fetchBatchesAndRooms() {
    try {
        // Fetch batches
        const batchResponse = await fetch('/api/seating/batches');
        const batches = await batchResponse.json();
        populateDropdown('batches', batches.map(b => b.B_name));
        
        // Fetch rooms
        const roomResponse = await fetch('/api/seating/rooms');
        const rooms = await roomResponse.json();
        populateDropdown('rooms', rooms.map(r => r.R_code));
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading data from server');
    }
}

function populateDropdown(id, items) {
    const select = document.getElementById(id);
    // Clear existing options except the first (placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add new options
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
        // Check if already added
        if (!box.textContent.includes(selectedOption.value)) {
            const item = document.createElement('span');
            item.textContent = selectedOption.value + ' ';
            item.style.marginRight = '10px';
            
            // Add delete button
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
    
    const batchBox = document.getElementById('batch-box');
    const roomBox = document.getElementById('room-box');
    
    const selectedBatches = Array.from(batchBox.children)
        .map(span => span.textContent.trim().replace('×', '').trim())
        .filter(Boolean);
    
    const selectedRooms = Array.from(roomBox.children)
        .map(span => span.textContent.trim().replace('×', '').trim())
        .filter(Boolean);
    
    if (selectedBatches.length === 0 || selectedRooms.length === 0) {
        alert('Please select at least one batch and one room');
        return;
    }
    
    try {
        const response = await fetch('/api/generate-seating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedBatches, selectedRooms })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `seating-arrangement-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            throw new Error('Failed to generate seating arrangement');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating seating arrangement');
    }
}
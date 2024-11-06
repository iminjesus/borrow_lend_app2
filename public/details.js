// details.js
async function fetchItemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    
    try {
        const response = await fetch(`/items/${itemId}`);
        const item = await response.json();

        if (!item) {
            document.getElementById('itemDetails').innerHTML = 'Error: Item not found.';
            return;
        }

        document.getElementById('itemDetails').innerHTML = `
            <h2>${item.name}</h2>
            <p>${item.description}</p>
            <p><strong>Category:</strong> ${item.category}</p>
            
            <p><strong>Cost:</strong> ${item.hiringCost}</p>
            <p><strong>Rating:</strong> ${item.rating}</p>
            <h3>Images:</h3>
            <img src="${item.imageUrl}" alt="${item.name}">
        `;
    } catch (error) {
        console.error('Error fetching item details:', error);
        document.getElementById('itemDetails').innerHTML = 'Error fetching item details.';
    }
}

window.onload = fetchItemDetails;

let map = null;
let markers = [];

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        // Don't try to initialize the map if we're not on the page with the map
        console.warn('Map container not found, skipping map initialization.');
        return;
    }

    if (map !== null) {
        console.log('Map is already initialized.');
        return;
    }

    map = L.map('map').setView([-33.865143, 151.209900], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    console.log('Map initialized');
}


// Toggle between Map View and List View
document.addEventListener('DOMContentLoaded', function () {
    fetchItemsByCategory();  // Fetch items when the page loads
    initMap();
});

document.getElementById('mapViewButton')?.addEventListener('click', function () {
    document.getElementById('map').style.display = 'block';   // Show map
    document.getElementById('itemsList').style.display = 'none'; // Hide list
});

document.getElementById('listViewButton')?.addEventListener('click', function () {
    document.getElementById('map').style.display = 'none';   // Hide map
    document.getElementById('itemsList').style.display = 'block'; // Show list
});

// Add event listeners to the category buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const selectedCategory = event.target.getAttribute('data-category');
        console.log('Selected category:', selectedCategory);
        fetchItemsByCategory(selectedCategory);
    });
});

// Function to fetch items by category
function fetchItemsByCategory(category = '') {
    fetch(`/items?category=${category}`)  // Ensure `category` is being passed
        .then((response) => response.json())
        .then((items) => {
            console.log('Fetched items for category:', category, items);  // Check if filtered items are returned
            updateMapMarkers(items);  // Update map
            updateItemsList(items);   // Update list
        })
        .catch((error) => console.error('Error fetching items by category:', error));
}

// Function to geocode an address into latitude and longitude
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`);
        const data = await response.json();
        if (data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            console.error('No results found for address:', address);
            return null;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Add markers to the map for each item
async function updateMapMarkers(items) {
    if (!map) {
        console.error('Map is not initialized');
        return;
    }

    clearMarkers(); // Clear old markers

    for (const item of items) {
        if (item.location) {
            const coordinates = await geocodeAddress(item.location);
            if (coordinates) {
                const marker = L.marker(coordinates).addTo(map);
                marker.bindPopup(`
                    <b>${item.name}</b> 
                    <p><b>Cost:</b> $ ${item.hiringCost}</p>
                    <img src="${item.imageUrl}" alt="${item.name}" width="100" height="100">
                    <a href="/details.html?id=${item._id}">View Details</a>
                `);
                markers.push(marker);
            }
        }
    }
}

// Clear existing markers from the map
function clearMarkers() {
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];
}

// Display items in list view
function updateItemsList(items) {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;

    itemsList.innerHTML = ''; // Clear the list

    items.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <b>${item.name}</b> 
            <p><b>Cost:</b> $ ${item.hiringCost}</p>
            <img src="${item.imageUrl}" alt="${item.name}" width="100" height="100">
            <a href="/details.html?id=${item._id}">View Details</a>
        `;
        itemsList.appendChild(listItem);
    });
}

// Add Item Form Submission
document.getElementById('addItemForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent default form submission behavior

    const customerId = localStorage.getItem('customerId');  // Retrieve customerId from localStorage
    const customerAddress = localStorage.getItem('address');  // Retrieve customer address from localStorage

    if (!customerId) {
        document.getElementById('addItemMessage').innerText = 'You must be logged in to add an item.';
        return;
    }

    // Create form data to handle file upload
    const formData = new FormData();
    formData.append('name', document.getElementById('itemName').value);
    formData.append('description', document.getElementById('itemDescription').value);
    formData.append('category', document.getElementById('itemCategory').value);
    formData.append('hiringCost', document.getElementById('itemSpecificCost').value);
    formData.append('image', document.getElementById('itemImage').files[0]);
    formData.append('customerId', customerId);

    // Submit the new item data via API
    try {
        const response = await fetch('http://localhost:3000/items', {
            method: 'POST',
            body: formData,  // Use FormData to handle file upload
        });
        const result = await response.json();

        // Display success message or handle errors
        if (response.ok) {
            document.getElementById('addItemMessage').innerText = 'Item added successfully!';
        } else {
            document.getElementById('addItemMessage').innerText = 'Error adding item: ' + result.message;
        }
    } catch (error) {
        document.getElementById('addItemMessage').innerText = 'Error adding item.';
        console.error('Error:', error);
    }
});

// Load the common header in sign-in.html (and other pages)
document.addEventListener('DOMContentLoaded', function () {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            updateAuthButtons();  // Call function to update auth buttons after the header is loaded
        })
        .catch(error => console.error('Error loading header:', error));

    // Check if the user is logged in (this assumes `customerId` is stored in localStorage on login)
    const customerId = localStorage.getItem('customerId');
    //const element = document.getElementById('yourElementId');
    if (customerId) {
        customerId.style.display = 'block';
    } else {
        console.error('Element not found');
    }
    
    initMap();
});

// Function to check if the user is logged in and display the appropriate buttons
function updateAuthButtons() {
    const first_name = localStorage.getItem('first_name');  // Retrieve first name from localStorage
    const signInButton = document.getElementById('signInButton');
    const joinButton = document.getElementById('joinButton');
    const greeting = document.getElementById('greeting');
    const logoutButton = document.getElementById('logoutButton');

    if (first_name) {
        // User is logged in
        signInButton.style.display = 'none';
        joinButton.style.display = 'none';
        greeting.innerText = `Hello, ${first_name}`;
        greeting.style.display = 'inline';
        logoutButton.style.display = 'inline';
    } else {
        // User is logged out
        signInButton.style.display = 'inline';
        joinButton.style.display = 'inline';
        greeting.style.display = 'none';
        logoutButton.style.display = 'none';
    }
}

// Event listener for logout button
document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('first_name');
    localStorage.removeItem('customerId');
    location.reload();  // Reload to reset the auth state
});

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginData = { email, password };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: JSON.stringify(loginData),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        if (result.success) {
            localStorage.setItem('customerId', result.customer._id);
            localStorage.setItem('first_name', result.customer.first_name);
            document.getElementById('loginMessage').innerText = 'Login successful!';
            updateAuthButtons();

            setTimeout(() => window.location.href = 'index.html', 2000);  // Redirect after 2 seconds
        } else {
            document.getElementById('loginMessage').innerText = 'Login failed: ' + result.message;
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginMessage').innerText = 'An error occurred during login.';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Only attach the event listener when the form is available
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const loginData = { email, password };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    body: JSON.stringify(loginData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('customerId', result.customer._id);
                    localStorage.setItem('first_name', result.customer.first_name);
                    document.getElementById('loginMessage').innerText = 'Login successful!';
                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    document.getElementById('loginMessage').innerText = 'Login failed: ' + result.message;
                }
            } catch (error) {
                document.getElementById('loginMessage').innerText = 'An error occurred during login.';
                console.error('Login error:', error);
            }
        });
    }
});

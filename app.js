const API_KEY = '8175fA5f6098c5301022f475da32a2aa';
let authToken = '';
const apiUrl = 'https://ucsdiscosapi.azurewebsites.net/api';
let isLoading = false;
let page = 1;

async function authenticate() {
    try {
        const response = await fetch(`${apiUrl}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey: API_KEY })
        });

        const data = await response.json();
        authToken = data.token;
    } catch (error) {
        console.error('Error authenticating:', error);
    }
}

async function fetchImages(page = 1, limit = 12) {
    try {
        showLoading(true);

        const response = await fetch(`${apiUrl}/images?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        displayImages(data.items);
        showLoading(false);
    } catch (error) {
        console.error('Error fetching images:', error);
        showLoading(false);
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (show) {
        loadingElement.classList.remove('d-none');
    } else {
        loadingElement.classList.add('d-none');
    }
}

function displayImages(images) {
    const gallery = document.getElementById('gallery');
    images.forEach((image) => {
        const imageElement = document.createElement('div');
        imageElement.classList.add('col-md-4', 'gallery-item');
        imageElement.innerHTML = `
            <img src="${image.url}" alt="${image.title}" class="img-fluid" onclick="showAlbumDetails(${image.id})">
        `;
        gallery.appendChild(imageElement);
    });
}

async function showAlbumDetails(albumId) {
    try {
        const response = await fetch(`${apiUrl}/albums/${albumId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch album details');
        }

        const album = await response.json();
        const modalBody = document.getElementById('albumDetails');
        modalBody.innerHTML = `
            <h3>${album.title}</h3>
            <p>${album.description}</p>
            ${album.coverImage ? `<img src="${album.coverImage}" alt="${album.title}" class="img-fluid">` : ''}
        `;
        $('#albumModal').modal('show');
    } catch (error) {
        console.error('Error fetching album details:', error);
    }
}

window.addEventListener('scroll', () => {
    if (isLoading || window.innerHeight + window.scrollY < document.body.offsetHeight - 10) {
        return;
    }

    isLoading = true;
    page++;
    fetchImages(page).then(() => {
        isLoading = false;
    });
});

window.onload = async () => {
    await authenticate();
    fetchImages(page);
};
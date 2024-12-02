let token = '';
const apiKey = '8175fA5f6098c5301022f475da32a2aa';

function authenticate() {
    console.log('Starting authentication...');
    showLoading();  // Exibe o spinner ao iniciar a requisição
    axios.post('https://ucsdiscosapi.azurewebsites.net/Discos/autenticar', null, {
        headers: {
            'ChaveApi': apiKey
        }
    })
    .then(response => {
        console.log('Authentication response:', response);
        token = response.data;
        if (token) {
            console.log('Authenticated successfully, Token:', token);
            loadAlbums(0, 12);
        } else {
            console.error('Failed to retrieve token');
            hideLoading(); // Esconde o loading caso o token não seja obtido
        }
    })
    .catch(error => {
        console.error('Error during authentication:', error);
        hideLoading();  // Esconde o loading em caso de erro
    });
}

async function loadAlbums(start, quantity) {
    console.log('Starting to load albums...');
    if (!token) {
        console.error('Token is not available. Cannot load albums.');
        hideLoading();  // Esconde o loading caso o token não esteja disponível
        return;
    }

    if (start < 1) {
        start = 1;
    }

    if (quantity < 1 || quantity > 12) {
        quantity = 12;
    }

    console.log(`numeroInicio: ${start}, quantidade: ${quantity}`);

    try {
        const response = await axios.get('https://ucsdiscosapi.azurewebsites.net/Discos/records', {
            params: {
                numeroInicio: start,
                quantidade: quantity
            },
            headers: {
                'TokenApiUCS': token
            }
        });

        console.log('Albums response:', response);
        const albums = response.data;
        if (albums && albums.length > 0) {
            albums.forEach(album => {
                displayAlbum(album);
            });
        } else {
            console.error("No albums returned from API.");
        }
    } catch (error) {
        console.error('Error loading albums:', error);
    } finally {
        // Aqui garantimos que o hideLoading será chamado ao final
        setTimeout(hideLoading, 500); // Usamos o setTimeout para garantir a execução
    }
}

function displayAlbum(album) {
    console.log('Album data:', album);
    console.log('Base64 Image Data:', album.imagemEmBase64);

    const albumContainer = document.getElementById('album-list');
    const albumElement = document.createElement('div');
    albumElement.classList.add('col-md-4');
    albumElement.classList.add('album');

    const imageUrl = album.imagemEmBase64 ? `data:image/jpeg;base64,${album.imagemEmBase64}` : 'https://via.placeholder.com/150';

    albumElement.innerHTML = `
        <div class="card">
            <img src="data:image/jpeg;base64,${album.imagemEmBase64}" alt="Album Image">
            <div class="card-body">
                <h5 class="card-title">${album.name}</h5>
            </div>
        </div>
    `;

    albumContainer.appendChild(albumElement);

    albumElement.addEventListener('click', () => {
        openAlbumModal(album);
    });
}

function openAlbumModal(album) {
    console.log('Opening album modal for:', album);
    const modal = document.getElementById('album-modal');
    modal.querySelector('.modal-title').innerText = album.name;
    modal.querySelector('.modal-body').innerHTML = `
        <p><strong>Artist:</strong> ${album.artist}</p>
        <p><strong>Release Year:</strong> ${album.releaseYear}</p>
        <p><strong>Description:</strong> ${album.description}</p>
    `;
    $('#album-modal').modal('show');
}

function showLoading() {
    console.log('Showing loading spinner...');
    document.getElementById('loading').style.display = 'flex';  // Exibe o spinner enquanto carrega
}

function hideLoading() {
    console.log('Hiding loading spinner...');
    document.getElementById('loading').style.display = 'none';  // Esconde o spinner quando os dados terminam de carregar
}

authenticate();
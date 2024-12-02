let token = '';
const apiKey = '8175fA5f6098c5301022f475da32a2aa';
let start = 1; // Alterado para let
const quantity = 12;

function authenticate() {
    console.log('Starting authentication...');
    showLoading();
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
            loadAlbums(start, quantity);
        } else {
            console.error('Failed to retrieve token');
            hideLoading();
        }
    })
    .catch(error => {
        console.error('Error during authentication:', error);
        hideLoading();
    });
}

async function loadAlbums(numeroInicio, quantidade) {
    showLoading();
    console.log('Starting to load albums...');
    if (!token) {
        console.error('Token is not available. Cannot load albums.');
        hideLoading();
        return;
    }

    console.log(`numeroInicio: ${numeroInicio}, quantidade: ${quantidade}`);

    try {
        const response = await axios.get('https://ucsdiscosapi.azurewebsites.net/Discos/records', {
            params: {
                numeroInicio: numeroInicio,
                quantidade: quantidade
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
            start += quantity; // Atualiza start para o próximo lote
        } else {
            console.error("No albums returned from API.");
        }
    } catch (error) {
        console.error('Error loading albums:', error);
    } finally {
        setTimeout(hideLoading, 500);
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
            <img src="${imageUrl}" alt="Album Image">
            <div id="card${album.id}" class="card-body">
                <h5 class="card-title">${album.id}</h5>
                <h5 class="card-title">${album.descricaoPrimaria}</h5>
                <h5 class="card-title">${album.descricaoSecundaria}</h5>
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
    document.getElementById('card' + album.id).style.cssText = 'display:block !important';
}

function showLoading() {
    console.log('Showing loading spinner...');
    document.getElementById('loading').style.cssText = 'display:flex !important';
}

function hideLoading() {
    console.log('Hiding loading spinner...');
    document.getElementById('loading').style.cssText = 'display:none !important';
}

authenticate();

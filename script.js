let token = '';
const apiKey = '8175fA5f6098c5301022f475da32a2aa';
let start = 1;
const quantity = 12;
const incremento = 4;
const registros = 104;
let isLoading = false; // Evita chamadas concorrentes

function authenticate() {
    showLoading();
    axios.post('https://ucsdiscosapi.azurewebsites.net/Discos/autenticar', null, {
        headers: {
            'ChaveApi': apiKey
        }
    })
    .then(response => {
        token = response.data;
        if (token) {
            console.log('Token:', token);
            loadAlbums(start, quantity);
            setupInfiniteScroll();
        } else {
            console.error('Falha ao gerar token.');
        }
    })
    .catch(error => {
        console.error('Erro durante a autenticação', error);
    })
    .finally(() => {
        hideLoading();
    });
}

async function loadAlbums(numeroInicio, quantidade) {
    if (isLoading) return;
    isLoading = true;
    showLoading();

    if (!token) {
        console.error('Token não está disponível. Não foi possível carregar os álbuns.');
        hideLoading();
        isLoading = false;
        return;
    }

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

        const albums = response.data;
        if (albums && albums.length > 0) {
            if (start === 1) {
                document.getElementById('album-list').innerHTML = '';
            }

            albums.forEach(album => {
                displayAlbum(album);
            });

            if (start + quantidade > registros) {
                start = 1;
            } else {
                start += quantidade;
            }
        } else {
            console.error("Nenhum álbum retornado.");
        }
    } catch (error) {
        console.error('Erro ao carregar os álbuns:', error);
    } finally {
        hideLoading();
        isLoading = false; // Libera a flag pra próxima chamada
    }
}

function displayAlbum(album) {
    const albumContainer = document.getElementById('album-list');
    const albumElement = document.createElement('div');
    albumElement.classList.add('col-md-4');
    albumElement.classList.add('album');

    const imageUrl = album.imagemEmBase64 ? `data:image/jpeg;base64,${album.imagemEmBase64}` : 'https://via.placeholder.com/150';

    albumElement.innerHTML = `
        <div class="card">
            <img src="${imageUrl}" alt="Album Image">
            <div class="card-body">
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
    const modal = new bootstrap.Modal(document.getElementById('albumModal'));
    document.getElementById('modalAlbumId').innerText = `ID: ${album.id}`;
    document.getElementById('modalPrimaryDesc').innerText = album.descricaoPrimaria;
    document.getElementById('modalSecondaryDesc').innerText = album.descricaoSecundaria;
    
    const imageUrl = album.imagemEmBase64 ? `data:image/jpeg;base64,${album.imagemEmBase64}` : 'https://via.placeholder.com/150';
    document.getElementById('modalAlbumImage').src = imageUrl;

    modal.show();
}

function showLoading() {
    document.getElementById('loading').style.cssText = 'display:flex !important';
}

function hideLoading() {
    document.getElementById('loading').style.cssText = 'display:none !important';
}

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadAlbums(start, incremento);
        }
    });
}

authenticate();
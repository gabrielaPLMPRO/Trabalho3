let token = '';
const apiKey = '8175fA5f6098c5301022f475da32a2aa';
let start = 1;
const quantity = 12;
const incremento = 4;
const registros = 105;
let isLoading = false; // Para evitar chamadas concorrentes

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
            hideLoading();
        }
    })
    .catch(error => {
        console.error('Erro durante a autenticação', error);
        hideLoading();
    });
}

async function loadAlbums(numeroInicio, quantidade) {
    if (isLoading) return; // Evita chamadas concorrentes
    isLoading = true;
    showLoading();
    if (!token) {
        console.error('Token não está disponível. Não foi possível carregar os albuns.');
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
            albums.forEach(album => {
                displayAlbum(album);
            });

            // Atualiza `start` para o próximo lote, reiniciando quando atingir o limite
            start = (start + quantidade > registros) ? 1 : start + quantidade;
        } else {
            console.error("Nenhum album retornado.");
        }
    } catch (error) {
        console.error('Erro ao carregar os albums:', error);
    } finally {
        hideLoading();
        isLoading = false; // Libera o sinalizador para a próxima chamada
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
    document.getElementById('card' + album.id).style.cssText = 'display:block !important';
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

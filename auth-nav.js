// Mostra o perfil do usuário no canto direito da barra de navegação
(function () {
    // Endereço deste arquivo (a raiz do site), usado para montar os links
    var raiz = document.currentScript.src;

    // Ajuste os nomes das pastas se forem diferentes
    var PAGINA_PERFIL = 'Perfil-Page/perfil.html';
    var PAGINA_LOGIN = 'Login-Page/login.html';

    var ICONE_TROCAR =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>' +
        '<path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>';

    var ICONE_USUARIO =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="12" cy="7" r="4"/></svg>';

    function endereco(caminho) {
        return new URL(caminho, raiz).href;
    }

    function criar(tag, classe, texto) {
        var elemento = document.createElement(tag);
        if (classe) elemento.className = classe;
        if (texto) elemento.textContent = texto;
        return elemento;
    }

    function desenhar(caixa, sessao) {
        caixa.textContent = '';

        // Sem login: botão "Entrar"
        if (!sessao) {
            var entrar = criar('a', 'nav-entrar', 'Entrar');
            entrar.href = endereco(PAGINA_LOGIN);
            caixa.appendChild(entrar);
            return;
        }

        var meta = sessao.user.user_metadata || {};
        var nome = meta.nome || sessao.user.email.split('@')[0];

        // Pílula branca: foto + nome + curso + trocar de conta
        var pilula = criar('div', 'nav-user-pill');

        var avatar;
        if (meta.avatar_url) {
            avatar = criar('img', 'nav-avatar');
            avatar.src = meta.avatar_url;
            avatar.alt = '';
        } else {
            avatar = criar('span', 'nav-avatar', nome.trim().charAt(0).toUpperCase());
        }

        var info = criar('div', 'nav-user-info');
        info.appendChild(criar('span', 'nav-user-nome', nome));
        info.appendChild(criar('span', 'nav-user-curso', meta.curso || ''));

        var trocar = criar('button', 'nav-btn-trocar');
        trocar.type = 'button';
        trocar.title = 'Trocar de conta';
        trocar.setAttribute('aria-label', 'Trocar de conta');
        trocar.innerHTML = ICONE_TROCAR;
        trocar.addEventListener('click', async function () {
            trocar.disabled = true;
            await cliente.auth.signOut();
            window.location.href = endereco(PAGINA_LOGIN);
        });

        pilula.appendChild(avatar);
        pilula.appendChild(info);
        pilula.appendChild(trocar);

        // Círculo roxo: vai para o perfil
        var perfil = criar('a', 'nav-btn-perfil');
        perfil.href = endereco(PAGINA_PERFIL);
        perfil.title = 'Meu perfil';
        perfil.setAttribute('aria-label', 'Meu perfil');
        perfil.innerHTML = ICONE_USUARIO;

        caixa.appendChild(pilula);
        caixa.appendChild(perfil);
    }

    document.addEventListener('DOMContentLoaded', async function () {
        var cabecalho = document.querySelector('.header-container');
        if (!cabecalho) return;

        var caixa = criar('div', 'nav-user');
        cabecalho.appendChild(caixa);

        var resposta = await cliente.auth.getSession();
        desenhar(caixa, resposta.data.session);

        // Atualiza sozinho quando o usuário entra, sai ou troca a foto/dados
        cliente.auth.onAuthStateChange(function (evento, sessao) {
            if (evento === 'INITIAL_SESSION') return;
            desenhar(caixa, sessao);
        });
    });
})();
// Adiciona "Meu Perfil" ou "Entrar" no menu, conforme o usuário esteja logado
(function () {
    // Pasta onde este arquivo está (a raiz do site), usada para montar os links
    var raiz = document.currentScript.src;

    var PAGINA_PERFIL = 'Perfil-Page/perfil.html';
    var PAGINA_LOGIN = 'Login-Page/login.html';

    document.addEventListener('DOMContentLoaded', async function () {
        var lista = document.querySelector('.main-nav ul');
        if (!lista) return;

        // Se o menu já tem o link do perfil, não faz nada
        if (lista.querySelector('a[href$="perfil.html"]')) return;

        var resposta = await cliente.auth.getSession();
        var logado = !!resposta.data.session;

        var item = document.createElement('li');
        var link = document.createElement('a');
        link.href = new URL(logado ? PAGINA_PERFIL : PAGINA_LOGIN, raiz).href;
        link.textContent = logado ? 'Meu Perfil' : 'Entrar';
        item.appendChild(link);
        lista.appendChild(item);
    });
})();
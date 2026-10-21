// Quando a página é aberta dentro do pop-up (iframe) do login, ativa o modo "embed"
if (window.self !== window.top) {
    document.documentElement.classList.add('embed');
}
document.addEventListener('DOMContentLoaded', () => {
    // Alternar entre Entrar / Criar conta
    const abas = document.querySelectorAll('.tab');
    const paineis = {
        login: document.getElementById('painel-login'),
        cadastro: document.getElementById('painel-cadastro')
    };

    function mostrarAba(nome) {
        abas.forEach(aba => {
            const ativa = aba.dataset.alvo === nome;
            aba.classList.toggle('active', ativa);
            aba.setAttribute('aria-selected', ativa);
        });
        Object.entries(paineis).forEach(([chave, painel]) => {
            const ativo = chave === nome;
            painel.classList.toggle('active', ativo);
            painel.hidden = !ativo;
        });
    }

    abas.forEach(aba => aba.addEventListener('click', () => mostrarAba(aba.dataset.alvo)));
    if (location.hash === '#cadastro') mostrarAba('cadastro');

    // Mostrar / ocultar senha
    document.querySelectorAll('.toggle-senha').forEach(botao => {
        botao.addEventListener('click', () => {
            const input = document.getElementById(botao.dataset.alvo);
            const mostrando = input.type === 'text';
            input.type = mostrando ? 'password' : 'text';
            botao.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Ocultar senha');
        });
    });

    // Força da senha
    const senha = document.getElementById('cad-senha');
    const forca = document.getElementById('forca');
    const forcaTexto = document.getElementById('forca-texto');
    const rotulos = ['Fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];

    senha.addEventListener('input', () => {
        const v = senha.value;
        let nivel = 0;
        if (v.length >= 8) nivel++;
        if (/[a-z]/.test(v) && /[A-Z]/.test(v)) nivel++;
        if (/\d/.test(v)) nivel++;
        if (/[^A-Za-z0-9]/.test(v)) nivel++;
        if (v.length === 0) nivel = 0;
        forca.dataset.nivel = nivel;
        forcaTexto.textContent = rotulos[nivel];
        validarConfirmacao();
    });

    // Confirmação de senha
    const confirma = document.getElementById('cad-confirma');
    const erroConfirma = document.getElementById('erro-confirma');

    function validarConfirmacao() {
        const diferente = confirma.value !== '' && confirma.value !== senha.value;
        erroConfirma.hidden = !diferente;
        confirma.setCustomValidity(diferente ? 'As senhas não coincidem.' : '');
    }
    confirma.addEventListener('input', validarConfirmacao);
});
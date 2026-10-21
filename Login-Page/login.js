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
        // =========================================================
    // SUPABASE
    // =========================================================

    const PAGINA_INICIAL = '../index.html';

    // ----- Funções auxiliares -----
    function mostrarMensagem(elemento, texto, tipo) {
        elemento.textContent = texto;
        elemento.className = 'mensagem ' + (tipo === 'ok' ? 'ok-msg' : 'erro-msg');
        elemento.hidden = false;
    }

    function limparMensagem(elemento) {
        elemento.hidden = true;
        elemento.textContent = '';
    }

    function traduzirErro(erro) {
        const msg = (erro.message || '').toLowerCase();
        if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
        if (msg.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
        if (msg.includes('already registered')) return 'Este e-mail já está cadastrado.';
        if (msg.includes('password should be at least')) return 'A senha deve ter pelo menos 8 caracteres.';
        if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
        return 'Não foi possível concluir. Tente novamente.';
    }
        // ----- Login -----
    const formLogin = document.getElementById('form-login');
    const msgLogin = document.getElementById('msg-login');

    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limparMensagem(msgLogin);
        if (!formLogin.reportValidity()) return;

        const botao = formLogin.querySelector('.botao-login');
        botao.disabled = true;

        try {
            const { error } = await cliente.auth.signInWithPassword({
                email: document.getElementById('login-email').value.trim(),
                password: document.getElementById('login-senha').value
            });

            if (error) {
                mostrarMensagem(msgLogin, traduzirErro(error), 'erro');
                return;
            }
            window.location.href = PAGINA_INICIAL;
        } catch (erro) {
            console.error(erro);
            mostrarMensagem(msgLogin, 'Não foi possível conectar ao servidor. Recarregue a página e tente de novo.', 'erro');
        } finally {
            botao.disabled = false;
        }
    });

    // ----- Cadastro -----
    const formCadastro = document.getElementById('form-cadastro');
    const msgCadastro = document.getElementById('msg-cadastro');

    formCadastro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limparMensagem(msgCadastro);
        if (!formCadastro.reportValidity()) return;

        const botao = formCadastro.querySelector('.botao-login');
        botao.disabled = true;

        try {
            const { data, error } = await cliente.auth.signUp({
                email: document.getElementById('cad-email').value.trim(),
                password: document.getElementById('cad-senha').value,
                options: {
                    data: {
                        nome: document.getElementById('cad-nome').value.trim(),
                        curso: document.getElementById('cad-curso').value,
                        semestre: document.getElementById('cad-semestre').value
                    },
                    emailRedirectTo: window.location.href.split('#')[0].split('?')[0]
                }
            });

            if (error) {
                mostrarMensagem(msgCadastro, traduzirErro(error), 'erro');
                return;
            }

            // Com confirmação por e-mail ligada, e-mail já existente volta sem identidades
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                mostrarMensagem(msgCadastro, 'Este e-mail já está cadastrado.', 'erro');
                return;
            }

            formCadastro.reset();
            forca.dataset.nivel = 0;
            forcaTexto.textContent = 'Fraca';

            if (data.session) {
                // Confirmação desligada: já entra logado
                window.location.href = PAGINA_INICIAL;
            } else {
                mostrarMensagem(msgCadastro, 'Conta criada! Enviamos um link de confirmação para o seu e-mail.', 'ok');
            }
        } catch (erro) {
            console.error(erro);
            mostrarMensagem(msgCadastro, 'Não foi possível conectar ao servidor. Recarregue a página e tente de novo.', 'erro');
        } finally {
            botao.disabled = false;
        }
    });

    // ----- Esqueci minha senha -----
    document.getElementById('link-esqueci').addEventListener('click', async (evento) => {
        evento.preventDefault();
        limparMensagem(msgLogin);

        const emailInput = document.getElementById('login-email');
        if (!emailInput.value.trim() || !emailInput.checkValidity()) {
            mostrarMensagem(msgLogin, 'Digite seu e-mail no campo acima e clique novamente.', 'erro');
            emailInput.focus();
            return;
        }

        const { error } = await cliente.auth.resetPasswordForEmail(emailInput.value.trim(), {
            redirectTo: window.location.origin + '/redefinir-senha.html'
        });

        if (error) {
            mostrarMensagem(msgLogin, traduzirErro(error), 'erro');
            return;
        }
        mostrarMensagem(msgLogin, 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.', 'ok');
    });
        // ----- Pop-up dos Termos de Uso -----
    const modalTermos = document.getElementById('modal-termos');
    const frameTermos = document.getElementById('frame-termos');
    const linkTermos = document.getElementById('abrir-termos');
    const aceiteTermos = document.getElementById('aceite-termos');

    linkTermos.addEventListener('click', (evento) => {
        evento.preventDefault();
        // Carrega a página dos termos só na primeira vez que o pop-up abre
        if (!frameTermos.getAttribute('src')) {
            frameTermos.src = linkTermos.href;
        }
        modalTermos.showModal();
    });

    document.getElementById('fechar-termos').addEventListener('click', () => {
        modalTermos.close();
    });

    // "Li e concordo": marca a caixinha do cadastro e fecha o pop-up
    document.getElementById('aceitar-termos').addEventListener('click', () => {
        aceiteTermos.checked = true;
        modalTermos.close();
    });

    // Clicar fora da janela também fecha (a tecla Esc já fecha sozinha)
    modalTermos.addEventListener('click', (evento) => {
        if (evento.target === modalTermos) modalTermos.close();
    });
});
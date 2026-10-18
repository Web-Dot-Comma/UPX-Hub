document.addEventListener('DOMContentLoaded', async () => {
    const LIMITE_AVATAR = 2 * 1024 * 1024; // 2 MB
    const TIPOS_AVATAR = ['image/jpeg', 'image/png', 'image/webp'];
    const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

    const msg = document.getElementById('msg-perfil');
    const gridProjetos = document.getElementById('meus-projetos');
    let usuario = null;

    function escaparHtml(texto) {
        return String(texto)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function mostrarMsg(texto, tipo) {
        msg.textContent = texto;
        msg.className = 'msg-form ' + tipo;   // classes já existem no cadastro.css; veja nota no perfil.sql
        msg.hidden = false;
    }

    // ---------- 1. Sessão ----------
    const { data: { session } } = await cliente.auth.getSession();
    if (!session) {
        window.location.href = '../Login-Page/login.html';
        return;
    }
    usuario = session.user;

    // ---------- 2. Dados do perfil (vêm do user_metadata gravado no signUp) ----------
    function desenharPerfil() {
        const meta = usuario.user_metadata || {};
        const nome = meta.nome || usuario.email.split('@')[0];

        document.getElementById('perfil-nome').textContent = nome;
        document.getElementById('perfil-email').textContent = usuario.email;
        document.getElementById('perfil-curso').textContent = meta.curso || '';
        document.getElementById('perfil-semestre').textContent = meta.semestre ? meta.semestre + ' semestre' : '';
        document.getElementById('perfil-desde').textContent =
            'Membro desde ' + new Date(usuario.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const avatar = document.getElementById('avatar');
        if (meta.avatar_url) {
            avatar.style.backgroundImage = `url("${meta.avatar_url}")`;
            avatar.textContent = '';
        } else {
            avatar.style.backgroundImage = '';
            avatar.textContent = nome.trim().charAt(0).toUpperCase();
        }
        document.getElementById('perfil-card').hidden = false;
    }
    desenharPerfil();

    // ---------- 3. Foto de perfil ----------
    document.getElementById('input-avatar').addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (!TIPOS_AVATAR.includes(arquivo.type)) return mostrarMsg('Use uma imagem JPG, PNG ou WebP.', 'erro');
        if (arquivo.size > LIMITE_AVATAR) return mostrarMsg('A foto passa de 2 MB.', 'erro');

        mostrarMsg('Enviando foto...', 'info');
        try {
            const extensao = arquivo.name.split('.').pop().toLowerCase();
            const caminho = usuario.id + '/avatar-' + Date.now() + '.' + extensao;

            const up = await cliente.storage.from('avatares')
                .upload(caminho, arquivo, { contentType: arquivo.type });
            if (up.error) throw up.error;

            const url = cliente.storage.from('avatares').getPublicUrl(caminho).data.publicUrl;

                        const avatarAntigo = (usuario.user_metadata || {}).avatar_url;

            const upd = await cliente.auth.updateUser({ data: { avatar_url: url } });
            if (upd.error) throw upd.error;

            usuario = upd.data.user;

            // Remove a foto anterior do Storage (falha aqui não é crítica)
            const caminhoAntigo = caminhoDoStorage(avatarAntigo, 'avatares');
            if (caminhoAntigo) await cliente.storage.from('avatares').remove([caminhoAntigo]);

            usuario = upd.data.user;
            desenharPerfil();
            mostrarMsg('Foto atualizada!', 'ok');
        } catch (erro) {
            console.error(erro);
            mostrarMsg('Não foi possível atualizar a foto. Tente novamente.', 'erro');
        }
        e.target.value = '';
    });

    // ---------- 4. Sair ----------
    document.getElementById('btn-sair').addEventListener('click', async () => {
        await cliente.auth.signOut();
        window.location.href = '../index.html';
    });

    // ---------- 5. Meus projetos ----------
    function cardProjeto(p) {
        const likes = p.curtidas && p.curtidas[0] ? p.curtidas[0].count : 0;
        const cursos = (p.cursos || []).map(c => `<span class="course-tag">${escaparHtml(c)}</span>`).join('');
        const imagem = p.imagem_url || '../img/proj-pluvia-alagamento.webp';
        const status = p.status || 'pendente';

        return `
            <article class="project-card" data-id="${p.id}">
                <div class="card-image-wrapper">
                    <span class="tag-top-left">UPX ${ROMANOS[p.semestre - 1] || ''} • ${p.semestre}º SEMESTRE</span>
                    <span class="status-badge ${escaparHtml(status)}">${escaparHtml(status)}</span>
                    <span class="tag-bottom-left">${escaparHtml(p.tema)}</span>
                    <img src="${escaparHtml(imagem)}" alt="${escaparHtml(p.titulo)}" loading="lazy">
                </div>
                <div class="card-content">
                    <h4>${escaparHtml(p.titulo)}</h4>
                    <p class="card-desc">${escaparHtml(p.descricao)}</p>
                    <div class="card-courses">${cursos}</div>
                    <div class="card-footer">
                        <div class="footer-info">
                            <span>👥 ${(p.membros || []).length} devs</span>
                            <span>❤️ ${likes}</span>
                        </div>
                        <div class="card-acoes">
                            <button class="btn-excluir" data-id="${p.id}">Excluir</button>
                            <button class="btn-ver" onclick="window.location.href='../Projeto-Page/projects.html?id=${p.id}'">Ver</button>
                        </div>
                    </div>
                </div>
            </article>`;
    }

    function atualizarContagem() {
        const n = gridProjetos.querySelectorAll('.project-card').length;
        document.getElementById('perfil-contagem').textContent =
            n === 1 ? '1 projeto cadastrado' : n + ' projetos cadastrados';
        if (n === 0) {
            gridProjetos.innerHTML =
                '<p class="vazio">Você ainda não cadastrou nenhum projeto. ' +
                '<a href="../Cadastro-Page/cadastro.html">Cadastre o primeiro!</a></p>';
        }
    }

    async function carregarMeusProjetos() {
        const { data, error } = await cliente
            .from('projetos')
            .select('*, curtidas(count)')
            .eq('autor_id', usuario.id)
            .order('created_at', { ascending: false });

        document.getElementById('perfil-projetos').hidden = false;

        if (error) {
            console.error(error);
            gridProjetos.innerHTML = '<p class="vazio">Não foi possível carregar seus projetos.</p>';
            return;
        }
        gridProjetos.innerHTML = data.map(cardProjeto).join('');
        atualizarContagem();
    }

    // Converte a URL pública do Storage de volta para o caminho do arquivo no bucket
    function caminhoDoStorage(url, bucket) {
        if (!url) return null;
        const marcador = '/object/public/' + bucket + '/';
        const i = url.indexOf(marcador);
        return i === -1 ? null : decodeURIComponent(url.slice(i + marcador.length));
    }

    // ---------- 6. Excluir projeto ----------
    gridProjetos.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('.btn-excluir');
        if (!botao) return;

        const id = Number(botao.dataset.id);
        if (!confirm('Excluir este projeto? Essa ação não pode ser desfeita.')) return;

        botao.disabled = true;

        // Pega as URLs dos arquivos antes de apagar a linha
        const { data: proj } = await cliente
            .from('projetos')
            .select('imagem_url, imagem_prototipo_url, pdf_url')
            .eq('id', id).eq('autor_id', usuario.id).single();

        // .select() devolve as linhas apagadas: se vier vazio, o RLS bloqueou
        const { data: apagados, error } = await cliente
            .from('projetos')
            .delete()
            .eq('id', id)
            .eq('autor_id', usuario.id)
            .select('id');

        if (error || !apagados || apagados.length === 0) {
            console.error(error);
            mostrarMsg('Não foi possível excluir o projeto.', 'erro');
            botao.disabled = false;
            return;
        }

        // Limpa os arquivos do Storage (falha aqui não é crítica)
        if (proj) {
            const imagens = [proj.imagem_url, proj.imagem_prototipo_url]
                .map(u => caminhoDoStorage(u, 'projetos-imagens')).filter(Boolean);
            const pdf = caminhoDoStorage(proj.pdf_url, 'projetos-pdfs');
            if (imagens.length) await cliente.storage.from('projetos-imagens').remove(imagens);
            if (pdf) await cliente.storage.from('projetos-pdfs').remove([pdf]);
        }

        evento.target.closest('.project-card').remove();
        atualizarContagem();
        mostrarMsg('Projeto excluído.', 'ok');
    });

    carregarMeusProjetos();
});
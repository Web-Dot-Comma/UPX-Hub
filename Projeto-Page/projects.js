document.addEventListener('DOMContentLoaded', async () => {
    const projetoId = Number(new URLSearchParams(window.location.search).get('id'));

    if (!projetoId) return;

    const botao = document.getElementById('btn-curtir-detalhe');

    if (!botao) {
        console.error('Botão de curtida não encontrado no HTML.');
        return;
    }

    // Busca os dados do projeto
    async function carregarProjeto() {
        try {
            const { data: { session }, error: erroSessao } = await cliente.auth.getSession();

            if (erroSessao) throw erroSessao;

            const usuarioId = session ? session.user.id : null;

            const { data: projeto, error } = await cliente
                .from('projetos')
                .select('*, curtidas(count)')
                .eq('id', projetoId)
                .single();

            if (error) throw error;

            console.log('Curtidas retornadas:', projeto.curtidas);

            // Preenche as informações do projeto
            const titulo = document.getElementById('projeto-titulo');
            const subtitulo = document.getElementById('projeto-subtitulo');
            const tituloResumo = document.getElementById('projeto-titulo-resumo');
            const textoResumo = document.getElementById('projeto-texto-resumo');
            const imgPrototipo = document.getElementById('img-prototipo');
            const imgEquipe = document.getElementById('img-equipe');
            const devs = document.getElementById('projeto-devs');

            if (titulo) {
                titulo.textContent = projeto.titulo;
            }

            if (subtitulo) {
                subtitulo.textContent =
                    projeto.subtítulo || projeto.descricao_curta || '';
            }

            if (tituloResumo) {
                tituloResumo.textContent = projeto.titulo;
            }

            if (textoResumo) {
                textoResumo.textContent =
                    projeto.descricao_longa || projeto.descricao || '';
            }

            if (imgPrototipo) {
                imgPrototipo.src =
                    projeto.imagem_prototipo || projeto.imagem_prototipo_url || projeto.prototipo_url || '';
            }

            if (imgEquipe) {
                imgEquipe.src = projeto.foto_equipe || '';
            }

            if (devs) {
                devs.textContent =
                    `👥 ${projeto.membros ? projeto.membros.length : 0} Devs`;
            }

            // Verifica se o usuário já curtiu
            let jaCurtiu = false;

            if (usuarioId) {
                const { data, error: erroCurtida } = await cliente
                    .from('curtidas')
                    .select('projeto_id')
                    .eq('user_id', usuarioId)
                    .eq('projeto_id', projetoId)
                    .maybeSingle();

                if (erroCurtida) throw erroCurtida;

                jaCurtiu = !!data;
            }

            // Atualiza o botão de curtida
            const icone = botao.querySelector('.icone');
            const qtd = botao.querySelector('.qtd');

            botao.dataset.id = projetoId;
            botao.classList.toggle('curtido', jaCurtiu);

            if (icone) {
                icone.textContent = jaCurtiu ? '❤️' : '🤍';
            }

            // Atualiza a quantidade de curtidas
            if (qtd) {
                qtd.textContent = projeto.curtidas?.[0]?.count ?? 0;
            }

        } catch (erro) {
            console.error('Erro ao carregar o projeto:', erro);
        }
    }

    // Curtir / descurtir
    botao.addEventListener('click', async () => {
        if (botao.disabled) return;

        try {
            const { data: { session }, error: erroSessao } = await cliente.auth.getSession();

            if (erroSessao) throw erroSessao;

            const usuarioId = session ? session.user.id : null;

            if (!usuarioId) {
                window.location.href = '../Login-Page/login.html';
                return;
            }

            const jaCurtiu = botao.classList.contains('curtido');
            botao.disabled = true;

            let erro;

            if (jaCurtiu) {
                // Remove a curtida
                ({ error: erro } = await cliente.from('curtidas')
                    .delete()
                    .eq('projeto_id', projetoId)
                    .eq('user_id', usuarioId));
            } else {
                // Registra a curtida
                ({ error: erro } = await cliente.from('curtidas')
                    .insert({
                        projeto_id: projetoId,
                        user_id: usuarioId
                    }));
            }

            if (erro) throw erro;

            // Atualiza o contador e o ícone
            const qtd = botao.querySelector('.qtd');
            const icone = botao.querySelector('.icone');

            if (!qtd || !icone) {
                throw new Error('Elementos do botão de curtida não encontrados.');
            }

            let total = Number(qtd.textContent);

            if (jaCurtiu) {
                total = Math.max(0, total - 1);
            } else {
                total++;
            }

            botao.classList.toggle('curtido', !jaCurtiu);
            icone.textContent = jaCurtiu ? '🤍' : '❤️';
            qtd.textContent = total;

        } catch (erro) {
            console.error('Erro ao atualizar curtida:', erro);

            alert(
                'Não foi possível atualizar a curtida. ' +
                'Confira sua conexão e as permissões do Supabase.'
            );

        } finally {
            botao.disabled = false;
        }
    });

    // Inicializa a página
    carregarProjeto();
});
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
            const tituloResumo = document.getElementById('projeto-titulo-resumo');
            const textoResumo = document.getElementById('projeto-texto-resumo');
            const imgPrototipo = document.getElementById('img-prototipo');
            const imgEquipe = document.getElementById('img-equipe');
            const devs = document.getElementById('projeto-devs');
            const tagTema = document.getElementById('tag-theme')
            const tagSemestre = document.getElementById('tag-semester')
            const tagCurso = document.getElementById('tag-course')

            if (tagTema) {
                tagTema.textContent = projeto.tema || '';
            }

            if (tagSemestre) {
                tagSemestre.textContent = projeto.semestre
                ? `${projeto.semestre}º Semestre · UPX 2026.1`: '';
            }

            if (tagCurso) {
                tagCurso.textContent = Array.isArray(projeto.cursos)
                ? projeto.cursos.join(', ')
                : projeto.cursos || '';
            }       

            if (titulo) {
                titulo.textContent = projeto.titulo;
            }

            if (tituloResumo) {
                tituloResumo.textContent = projeto.titulo;
            }

            if (textoResumo) {
                textoResumo.textContent =
                    projeto.descricao_longa || projeto.descricao || '';
            }

            if (imgPrototipo) {
                imgPrototipo.src = projeto.imagem_prototipo || projeto.imagem_prototipo_url || projeto.prototipo_url || '';
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


    const formComentario = document.querySelector('.box-comment form.comment');

    if (!formComentario) return;

    formComentario.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const textarea = document.getElementById('comentario');
        const textoComentario = textarea.value.trim();

        if (!textoComentario) {
            alert('Escreve algum comentário antes de enviar!');
            return;
        }

        try {
            // 1. Verifica se o utilizador está autenticado
            const { data: { session }, error: erroSessao } = await cliente.auth.getSession();
            if (erroSessao) throw erroSessao;

            if (!session) {
                alert('Precisas de iniciar sessão para comentar.');
                window.location.href = '../Login-Page/login.html';
                return;
            }

            const usuarioId = session.user.id;
            
            // Pega o ID do projeto que está no URL (como já fazemos em cima)
            const projetoId = Number(new URLSearchParams(window.location.search).get('id'));

            // 2. Insere o comentário no Supabase
            const { error: erroInsert } = await cliente
                .from('comentarios')
                .insert({
                    projeto_id: projetoId,
                    user_id: usuarioId,
                    conteudo: textoComentario
                });

            if (erroInsert) throw erroInsert;

            // 3. Caso tenha sucesso! 
            textarea.value = '';
            alert('Comentário enviado com sucesso!');
            
        } catch (erro) {
            console.error('Erro ao enviar comentário:', erro);
            alert('Ocorreu um erro ao enviar o comentário. Tenta novamente.');
        }
    });



    // Inicializa a página
    carregarProjeto();
});
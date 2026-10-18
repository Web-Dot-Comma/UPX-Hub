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
            
            // Carrega o PDF do projeto
            const pdfViewer = document.getElementById('pdf-viewer');
            const pdfLink = document.getElementById('pdf-link');

            const urlPdf = projeto.pdf_url;

            if (urlPdf && pdfViewer && pdfLink) {
                pdfViewer.src = `${urlPdf}#navpanes=0`;
                pdfViewer.style.display = 'block';

                pdfLink.href = urlPdf;
                pdfLink.textContent = 'Abrir PDF em outra aba';
                pdfLink.target = '_blank';
                pdfLink.rel = 'noopener noreferrer';
                pdfLink.style.display = 'inline-block';
            } else {
                if (pdfViewer) {
                    pdfViewer.removeAttribute('src');
                    pdfViewer.style.display = 'none';
                }

                if (pdfLink) {
                    pdfLink.removeAttribute('href');
                    pdfLink.style.display = 'none';
                }
            }


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

            const botaoDevs = document.getElementById('btn-devs');
            const listaDevs = document.getElementById('nomes-devs');
            const nomes = Array.isArray(projeto.membros) ? projeto.membros : [];

            if (botaoDevs && listaDevs) {
                botaoDevs.textContent = `👥 Devs (${nomes.length})`;
                listaDevs.replaceChildren();

            if (nomes.length === 0) {
                listaDevs.textContent = '';

                const item = document.createElement('li');
                item.textContent = 'Nenhum integrante cadastrado';
                listaDevs.appendChild(item);
            }
            else {
                nomes.forEach(nome => {
                        const item = document.createElement('li');

                        // Aceita nomes em texto ou objetos com a propriedade nome
                        item.textContent = typeof nome === 'string'
                            ? nome
                            : nome.nome || nome.name || 'Integrante';

                        listaDevs.appendChild(item);
                    });
                }
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
        


async function carregarComentarios() {
    const lista = document.getElementById('lista-comentarios');

    if (!lista) {
        console.error('Elemento lista-comentarios não encontrado.');
        return;
    }

    try {
        // Faz a busca do comentário e já traz o nome da tabela profiles ligada pelo user_id
        const { data: comentarios, error } = await cliente
            .from('comentarios')
            .select(`
                id,
                conteudo,
                created_at,
                profiles (
                    nome
                )
            `)
            .eq('projeto_id', projetoId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        lista.replaceChildren();

        if (!comentarios || comentarios.length === 0) {
            lista.textContent = 'Ainda não há comentários neste projeto.';
            return;
        }

        for (const comentario of comentarios) {
            let nomeUsuario = 'Usuário';

            // Extrai o nome do perfil retornado pelo Join do Supabase
            if (comentario.profiles) {
                if (Array.isArray(comentario.profiles) && comentario.profiles.length > 0) {
                    nomeUsuario = comentario.profiles[0].nome || 'Usuário';
                } else if (comentario.profiles.nome) {
                    nomeUsuario = comentario.profiles.nome;
                }
            }

            const card = document.createElement('article');
            card.className = 'comentario-card';

            const nome = document.createElement('h4');
            nome.className = 'comentario-autor';
            nome.textContent = nomeUsuario;

            const texto = document.createElement('p');
            texto.className = 'comentario-texto';
            texto.textContent = comentario.conteudo || '';

            card.append(nome, texto);
            lista.appendChild(card);
        }

    } catch (erro) {
        console.error('Erro ao carregar comentários:', erro);
        lista.textContent = 'Não foi possível carregar os comentários.';
    }
}

    // Inicializa a página
    carregarProjeto();
    carregarComentarios();
});
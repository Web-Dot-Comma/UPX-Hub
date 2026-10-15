document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    if (!projetoId) {
        console.error('Nenhum ID de projeto encontrado na URL.');
        return;
    }

    try {
        const { data: projeto, error } = await cliente
            .from('projetos') // Substitua pelo nome real da sua tabela
            .select('*')
            .eq('id', projetoId)
            .single();

        if (error || !projeto) {
            console.error('Erro ao buscar projeto:', error);
            return;
        }

        // Elementos do html com dados do supabase
        document.getElementById('projeto-titulo').textContent = projeto.titulo;
        document.getElementById('projeto-subtitulo').textContent = projeto.subtítulo || projeto.descricao_curta;
        document.getElementById('projeto-titulo-resumo').textContent = projeto.titulo;
        document.getElementById('projeto-texto-resumo').textContent = projeto.descricao_longa;
        document.getElementById('projeto-devs').textContent = `👥 ${projeto.devs} Devs`;

        // Imagens
        document.getElementById('img-prototipo').src = projeto.foto_prototipo;
        document.getElementById('img-equipe').src = projeto.foto_equipe;

        } catch (err) {
        console.error('Erro ao conectar com o Supabase:', err);
    }
});
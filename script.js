document.addEventListener('DOMContentLoaded', () => {
    // Array simulando os dados que virão da Supabase
    const projetosData = [
        {
            id: 1,
            titulo: "Projeto Pluvia",
            desc: "O Projeto Pluvia antecipa o alagamento antes da chuva chegar oferecendo segurança e previsibilidade.",
            imagem: "img/proj-pluvia-alagamento.webp",
            upx: "UPX II",
            semestre: "2º SEMESTRE",
            tema: "Cidades Inteligentes",
            cursos: ["Computação", "Mecatrônica"],
            devs: 5,
            likes: 24
        },
        {
            id: 2,
            titulo: "Modelo de Drenagem",
            desc: "O modelo de drenagem urbana proposto quer elevar a qualidade de vida da população, reduzindo a intensidade das enchentes.",
            imagem: "img/proj-drenagem-urbana.webp",
            upx: "UPX IV",
            semestre: "4º SEMESTRE",
            tema: "Sustentabilidade",
            cursos: ["Civil", "Computação"],
            devs: 4,
            likes: 18
        },
        {
            id: 3,
            titulo: "SmartCity Sorocaba",
            desc: "Plataforma IoT distribuída para sensores urbanos de tráfego, alagamento e qualidade do ar em tempo real.",
            imagem: "img/proj-pluvia-alagamento.webp", // Placeholder
            upx: "UPX VI",
            semestre: "6º SEMESTRE",
            tema: "Automação",
            cursos: ["Computação", "Mecatrônica"],
            devs: 6,
            likes: 42
        }
    ];

    const grid = document.getElementById('projetos-grid');
    const countLabel = document.getElementById('projects-count');
    const chipsContainer = document.getElementById('active-chips-container');

    // Função que converte o Array em HTML na tela
    function renderizarProjetos(projetos) {
        grid.innerHTML = '';
        countLabel.textContent = `Exibindo ${projetos.length} projetos aprovados`;
        if (projetos.length==0){
            grid.innerHTML= '<p class="no-project-found">Nenhum projeto encontrado.</p>';
        }

        projetos.forEach(proj => {
            const cursosHtml = proj.cursos.map(c => `<span class="course-tag">${c}</span>`).join('');
            
            const card = `
                <article class="project-card">
                    <div class="card-image-wrapper">
                        <span class="tag-top-left">${proj.upx} • ${proj.semestre}</span>
                        <span class="tag-bottom-left">${proj.tema}</span>
                        <img src="${proj.imagem}" alt="${proj.titulo}" loading="lazy">
                    </div>
                    <div class="card-content">
                        <h4>${proj.titulo}</h4>
                        <p class="card-desc">${proj.desc}</p>
                        <div class="card-courses">
                            ${cursosHtml}
                        </div>
                        <div class="card-footer">
                            <div class="footer-info">
                                <span>👥 ${proj.devs} devs</span>
                                <span>❤️ ${proj.likes}</span>
                            </div>
                            <button class="btn-ver">Ver</button>
                        </div>
                    </div>
                </article>
            `;
            grid.insertAdjacentHTML('beforeend', card);
        });
    }

    // Inicialização do Array
    renderizarProjetos(projetosData);

    // Sistema básico de escuta de filtros (pronto para ser expandido com as chamadas de API)
    const selects = document.querySelectorAll('.filter-selects select');
    
    selects.forEach(select => {
        select.addEventListener('change', () => {
            atualizarChipsAtivos();
        });
    });

    function atualizarChipsAtivos() {
        // Limpa chips exceto o título
        chipsContainer.innerHTML = '<span class="active-filters-label">FILTROS ATIVOS:</span>';
        
        selects.forEach(select => {
            if (select.value) {
                const chip = document.createElement('div');
                chip.className = 'active-chip';
                chip.innerHTML = `${select.value} <span>×</span>`;
                
                // Botão de remover filtro específico
                chip.querySelector('span').addEventListener('click', () => {
                    select.value = '';
                    atualizarChipsAtivos();
                });
                
                chipsContainer.appendChild(chip);
            }
        });
    }

    // Botão Limpar Filtros
    document.getElementById('limpar-filtros').addEventListener('click', () => {
        selects.forEach(s => s.value = '');
        document.getElementById('busca-projeto').value = '';
        atualizarChipsAtivos();
    });
      //barra de pesquisa
    const searchInput = document.getElementById('busca-projeto');
    
    searchInput.addEventListener('input', (event) => {
        const value = formatString(event.target.value);

        
            const projetosEncontrados = projetosData.filter(projeto =>
                formatString(projeto.titulo).includes(value) ||
                formatString(projeto.tema).includes(value) ||
                formatString(projeto.semestre).includes(value) ||
                projeto.cursos.some(curso =>
                    formatString(curso).includes(value))
                );
                renderizarProjetos(projetosEncontrados);
    })
        //funções para os valores retornarem sem precisar de pontuação e diferenciar o maiúsculo do minúsculo
    function formatString(value){
        return value
        .toLowerCase() 
        .trim()
        .normalize('NFD')
        .replace (/[\u0300-\u036f]/g, '');
    }
});
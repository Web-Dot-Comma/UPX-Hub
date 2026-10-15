document.addEventListener('DOMContentLoaded', () => {
    // Este bloco é só da home: se a página não tiver a grade de projetos, não faz nada
    if (!document.getElementById('projetos-grid')) return;

    // Projetos carregados do Supabase
    let projetosData = [];

        // Curtidas do usuário logado
    let usuarioId = null;
    let meusLikes = new Set();

    async function carregarMeusLikes() {
        const { data: { session } } = await cliente.auth.getSession();
        usuarioId = session ? session.user.id : null;
        meusLikes = new Set();
        if (!usuarioId) return;

        const { data } = await cliente
            .from('curtidas')
            .select('projeto_id')
            .eq('user_id', usuarioId);
        meusLikes = new Set((data || []).map(l => l.projeto_id));
    }

    const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

    // Converte uma linha do banco para o formato que o site já usa
    function converterProjeto(linha) {
        return {
            id: linha.id,
            titulo: linha.titulo,
            desc: linha.descricao,
            imagem: linha.imagem_url || 'img/proj-pluvia-alagamento.webp',
            upx: 'UPX ' + ROMANOS[linha.semestre - 1],
            semestre: linha.semestre + 'º SEMESTRE',
            tema: linha.tema,
            cursos: linha.cursos,
            devs: linha.membros.length,
            likes: linha.curtidas[0] ? linha.curtidas[0].count : 0
        };
    }

    // Evita que texto digitado por usuários seja interpretado como HTML
    function escaparHtml(texto) {
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    const grid = document.getElementById('projetos-grid');
    const countLabel = document.getElementById('projects-count');
    const chipsContainer = document.getElementById('active-chips-container');
    
        function renderizarProjetos(projetos) {
        grid.innerHTML = '';
        countLabel.textContent = `Exibindo ${projetos.length} projetos aprovados`;
        if (projetos.length == 0) {
            grid.innerHTML = '<p class="no-project-found">Nenhum projeto encontrado.</p>';
        }

        projetos.forEach(proj => {
            const cursosHtml = proj.cursos.map(c => `<span class="course-tag">${escaparHtml(c)}</span>`).join('');

            const card = `
                <article class="project-card">
                    <div class="card-image-wrapper">
                        <span class="tag-top-left">${escaparHtml(proj.upx)} • ${escaparHtml(proj.semestre)}</span>
                        <span class="tag-bottom-left">${escaparHtml(proj.tema)}</span>
                        <img src="${escaparHtml(proj.imagem)}" alt="${escaparHtml(proj.titulo)}" loading="lazy">
                    </div>
                    <div class="card-content">
                        <h4>${escaparHtml(proj.titulo)}</h4>
                        <p class="card-desc">${escaparHtml(proj.desc)}</p>
                        <div class="card-courses">
                            ${cursosHtml}
                        </div>
                        <div class="card-footer">
                            <div class="footer-info">
                                <span>👥 ${proj.devs} devs</span>
                                    <button class="btn-curtir ${meusLikes.has(proj.id) ? 'curtido' : ''}" data-id="${proj.id}" aria-label="Curtir projeto">
                                    <span class="icone">${meusLikes.has(proj.id) ? '❤️' : '🤍'}</span>
                                    <span class="qtd">${proj.likes}</span>
                                </button>
                            </div>
                            <button class="btn-ver">Ver</button>
                        </div>
                    </div>
                </article>
            `;
            grid.insertAdjacentHTML('beforeend', card);
        });
    }

    // Busca os projetos aprovados no Supabase
    async function carregarProjetos() {
        countLabel.textContent = 'Carregando projetos...';

        const { data, error } = await cliente
            .from('projetos')
            .select('*, curtidas(count)')
            .eq('status', 'aprovado')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            countLabel.textContent = '';
            grid.innerHTML = '<p class="no-project-found">Não foi possível carregar os projetos.</p>';
            return;
        }

        await carregarMeusLikes();
        projetosData = data.map(converterProjeto);
        renderizarProjetos(projetosData);
    }

        // Curtir / descurtir (um único listener para todos os cards)
    grid.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('.btn-curtir');
        if (!botao) return;

        // Quem não está logado vai para o login
        if (!usuarioId) {
            window.location.href = 'Login-Page/login.html';
            return;
        }

        const id = Number(botao.dataset.id);
        const jaCurtiu = meusLikes.has(id);
        botao.disabled = true;

        let erro;
        if (jaCurtiu) {
            ({ error: erro } = await cliente.from('curtidas')
                .delete().eq('projeto_id', id).eq('user_id', usuarioId));
        } else {
            ({ error: erro } = await cliente.from('curtidas')
                .insert({ projeto_id: id }));
        }

        botao.disabled = false;
        if (erro) {
            console.error(erro);
            return;
        }

        // Atualiza a tela sem recarregar
        const proj = projetosData.find(p => p.id === id);
        if (jaCurtiu) { meusLikes.delete(id); proj.likes--; }
        else { meusLikes.add(id); proj.likes++; }

        botao.classList.toggle('curtido', !jaCurtiu);
        botao.querySelector('.icone').textContent = jaCurtiu ? '🤍' : '❤️';
        botao.querySelector('.qtd').textContent = proj.likes;
    });

    // Inicialização: busca os projetos no banco
    carregarProjetos();

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

//LÓGICA DO FORMULÁRIO DE CADASTRO
// Variáveis globais de controle das etapas
var currentStep = 1;
var totalSteps = 3;

// Função de limpar mensagens de erro
function limparErros(secao) {
    secao.querySelectorAll(".mensagem-erro").forEach(function (erro) {
        erro.remove();
    });

    secao.querySelectorAll(".campo-invalido").forEach(function (campo) {
        campo.classList.remove("campo-invalido");
    });
}

// Função de exibir mensagem de erro
function exibirErroAbaixo(elemento, mensagem) {
   if (!elemento) return;
    var erro = document.createElement("span");
    erro.className = "mensagem-erro";
    erro.textContent = mensagem;
    if (elemento.type === "radio" ||
        elemento.type === "checkbox") {
        var grupo = elemento.closest(".campo-grupo") ||
                    elemento.parentElement;
        grupo.appendChild(erro);
        return;
    }
    elemento.insertAdjacentElement("afterend", erro);
}

// Função de validar se os campos da etapa estao preenchidos
function validarEtapa(secao) {
    limparErros(secao);

    // Validar campos de texto, textarea, select e arquivos
    var campos = secao.querySelectorAll(
        "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']):not([type='reset']):not([type='hidden']), textarea, select"
    );

    for (var campo of campos) {
    if (!campo.checkValidity()) {
        var mensagem;
        if (campo.type === "file" && campo.validity.valueMissing) {
                mensagem = campo.accept.indexOf("image") !== -1
                ? "Por favor, selecione uma imagem."
                : "Por favor, selecione um arquivo PDF.";
            } 
        else {
            mensagem = campo.validity.valueMissing
                ? "Por favor, preencha este campo."
                : "Por favor, informe um valor válido.";
        }
        exibirErroAbaixo(campo, mensagem);
        campo.focus();
        return false;
        }
    }


    // Validar se pelo menos um elemento do checkbox foi selecionado
    var checkboxes = secao.querySelectorAll(
        "input[type='checkbox']"
    );
    if (checkboxes.length > 0) {
        var algumMarcado = Array.from(checkboxes).some(function (checkbox) {
            return checkbox.checked;
        });
        if (!algumMarcado) {
            var grupo = checkboxes[0].closest(".campo-grupo") || checkboxes[0].parentElement;
            exibirErroAbaixo(
                grupo,
                "Por favor, selecione pelo menos um curso."
            );
            checkboxes[0].focus();
            return false;
        }
    }
    // Validar caixa de seleção radio obrigatórios
    var radiosObrigatorios = secao.querySelectorAll(
        "input[type='radio'][required]"
    );
    var nomesGrupos = new Set();
    radiosObrigatorios.forEach(function (radio) {
        nomesGrupos.add(radio.name);
    });
    for (var nome of nomesGrupos) {
        var radioSelecionado = Array.from(
            secao.querySelectorAll('input[type="radio"]')
        ).some(function (radio) {
            return radio.name === nome && radio.checked;
        });
        if (!radioSelecionado) {
            var primeiroRadio = Array.from(
                secao.querySelectorAll('input[type="radio"]')
            ).find(function (radio) {
                return radio.name === nome;
            });
            var grupoTema = primeiroRadio.closest(".opcoes");
            exibirErroAbaixo(
                primeiroRadio,
                "Por favor, selecione um tema."
            );
            primeiroRadio.focus();
            return false;
        }
    }
    return true;
}

// Função de avançar para a próxima etapa
window.nextStep = function () {
    var secaoAtual = document.getElementById("step" + currentStep);
    if (!secaoAtual || !validarEtapa(secaoAtual)) {
        return;
    }
    if (currentStep < totalSteps) {
        var proximaEtapa = document.getElementById(
            "step" + (currentStep + 1)
        );
        if (!proximaEtapa) return;
        secaoAtual.style.display = "none";
        currentStep++;
        proximaEtapa.style.display = "block";
    }
    atualizarVisualProgresso(currentStep);
};

// Função de voltar para a etapa anterior
window.previousStep = function () {
    if (currentStep <= 1) return;
    var secaoAtual = document.getElementById("step" + currentStep);
    var etapaAnterior = document.getElementById(
        "step" + (currentStep - 1)
    );
    if (!secaoAtual || !etapaAnterior) return;
    secaoAtual.style.display = "none";
    currentStep--;
    etapaAnterior.style.display = "block";
    atualizarVisualProgresso(currentStep);
};

// Função de adicionar/excluir desenvolvedor
window.Addmember = function () {
    var container = document.getElementById("container-membros");
    if (!container) return;
    var novoDiv = document.createElement("div");
    novoDiv.className = "membro-item";
    var novoInput = document.createElement("input");
    novoInput.type = "text";
    novoInput.name = "membros";
    novoInput.required = true;
    var btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.className = "btn-remover";
    btnRemover.textContent = "✕";
    btnRemover.setAttribute("aria-label", "Remover desenvolvedor");

    btnRemover.onclick = function () {
        novoDiv.remove();
    };
    novoDiv.appendChild(novoInput);
    novoDiv.appendChild(btnRemover);
    container.appendChild(novoDiv);
};

//Função para alterar a barra de progresso de acordo com a etapa atual
function atualizarVisualProgresso(etapaAtual) {
    for (var i = 1; i <= 3; i++) {
        var el = document.getElementById("etapa-" + i);
        if (el) {
            el.classList.remove("active", "completed");
            
            var span = el.querySelector("span");
            
            if (i < etapaAtual) {
                el.classList.add("completed");
                if (span) span.textContent = "✔"; 
            } 
            else if (i === etapaAtual) {
                el.classList.add("active");
                if (span) span.textContent = i;
            } 
            else {
                if (span) span.textContent = i;
            }
        }
    }

    var barraPreenchimento = document.getElementById("linhaPreenchimento");
    if (barraPreenchimento) {
        if (etapaAtual === 1) {
            barraPreenchimento.style.width = "33%";
        } else if (etapaAtual === 2) {
            barraPreenchimento.style.width = "66%";
        } else if (etapaAtual === 3) {
            barraPreenchimento.style.width = "100%";
        }
    }
}

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

// =========================================================
// CADASTRO DE PROJETOS: envio para o Supabase
// =========================================================
var LIMITE_IMAGEM = 5 * 1024 * 1024;   // 5 MB
var LIMITE_PDF = 20 * 1024 * 1024;     // 20 MB
var TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp'];

function mostrarMsgForm(texto, tipo) {
    var msg = document.getElementById('msg-cadastro-projeto');
    msg.textContent = texto;
    msg.className = 'msg-form ' + tipo;
    msg.hidden = false;
}

// Confere tipo e tamanho do arquivo. Devolve o texto do erro ou '' se estiver ok
function validarArquivo(arquivo, nome, tipos, limite, limiteTexto) {
    if (!tipos.includes(arquivo.type)) {
        return nome + ': formato não permitido.';
    }
    if (arquivo.size > limite) {
        return nome + ': o arquivo passa de ' + limiteTexto + '.';
    }
    return '';
}

// Envia um arquivo para o Storage e devolve o link público
async function enviarArquivo(bucket, arquivo, usuarioId, enviados) {
    var extensao = arquivo.name.split('.').pop().toLowerCase();
    var caminho = usuarioId + '/' + crypto.randomUUID() + '.' + extensao;

    var resposta = await cliente.storage
        .from(bucket)
        .upload(caminho, arquivo, { contentType: arquivo.type });
    if (resposta.error) throw resposta.error;

    enviados.push({ bucket: bucket, caminho: caminho });
    return cliente.storage.from(bucket).getPublicUrl(caminho).data.publicUrl;
}

function traduzirErroProjeto(erro) {
    var msg = (erro.message || '').toLowerCase();
    if (msg.includes('row-level security')) return 'Sem permissão para enviar. Faça login novamente.';
    if (msg.includes('mime')) return 'Um dos arquivos tem formato não permitido.';
    if (msg.includes('exceeded') || msg.includes('too large')) return 'Um dos arquivos é grande demais.';
    if (msg.includes('projetos_semestre_check')) return 'Semestre inválido. Escolha de 1º a 8º semestre.';
    return 'Não foi possível enviar o projeto. Tente novamente.';
}

// Enviar formulário
window.submitForm = async function () {
    var form = document.getElementById('formulario');
    var secao = document.getElementById('step3');
    var botao = secao.querySelector('.btn-submit');
    if (!form || !secao) return;

    // Validação de campos obrigatórios (função que já existe no script.js)
    if (!validarEtapa(secao)) return;

    var fotoGrupo = document.getElementById('uploadImgProj').files[0];
    var fotoProto = document.getElementById('uploadImgProt').files[0];
    var pdf = document.getElementById('uploadProj').files[0];

    var erroArquivo =
        validarArquivo(fotoGrupo, 'Foto do grupo', TIPOS_IMAGEM, LIMITE_IMAGEM, '5 MB') ||
        validarArquivo(fotoProto, 'Foto do protótipo', TIPOS_IMAGEM, LIMITE_IMAGEM, '5 MB') ||
        validarArquivo(pdf, 'PDF', ['application/pdf'], LIMITE_PDF, '20 MB');

    if (erroArquivo) {
        mostrarMsgForm(erroArquivo, 'erro');
        return;
    }

    botao.disabled = true;
    mostrarMsgForm('Enviando projeto, aguarde...', 'info');

    var enviados = [];

    try {
        var resposta = await cliente.auth.getUser();
        var usuario = resposta.data.user;
        if (!usuario) throw new Error('sem-login');

        var imagemUrl = await enviarArquivo('projetos-imagens', fotoGrupo, usuario.id, enviados);
        var prototipoUrl = await enviarArquivo('projetos-imagens', fotoProto, usuario.id, enviados);
        var pdfUrl = await enviarArquivo('projetos-pdfs', pdf, usuario.id, enviados);

        var insercao = await cliente.from('projetos').insert({
            titulo: document.getElementById('nomeProj').value.trim(),
            descricao: document.getElementById('resumo').value.trim(),
            semestre: parseInt(form.elements['semestre'].value, 10),
            tema: form.querySelector('input[name="tema"]:checked').value,
            cursos: Array.from(form.querySelectorAll('input[name="curso"]:checked'))
                .map(function (c) { return c.value; }),
            membros: Array.from(form.querySelectorAll('input[name="membros"]'))
                .map(function (i) { return i.value.trim(); })
                .filter(Boolean),
            imagem_url: imagemUrl,
            foto_equipe: imagemUrl,
            imagem_prototipo_url: prototipoUrl,
            pdf_url: pdfUrl
        });
        if (insercao.error) throw insercao.error;

        // Deu certo: limpa o formulário e volta para a etapa 1
        form.reset();
        Array.from(document.querySelectorAll('#container-membros .membro-item'))
        .slice(1)
        .forEach(function (item) { item.remove(); });
        secao.style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        currentStep = 1;
        atualizarVisualProgresso(1);
        mostrarMsgForm('Projeto enviado! Ele aparecerá na página inicial depois de aprovado.', 'ok');

    } catch (erro) {
        console.error(erro);

        // Apaga arquivos que já tinham subido, para não sobrar lixo no Storage
        for (var i = 0; i < enviados.length; i++) {
            await cliente.storage.from(enviados[i].bucket).remove([enviados[i].caminho]);
        }

        if (erro.message === 'sem-login') {
            mostrarMsgForm('Você precisa estar logado para cadastrar um projeto.', 'erro');
        } else {
            mostrarMsgForm(traduzirErroProjeto(erro), 'erro');
        }
    }

    botao.disabled = false;
};

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('formulario');
    if (!form) return;

    // Impede o envio padrão (por exemplo, apertar Enter dentro de um campo)
    form.addEventListener('submit', function (evento) {
        evento.preventDefault();
    });

    // Só quem está logado pode cadastrar
    cliente.auth.getSession().then(function (resposta) {
        if (!resposta.data.session) {
            mostrarMsgForm('Você precisa estar logado para cadastrar um projeto. Redirecionando para o login...', 'info');
            setTimeout(function () {
                window.location.href = '../Login-Page/login.html';
            }, 2500);
        }
    });
});
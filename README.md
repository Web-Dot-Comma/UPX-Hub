# UPX Hub 

> Plataforma web acadêmica centralizada desenvolvida por estudantes de Engenharia da Computação da **UniFacens** (Sorocaba) para exibir, cadastrar e gerenciar projetos da UPX (Usina de Projetos Experimentais).

---

## Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Sobre a UPX](#sobre-a-upx-usina-de-projetos-experimentais)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura e Estrutura de Arquivos](#arquitetura-e-estrutura-de-arquivos)
- [Autores e Contribuintes](#autores-e-contribuintes)
- [Licença](#licença)
---

## Sobre o Projeto

O **UPX Hub** é uma plataforma moderna e interativa criada para dar visibilidade às soluções de engenharia e projetos multidisciplinares desenvolvidos ao longo dos semestres de UPX na UniFacens. O sistema permite que discentes e docentes se autentiquem de forma segura, explorem um catálogo dinâmico de projetos filtrado por cursos e semestres, curtam publicações, interajam via comentários, conheçam a metodologia experimental da instituição e cadastrem novas inovações acadêmicas com suporte a armazenamento em nuvem.

---

## Sobre a UPX (Usina de Projetos Experimentais)

A **UPX (Usina de Projetos Experimentais)** é a metodologia curricular ativa e integradora da **UniFacens**, desenhada para conectar a teoria acadêmica à prática profissional desde o primeiro dia de faculdade. 

Ao longo dos **8 semestres de graduação**, discentes de Engenharia da Computação e demais cursos desenvolvem projetos práticos e multidisciplinares focados na resolução de desafios reais da sociedade e da indústria. A jornada evolui gradativamente:

- **1º ao 2º Semestre:** Introdução à engenharia, lógica de programação, circuitos básicos e prototipagem física/digital.
- **3º ao 4º Semestre:** Sistemas embarcados, desenvolvimento web/mobile, estruturas de dados e arquitetura de software.
- **5º ao 6º Semestre:** Redes de computadores, Internet das Coisas (IoT), banco de dados relacional/não-relacional e engenharia de software.
- **7º ao 8º Semestre:** Inteligência Artificial, sistemas distribuídos, segurança da informação e soluções completas de mercado.

O **UPX Hub** surge como a vitrine digital desse ecossistema, catalogando, preservando e compartilhando as inovações criadas por nossos estudantes.

---

## Principais Funcionalidades

* **Módulo de Autenticação e Cadastro (`login.html` & `login.js`):** Interface em abas para login e criação de contas, contemplando verificação em tempo real da força da senha, alternância de visibilidade de senha, mapeamento de curso acadêmico, recuperação de senha e tratamento localizado de erros.
* **Grade de Projetos e Filtros Dinâmicos (`index.html` & `script.js`):** Catálogo interativo com suporte a filtros por curso, semestre e tema, barra de pesquisa inteligente em tempo real (tratando acentuação e maiúsculas/minúsculas), contadores de curtidas e sistema de chips ativos.
* **Visualização Detalhada do Projeto (`projects.html` & `projects.js`):** Página dedicada a exibir títulos, resumos, tags estilizadas, galerias visuais (protótipo e equipe), contador de curtidas e seção interativa para envio de comentários/perguntas.
* **Cadastro Multi-Etapas (`cadastro.html`, `cadastro.css`, `cadastro.js`):** Assistente intuitivo dividido em 3 etapas para preenchimento de dados gerais, adição dinâmica de desenvolvedores, escolha de categorias e upload de arquivos (fotos de equipe, protótipos e relatórios em PDF).
* **Página Institucional e Sobre o Grupo (`conheca.html` & `grupo.html`):** Créditos completos aos desenvolvedores com seus respectivos R.A.s.
* **Integração com Supabase:** Persistência robusta de dados em nuvem, controle de sessões de usuários, gerenciamento de likes e salvamento de metadados.

---

## Tecnologias Utilizadas

* **HTML5:** Marcação semântica, atributos de acessibilidade (`aria-*`) e elementos modernos de formulário.
* **CSS3:** Variáveis personalizadas (`:root`), layouts em Flexbox e Grid, design responsivo com media queries e estilização de componentes.
* **JavaScript (ES6+):** Manipulação de DOM, manipulação de eventos, validação assíncrona de formulários, consumo de APIs do Supabase e lógica client-side.
* **Supabase (`@supabase/supabase-js`):** Backend-as-a-Service (BaaS) para autenticação de usuários, consultas ao banco de dados relacional e gerenciamento de arquivos.
* **Git & GitHub:** Controle de versão e colaboração em equipe.

---

## Arquitetura e Estrutura de Arquivos

```text
UPX-Hub/
│
├── index.html                # Página principal com feed, filtros inteligentes e FAQ
├── style.css                 # Estilos globais e variáveis de tema
├── supabase-client.js        # Inicialização oficial do cliente Supabase (URL e Publishable Key)
│
├── css/
│   ├── cadastro.css          # Estilização do formulário em etapas e regras responsivas
│   ├── conheca.css           # Estilos da página explicativa sobre a metodologia UPX
│   └── grupo.css             # Estilos da página de apresentação dos integrantes
│
├── js/
│   ├── script.js             # Lógica do feed, filtros dinâmicos, chips e busca textual
│   ├── cadastro.js           # Lógica do formulário, validações e envio ao Supabase
│   └── auth-nav.js           # Gerenciamento dinâmico da pílula de usuário na barra de navegação
│
├── Login-Page/
│   ├── login.html            # Página unificada de login e criação de conta
│   ├── login.css             # Estilos específicos do painel de autenticação
│   └── login.js              # Lógica de abas, força de senha e autenticação Supabase
│
├── Perfil-Page/
│   ├── perfil.html           # Página de gerenciamento de perfil e projetos do usuário
│   ├── perfil.css            # Estilos do cartão de perfil e listagem de submissões
│   └── perfil.js             # Lógica de avatar, listagem e exclusão de projetos
│
├── Projeto-Page/
│   ├── projects.html         # Exibição detalhada do projeto, mídias, PDF e comentários
│   ├── projects.css          # Estilização do leitor PDF, cards de imagem e comentários
│   └── projects.js             # Lógica de interações, curtidas e comentários
│
├── Termos-Page/
│   ├── termos.html           # Termos de Uso e diretrizes de conformidade LGPD
│   └── termos.css            # Estilização do documento institucional de termos
│
├── Cadastro-Page/
│   └── cadastro.html         # Página de submissão de projetos em etapas
│
├── Conheca-Page/
│   └── conheca.html          # Seção explicativa sobre a metodologia UPX
│
├── Grupo-Page/
│   └── grupo.html            # Apresentação dos estudantes desenvolvedores
│
├── img/                      # Logotipos, ícones, fotos dos integrantes e favicons
└── README.md                 # Documentação completa do repositório

``` 
---

## Autores e Contribuintes
Desenvolvido com dedicação por estudantes de Engenharia da Computação do 2º semestre da UniFacens (2026):

Isadora Fioravante (R.A: 264384)

Ana Kilciauskas (R.A: 263427)

Erica Yuying (R.A: 264238)

Erick Ruibin (R.A: 264239)

Frederico Rodrigues (R.A: 264182)

---

Licença
Desenvolvido para fins acadêmicos sob as diretrizes institucionais da UniFacens. Todos os direitos reservados © 2026 UPX Hub.

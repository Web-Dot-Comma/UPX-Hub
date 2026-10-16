# UPX Hub 🚀

> Plataforma web acadêmica centralizada desenvolvida por estudantes de Engenharia da Computação da **UniFacens** (Sorocaba) para exibir, cadastrar e gerenciar projetos da UPX (Usina de Projetos Esperimentais).

---

## Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura e Estrutura de Arquivos](#arquitetura-e-estrutura-de-arquivos)
- [Banco de Dados e Autenticação (Supabase)](#banco-de-dados-e-autenticação-supabase
- [Autores e Contribuintes](#autores-e-contribuintes)
- [Licença](#licença)
---

## Sobre o Projeto

O **UPX Hub** é uma plataforma moderna e interativa criada para dar visibilidade às soluções de engenharia e projetos multidisciplinares desenvolvidos ao longo dos semestres de UPX na UniFacens. O sistema permite que discentes e docentes se autentiquem de forma segura, explorem um catálogo dinâmico de projetos filtrado por cursos e semestres, curtam publicações, interajam via comentários, conheçam a metodologia experimental da instituição e cadastrem novas inovações acadêmicas com suporte a armazenamento em nuvem.

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
├── index.html                   # Página principal e catálogo de projetos
├── style.css                    # Estilos globais da aplicação
├── script.js                    # Script principal e controle da home
├── supabase-client.js           # Configuração e inicialização do cliente Supabase
├── img/                         # Repositório de mídias (favicons e fotos dos membros)
│   ├── favicon.png
│   ├── logo-dot-comma.webp
│   ├── Ana.jpg
│   ├── Erica.jpg
│   ├── Erick.jpg
│   ├── Fred.jpg
│   └── Isadora.jpg
├── Conheca-Page/                # Módulo institucional da metodologia UPX
│   ├── conheca.html
│   └── conheca.css
├── Grupo-Page/                  # Página de apresentação do grupo desenvolvedor
│   ├── grupo.html
│   └── grupo.css
├── Cadastro-Page/               # Módulo de cadastro multi-etapas de projetos
│   ├── cadastro.html
│   ├── cadastro.css
│   └── cadastro.js
├── Login-Page/                  # Módulo de autenticação e gestão de usuários
│   ├── login.html
│   ├── login.css
│   └── login.js
└── Projects-Page/               # Módulo visualizador de detalhes do projeto
    ├── projects.html
    ├── projects.css
    └── projects.js

Autores e Contribuintes
Desenvolvido com dedicação por estudantes de Engenharia da Computação da UniFacens (2026):

Isadora Fioravante (R.A: 264384)

Ana Kilciauskas (R.A: 263427)

Erica Yuying (R.A: 264238)

Erick Ruibin (R.A: 264239)

Frederico Rodrigues (R.A: 264182)

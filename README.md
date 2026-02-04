# 🏋️‍♂️ GYM-PRO: Plataforma SaaS de Gestão de Treinos

**GYM-PRO** é uma plataforma SaaS (Software as a Service) completa e profissional, desenvolvida para Personal Trainers e Academias que buscam excelência na gestão de treinos e acompanhamento de alunos.

O sistema oferece uma experiência **Premium** com design moderno focado em usabilidade extrema, utilizando tecnologias de ponta para garantir rapidez, segurança e acessibilidade total em qualquer dispositivo.


## ✨ Funcionalidades Principais

### 🎯 Para Personal Trainers (Admin)

- **📊 Dashboard Completo**
  - Gestão total da base de alunos
  - Visualização de estatísticas e métricas
  - Indicadores de engajamento e atividade

- **� Criador de Treinos Inteligente**
  - Editor visual por dia da semana
  - Detecção automática do dia atual
  - Biblioteca de exercícios integrada com busca e filtros
  - Suporte a vídeos (YouTube) e imagens demonstrativas
  - Campos personalizáveis: séries, repetições, descanso, carga

- **📚 Biblioteca de Exercícios**
  - Cadastro ilimitado de exercícios
  - Categorização por grupo muscular
  - Busca inteligente e filtros avançados
  - Importação rápida para treinos
  - Suporte a mídia (fotos e vídeos)

- **👥 Gestão de Alunos**
  - Cadastro completo com dados pessoais
  - Histórico de treinos e evolução
  - Sistema de ofensiva (streak) de dias consecutivos
  - Controle de vencimento de mensalidade

### 📱 Para Alunos (Mobile First)

- **🗓️ Treinos Organizados**
  - Visualização por dias da semana
  - Interface intuitiva e responsiva
  - Acesso offline aos treinos salvos

- **⏱️ Cronômetro Inteligente**
  - Timer de descanso integrado por exercício
  - Controles de play/pause/reset
  - Notificações visuais

- **✅ Sistema de Progresso**
  - Check-list de exercícios concluídos
  - Troféu de conclusão diária
  - Indicadores visuais de progresso
  - Calendário de histórico de treinos

- **🔥 Gamificação**
  - Sistema de ofensiva (dias consecutivos)
  - Contador de streak atual e recorde
  - Motivação visual com ícones e cores

---

## 🛠️ Stack Tecnológica

Arquitetura moderna e escalável, sem dependências pesadas:

### Frontend
- **HTML5 Semântico** - Estrutura acessível e otimizada para SEO
- **CSS3 Modular** - Design system com variáveis CSS e componentes reutilizáveis
- **JavaScript ES6+** - Código modular e performático
- **Bootstrap 5** - Framework CSS para responsividade
- **Bootstrap Icons** - Biblioteca de ícones moderna

### Backend & Infraestrutura
- **Firebase Authentication** - Sistema de autenticação seguro
- **Cloud Firestore** - Banco de dados NoSQL em tempo real
- **Modular SDK v9** - Performance otimizada e tree-shaking

### Design & UX
- **Google Fonts** - Tipografia premium (Outfit & Inter)
- **Glassmorphism** - Efeitos visuais modernos
- **Mobile First** - Responsividade total
- **Dark Mode Ready** - Preparado para tema escuro

---

## 🚀 Como Usar

### Acesso Rápido
Acesse a versão live: [https://matheusmontev.github.io/GYM-PROJECT/](https://matheusmontev.github.io/GYM-PROJECT/)

---

## 📖 Documentação

### Guias Disponíveis
- **[Lógica de Ofensiva (Streak)](LOGICA_OFENSIVA.md)** - Sistema de dias consecutivos
- **[Roadmap de Desenvolvimento](ROADMAP.md)** - Funcionalidades planejadas

### Estrutura do Projeto
```
GYM-PROJECT/
├── index.html              # Página de login
├── telas/                  # Páginas da aplicação
│   ├── dashboard.html      # Painel do treinador
│   ├── student.html        # Interface do aluno
│   ├── exercicios.html     # Biblioteca de exercícios
│   ├── editar-treino.html  # Editor de treinos
│   └── novo-exercicio.html # Cadastro de exercícios
├── js/                     # Scripts JavaScript
│   ├── app_global.js       # Configuração Firebase
│   ├── dashboard.js        # Lógica do dashboard
│   ├── student.js          # Lógica do aluno
│   ├── exercicios.js       # Biblioteca de exercícios
│   └── editar-treino.js    # Editor de treinos
├── css/                    # Estilos
│   ├── style.css           # Estilos globais
│   └── modules/            # Módulos CSS
└── img/                    # Imagens e assets
```

---

## 🎯 Status do Projeto

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticação completo
- [x] Dashboard do treinador
- [x] Interface do aluno
- [x] Criador de treinos por dia da semana
- [x] Biblioteca de exercícios com CRUD completo
- [x] Sistema de cronômetro de descanso
- [x] Check-list de exercícios concluídos
- [x] Sistema de ofensiva (streak)
- [x] Calendário de histórico
- [x] Troféu de conclusão diária
- [x] Gestão de alunos
- [x] Design responsivo (Mobile First)
- [x] Integração com Firebase

### 🚧 Em Desenvolvimento
- [ ] Modo escuro (Dark Mode)
- [ ] Sistema de registro de carga/peso
- [ ] Notificações push
- [ ] Exportação de relatórios em PDF

Consulte o **[ROADMAP.md](ROADMAP.md)** para ver todas as funcionalidades planejadas.

---

## 🔒 Segurança

- ✅ Autenticação via Firebase Authentication
- ✅ Regras de segurança no Firestore
- ✅ Validação de dados no cliente e servidor
- ✅ Isolamento de dados por treinador
- ✅ Proteção contra acesso não autorizado

## 👨‍💻 Autor

**Matheus Montev**

- GitHub: [@matheusmontev](https://github.com/matheusmontev)
- LinkedIn: [Matheus Montev](https://www.linkedin.com/in/matheusmontev-silva-8a06a3317/)

---

**Desenvolvido para transformar a gestão de treinos em uma experiência tecnológica de elite.** 💪
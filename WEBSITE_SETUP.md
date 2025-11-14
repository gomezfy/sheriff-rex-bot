# Configuração do Website Sheriff Rex

## ✅ Website Criado com Sucesso!

O painel de controle do Sheriff Rex está rodando na porta 5000 com as seguintes funcionalidades:

### 🎨 Recursos do Website

1. **Página Principal (Landing Page)**
   - Apresentação do bot com tema western
   - Listagem de recursos principais
   - Comandos populares
   - Botão para adicionar o bot ao Discord
   - Botão para acessar o painel de controle

2. **Sistema de Autenticação OAuth2**
   - Login com Discord
   - Sessões seguras
   - Acesso a informações do usuário e servidores

3. **Dashboard (Painel de Controle)**
   - Visão geral com estatísticas do bot
   - Lista de servidores do usuário
   - Informações detalhadas de comandos
   - Configurações do bot

## 🔧 Configuração Necessária no Discord Developer Portal

Para que o login funcione corretamente, você precisa adicionar o Redirect URI no Discord Developer Portal:

### Passo a Passo:

1. Acesse: https://discord.com/developers/applications

2. Selecione sua aplicação (Sheriff Rex)

3. Vá para **OAuth2** → **General**

4. Na seção **Redirects**, clique em **Add Redirect**

5. Adicione esta URL:
   ```
   https://70659e71-bfb8-4b9e-a43d-614123b5c1ba-00-1rrn6dqceoysk.spock.replit.dev/callback
   ```

6. Clique em **Save Changes**

## 📊 Estrutura do Projeto

```
website/
├── server.js              # Servidor Express com rotas OAuth2
├── public/
│   ├── css/
│   │   ├── style.css      # Estilos da landing page
│   │   └── dashboard.css  # Estilos do dashboard
│   └── js/
│       └── dashboard.js   # JavaScript do painel
└── views/
    ├── index.html         # Página principal
    └── dashboard.html     # Painel de controle
```

## 🚀 Como Usar

### Acessar o Website
O website está rodando automaticamente no workflow "website" na porta 5000.

### Rotas Disponíveis

- `/` - Página principal
- `/login` - Inicia o processo de autenticação OAuth2
- `/callback` - Callback do Discord OAuth2
- `/dashboard` - Painel de controle (requer login)
- `/api/user` - Informações do usuário logado
- `/api/stats` - Estatísticas do bot
- `/api/invite-url` - URL de convite do bot
- `/logout` - Fazer logout

## 🎯 Funcionalidades do Dashboard

1. **Visão Geral**
   - Número de servidores
   - Número de usuários
   - Total de comandos
   - Uptime do bot

2. **Servidores**
   - Lista de todos os servidores Discord do usuário
   - Ícones e informações de cada servidor

3. **Comandos**
   - Listagem organizada por categoria
   - Descrição de cada comando

4. **Configurações**
   - Informações do bot
   - Links úteis

## 🔐 Variáveis de Ambiente Configuradas

- `DISCORD_CLIENT_ID` - ID da aplicação Discord
- `DISCORD_CLIENT_SECRET` - Secret da aplicação Discord
- `DISCORD_TOKEN` - Token do bot
- `REPLIT_DEV_DOMAIN` - Domínio automático do Replit

## 🎨 Tema Visual

O website utiliza um tema western com:
- Cores principais: Dourado (#d4a574) e marrom (#8b6f47)
- Fundo escuro para melhor contraste
- Ícones de emoji temáticos (🤠)
- Design responsivo para mobile e desktop

## 📝 Próximos Passos

Após adicionar o Redirect URI no Discord Developer Portal:

1. Teste o login clicando em "Login com Discord"
2. Autorize a aplicação
3. Explore o dashboard com suas estatísticas
4. Use o botão "Adicionar ao Discord" para convidar o bot

## 🐛 Troubleshooting

**Erro ao fazer login?**
- Verifique se adicionou o Redirect URI correto no Discord Developer Portal
- Confirme que o DISCORD_CLIENT_SECRET está configurado corretamente

**Dashboard não carrega estatísticas?**
- Verifique se o bot Discord está online
- Confirme que os dados do bot estão sendo salvos corretamente

## 🤝 Suporte

O website está totalmente integrado com o bot Sheriff Rex e compartilha as mesmas credenciais e dados!

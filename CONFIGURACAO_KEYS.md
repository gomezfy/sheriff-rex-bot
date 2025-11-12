# 🔑 Guia de Configuração de API Keys - Sheriff Rex Bot

## 📋 Visão Geral

Este guia explica como configurar todas as chaves de API (secrets) necessárias para o Sheriff Rex Bot funcionar corretamente no Replit.

---

## ✅ Chaves Obrigatórias (Já Configuradas)

### 1. DISCORD_TOKEN
**Status**: ✅ Configurado  
**Descrição**: Token de autenticação do bot Discord  
**Como obter**:
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecione sua aplicação
3. Vá em **Bot** → **Reset Token** ou **Copy**
4. ⚠️ Guarde com segurança - não será mostrado novamente!

### 2. DISCORD_CLIENT_ID
**Status**: ✅ Configurado  
**Descrição**: ID da aplicação Discord  
**Como obter**:
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecione sua aplicação
3. Vá em **General Information**
4. Copie o **Application ID**

### 3. SESSION_SECRET
**Status**: ✅ Configurado  
**Descrição**: Secret para gerenciamento de sessões web  
**Nota**: Já está configurado nos Secrets do Replit

---

## 🔧 Chaves Opcionais (Para Recursos Adicionais)

### 4. OPENROUTER_API_KEY
**Status**: ⚠️ Não configurado  
**Descrição**: Chave para funcionalidades de AI (comandos `/ai` e `/models`)  
**Como obter**:
1. Acesse [OpenRouter](https://openrouter.ai/keys)
2. Crie uma conta ou faça login
3. Gere uma nova API key
4. Adicione aos Secrets do Replit

**Comandos habilitados**:
- `/ai` - Chat com assistente AI
- `/models` - Listar modelos de AI disponíveis

### 5. OWNER_ID
**Status**: ⚠️ Não configurado  
**Descrição**: Seu Discord User ID para comandos administrativos  
**Como obter**:
1. Ative o Modo Desenvolvedor no Discord (Configurações → Avançado → Modo Desenvolvedor)
2. Clique com botão direito no seu nome de usuário
3. Selecione **Copiar ID**

**Comandos de admin habilitados**:
- `/addgold`, `/addsilver`, `/addtokens`
- `/removegold`
- `/addbackpack`
- Funções administrativas do `/admin`

### 6. DATABASE_URL
**Status**: ⚠️ Não configurado (usando armazenamento JSON)  
**Descrição**: URL de conexão PostgreSQL (opcional)  
**Nota**: O bot atualmente usa arquivos JSON para armazenamento. Configure apenas se quiser usar PostgreSQL com Drizzle ORM.

**Formato**: `postgresql://user:password@host:port/database`

### 7. STRIPE_SECRET_KEY
**Status**: ⚠️ Não configurado  
**Descrição**: Chave para integração com Stripe (pagamentos)  
**Como obter**:
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers** → **API keys**
3. Copie a **Secret key**

### 8. Linked Roles (OAuth2)
**Status**: ⚠️ Não configurado  
**Descrição**: Para funcionalidade de Linked Roles do Discord  

**Chaves necessárias**:
- `DISCORD_CLIENT_SECRET` - Secret da aplicação Discord
- `DISCORD_REDIRECT_URI` - URL de callback OAuth2

**Como configurar**:
1. Veja documentação completa em [LINKED_ROLES_SETUP.md](./docs/LINKED_ROLES_SETUP.md)
2. Configure no Discord Developer Portal em **OAuth2**

---

## 🚀 Como Adicionar Secrets no Replit

### Método 1: Através da Interface
1. Clique no ícone de **🔒 Secrets** no menu lateral esquerdo
2. Clique em **New Secret**
3. Adicione o nome da variável (ex: `OPENROUTER_API_KEY`)
4. Cole o valor da chave
5. Clique em **Add Secret**

### Método 2: Através do Arquivo .env (Local)
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as variáveis:
   ```env
   DISCORD_TOKEN=seu_token_aqui
   DISCORD_CLIENT_ID=seu_client_id_aqui
   OPENROUTER_API_KEY=sua_key_aqui
   OWNER_ID=seu_discord_id
   ```
3. ⚠️ **NUNCA** commite o arquivo `.env` para o Git!

---

## 📊 Status Atual das Configurações

### ✅ Funcionando
- **Bot Discord** - Conectado e rodando
- **42 Comandos** - Todos carregados
- **Sistema de Economia** - Ativo
- **Mini Jogos** - Disponíveis
- **Sistema de Mineração** - Funcionando
- **Sistema de Recompensas** - Ativo
- **Backups Automáticos** - Habilitado

### ⚠️ Funcionalidades Desabilitadas (Aguardando Keys)
- **Comandos AI** (`/ai`, `/models`) - Requer `OPENROUTER_API_KEY`
- **Comandos Admin de Economia** - Requer `OWNER_ID`
- **Linked Roles** - Requer `DISCORD_CLIENT_SECRET`
- **Pagamentos Stripe** - Requer `STRIPE_SECRET_KEY`

---

## 🔍 Verificar Configuração

Para verificar quais secrets estão configurados, o bot mostra no log de inicialização:

```
📊 Environment info: {
  hasToken: true,          ✅ DISCORD_TOKEN configurado
  hasClientId: true,       ✅ DISCORD_CLIENT_ID configurado
  hasOwnerId: false,       ⚠️ OWNER_ID não configurado
  hasStripe: false,        ⚠️ STRIPE_SECRET_KEY não configurado
  hasHotmart: false,       ⚠️ HOTMART_CLIENT_ID não configurado
  nodeEnv: 'development'
}
```

Você também verá avisos específicos:
```
⚠️ OpenRouter API key not configured. AI features will not work.
```

---

## 🛡️ Segurança

### ✅ Boas Práticas
- ✅ Secrets armazenados no sistema seguro do Replit
- ✅ Arquivo `.env` está no `.gitignore`
- ✅ Logs não expõem valores de secrets
- ✅ Validação de environment variables no startup

### ⚠️ Importante
- **NUNCA** compartilhe seus tokens ou API keys
- **NUNCA** commite secrets para repositórios públicos
- Regenere tokens se houver suspeita de exposição
- Use secrets diferentes para desenvolvimento e produção

---

## 📚 Documentação Adicional

- **Comandos Completos**: [GUIA_COMANDOS.md](./GUIA_COMANDOS.md)
- **Linked Roles**: [LINKED_ROLES_SETUP.md](./docs/LINKED_ROLES_SETUP.md)
- **README Principal**: [README.md](./README.md)
- **Documentação Projeto**: [replit.md](./replit.md)

---

## 🆘 Suporte

Se tiver problemas com configuração:
1. Verifique os logs do bot no console
2. Abra um issue no [GitHub](https://github.com/gomezfy/Sheriffbot-/issues)

---

**Última atualização**: 05 de Novembro de 2025  
**Bot Version**: 1.0.0  
**Status**: ✅ Bot rodando com sucesso!

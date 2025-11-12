# 🚀 Guia de Push para GitHub - Sheriff Rex Bot

Este guia irá ajudá-lo a fazer push do projeto Sheriff Rex Bot para o GitHub.

## 📋 Preparação Concluída ✅

O projeto já está preparado para Git com:
- ✅ `.gitignore` configurado (protege dados sensíveis)
- ✅ `.env.example` criado (template de configuração)
- ✅ Estrutura de diretórios preservada
- ✅ Arquivos de dados do usuário ignorados

## 🎯 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em **"New Repository"** (ou vá para https://github.com/new)
3. Configure:
   - **Repository name**: `sheriff-rex-bot` (ou nome de sua preferência)
   - **Description**: "Discord bot com tema de faroeste - 44 comandos, economia, mini jogos e moderação"
   - **Visibility**: Private ou Public (recomendo Private por conter bot Discord)
   - ⚠️ **NÃO marque** "Initialize with README" (já temos um README)
4. Clique em **"Create repository"**

### 2. Conectar ao Repositório

Após criar o repositório, o GitHub mostrará instruções. Use o **Shell do Replit** para executar:

```bash
# Adicionar o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/sheriff-rex-bot.git

# Verificar se foi adicionado
git remote -v
```

### 3. Fazer o Commit Inicial

No Shell do Replit, execute:

```bash
# Adicionar todos os arquivos (respeitando .gitignore)
git add .

# Criar o commit inicial
git commit -m "Initial commit: Sheriff Rex Bot - Discord bot completo com 44 comandos"

# Renomear branch para main (se necessário)
git branch -M main
```

### 4. Push para GitHub

```bash
# Fazer push para o GitHub
git push -u origin main
```

### 5. Autenticação (se solicitado)

Se o GitHub pedir autenticação, você tem duas opções:

#### Opção A: Personal Access Token (Recomendado)
1. Acesse [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Clique em **"Generate new token (classic)"**
3. Configure:
   - **Note**: "Replit Sheriff Rex Bot"
   - **Expiration**: 90 days (ou conforme preferir)
   - **Scopes**: Marque `repo` (acesso completo a repositórios)
4. Clique em **"Generate token"**
5. **Copie o token** (você só verá uma vez!)
6. Use o token como senha quando o Git pedir

#### Opção B: SSH Key
```bash
# Gerar chave SSH (no Shell do Replit)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub
```

Depois adicione a chave em: https://github.com/settings/keys

E altere o remote para SSH:
```bash
git remote set-url origin git@github.com:SEU_USUARIO/sheriff-rex-bot.git
```

## 📝 Comandos Git Úteis

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Ver arquivos ignorados
git status --ignored

# Adicionar arquivos específicos
git add src/commands/economy/daily.ts

# Fazer commit de mudanças
git commit -m "Descrição da mudança"

# Push de mudanças
git push
```

## 🔒 Segurança

### ⚠️ Arquivos Protegidos pelo .gitignore:

Estes arquivos **NÃO serão** enviados ao GitHub:
- ✅ `.env` (suas secrets e tokens)
- ✅ `src/data/*.json` (dados dos usuários do bot)
- ✅ `node_modules/` (dependências)
- ✅ `dist/` (código compilado)
- ✅ Arquivos de backup

### 🔑 Importante:
- **NUNCA** commite o arquivo `.env` com tokens reais
- Use o `.env.example` como referência
- Mantenha o repositório **Private** se tiver dados sensíveis

## 📦 Clonando em Outro Ambiente

Para outras pessoas (ou você em outro computador) usarem o bot:

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/sheriff-rex-bot.git
cd sheriff-rex-bot

# Instalar dependências
npm install

# Copiar e configurar .env
cp .env.example .env
# Editar .env e adicionar seus tokens

# Registrar comandos no Discord
npm run deploy

# Executar bot
npm run dev
```

## 🔄 Workflow de Desenvolvimento

```bash
# 1. Fazer mudanças no código
# 2. Adicionar ao staging
git add .

# 3. Commit com mensagem descritiva
git commit -m "feat: adicionar novo comando /evento"

# 4. Push para GitHub
git push
```

## 📞 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/sheriff-rex-bot.git
```

### Erro: "Authentication failed"
- Use um Personal Access Token em vez da senha
- Certifique-se de ter permissões no repositório

### Erro: "Permission denied (publickey)"
- Configure uma chave SSH (veja Opção B acima)

## ✅ Checklist Final

Antes de fazer push, verifique:
- [ ] Arquivo `.gitignore` está correto
- [ ] Não há tokens ou secrets no código
- [ ] `.env.example` está atualizado
- [ ] README.md está atualizado
- [ ] Código está funcionando localmente
- [ ] Dependências no `package.json` estão corretas

## 🎉 Pronto!

Seu bot agora está no GitHub! 🚀

Você pode:
- ✅ Compartilhar o código com outros
- ✅ Fazer backup automático
- ✅ Colaborar com outros desenvolvedores
- ✅ Usar GitHub Actions para CI/CD
- ✅ Hospedar em serviços como Railway, Heroku, etc.

## 📚 Recursos Úteis

- [Documentação Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/)

---

**Desenvolvido por**: gomezfy  
**Repositório Original**: https://github.com/gomezfy/Sheriffbot-

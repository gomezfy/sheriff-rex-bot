# 📖 Como Usar as Diretrizes no Discord

## 3 Formatos Disponíveis

Criei **3 versões** das diretrizes para você escolher a que melhor se adequa ao seu servidor:

---

## 1️⃣ **Versão Markdown Completa** (`DIRETRIZES_DISCORD.md`)

**Ideal para:** Documentação completa, GitHub, ou sites externos

**Como usar:**
- Copie o conteúdo do arquivo `DIRETRIZES_DISCORD.md`
- Cole em um site/wiki/documentação externa
- Ótima para referência completa

---

## 2️⃣ **Versão Formatada para Discord** (`DIRETRIZES_DISCORD_FORMATTED.txt`)

**Ideal para:** Mensagem de texto direta no Discord

**Como usar:**
1. Abra o arquivo `DIRETRIZES_DISCORD_FORMATTED.txt`
2. Copie todo o conteúdo
3. Cole diretamente em um canal do Discord
4. O Discord vai formatar automaticamente com bold, code blocks, etc.

**Vantagens:**
✅ Rápido e fácil
✅ Não precisa de comandos
✅ Funciona em qualquer canal

**Desvantagens:**
❌ Muito longo (pode precisar dividir em 2-3 mensagens)
❌ Não tem cores ou visual avançado

---

## 3️⃣ **Versão Embed Visual** (`diretrizes-embed.json`) ⭐ RECOMENDADO

**Ideal para:** Canal de regras oficial com visual profissional

**Como usar:**

### Método 1: Usando o Comando `/embedbuilder` do Bot

1. No seu servidor Discord, digite: `/embedbuilder`
2. Clique no botão **"Import"**
3. Copie TODO o conteúdo do arquivo `diretrizes-embed.json`
4. Cole no campo de importação
5. Clique em **"Send"**
6. Escolha o canal onde deseja enviar

### Método 2: Usando Bot Externo (se preferir)

Se você tem outro bot de embeds, use o JSON do arquivo `diretrizes-embed.json` para importar.

**Vantagens:**
✅ Visual profissional e colorido
✅ Organizado em campos
✅ Fácil de ler
✅ Ocupa apenas 1 mensagem
✅ Pode fixar no canal

**Desvantagens:**
❌ Precisa usar um comando de bot

---

## 💡 Recomendação de Uso

### Configuração Ideal:

1. **Canal #diretrizes ou #regras:**
   - Use a **Versão 3 (Embed)** para visual profissional
   - Fixe a mensagem no canal
   - Desative permissão de envio para membros

2. **Mensagem de Boas-Vindas:**
   - Configure com `/welcome`
   - Mencione "Leia #diretrizes antes de usar o bot"

3. **Documentação Externa (opcional):**
   - Use **Versão 1 (Markdown)** em um site/wiki
   - Link no canal #diretrizes

---

## 🎨 Personalizando as Diretrizes

### Cores do Embed

Para mudar a cor do embed, edite o arquivo `diretrizes-embed.json`:

```json
"color": "#D4AF37"  // Atual: Dourado (tema western)
```

**Sugestões de cores:**
- `#FFD700` - Ouro brilhante
- `#8B4513` - Marrom couro
- `#DC143C` - Vermelho intenso
- `#00FF00` - Verde
- `#1E90FF` - Azul

### Adicionando/Removendo Seções

Você pode editar os arquivos para:
- Adicionar regras específicas do seu servidor
- Remover comandos que você desabilitou
- Adicionar links para outros canais
- Incluir informações de contato da staff

---

## 📝 Exemplo de Uso com `/embedbuilder`

### Passo a Passo Detalhado:

1. **Abra o Discord** e vá para seu servidor

2. **Digite o comando:**
   ```
   /embedbuilder
   ```

3. **Na interface do bot:**
   - Clique em **"Import"** (botão de importar)

4. **Abra o arquivo:**
   - `diretrizes-embed.json`
   - Selecione TUDO (Ctrl+A ou Cmd+A)
   - Copie (Ctrl+C ou Cmd+C)

5. **Cole o JSON:**
   - Cole no modal que apareceu
   - Confirme

6. **Visualize:**
   - O embed vai aparecer como prévia
   - Verifique se está tudo correto

7. **Envie:**
   - Clique em **"Send"**
   - Escolha o canal (ex: #diretrizes)
   - Confirme

8. **Fixe a mensagem:**
   - Clique com botão direito na mensagem
   - "Fixar mensagem"

---

## ✅ Checklist de Implementação

- [ ] Escolhi qual versão usar (recomendo a 3)
- [ ] Criei canal #diretrizes ou #regras
- [ ] Enviei as diretrizes no canal
- [ ] Fixei a mensagem
- [ ] Configurei permissões (apenas leitura)
- [ ] Atualizei mensagem de boas-vindas
- [ ] Testei se está tudo legível
- [ ] Informei os membros sobre as novas diretrizes

---

## 🆘 Problemas Comuns

### "O embed não aparece"
- Verifique se o JSON está correto (sem erros de sintaxe)
- Use um validador JSON online
- Tente copiar o arquivo novamente

### "Mensagem muito longa"
Se usar a versão texto formatada:
- Divida em 2-3 mensagens
- Ou use a versão embed (recomendado)

### "Quero personalizar mais"
- Edite os arquivos .md, .txt ou .json
- Adicione suas próprias regras
- Mude cores e formatação

---

## 📞 Suporte

Se tiver dúvidas sobre como usar as diretrizes:
1. Leia este guia completamente
2. Teste com a versão texto primeiro
3. Depois experimente a versão embed
4. Personalize conforme necessário

**Dica:** Use a versão embed para canal oficial, e a versão texto para avisos rápidos ou DMs!

---

Bom uso! 🤠🌵

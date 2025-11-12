# 🤠 Comandos Disponíveis - Sheriff Rex Bot

## Total: 44 Comandos

---

## 🤖 AI (2 comandos)
1. **`/ai`** - Conversar com Sheriff Rex AI
   - Parâmetros: `prompt` (obrigatório), `model` (opcional)
   - Descrição: Chat com assistente AI temático de velho oeste
   - Arquivo: `src/commands/ai/ai.ts`

2. **`/models`** - Listar modelos de AI disponíveis
   - Descrição: Ver todos os modelos OpenRouter disponíveis
   - Arquivo: `src/commands/ai/models.ts`

---

## ⚙️ Admin/Moderação (12 comandos)
3. **`/addreward`** - Adicionar recompensa por nível
   - Arquivo: `src/commands/admin/addreward.ts`

4. **`/admin`** - Painel de comandos administrativos
   - Arquivo: `src/commands/admin/admin.ts`

5. **`/clear`** - Limpar mensagens do canal
   - Arquivo: `src/commands/admin/clear.ts`

6. **`/clearwarns`** - Limpar avisos de um usuário
   - Arquivo: `src/commands/admin/clearwarns.ts`

7. **`/criaservidor`** - Criar canais e cargos automaticamente com IA
   - Descrição: Usa IA para gerar estrutura completa de servidor
   - Arquivo: `src/commands/admin/criaservidor.ts`

8. **`/embedbuilder`** - Construtor de embeds personalizados
   - Arquivo: `src/commands/admin/embedbuilder.ts`

9. **`/mute`** - Silenciar usuário
   - Arquivo: `src/commands/admin/mute.ts`

10. **`/setlogs`** - Configurar canal de logs
    - Arquivo: `src/commands/admin/setlogs.ts`

11. **`/unmute`** - Remover silenciamento
    - Arquivo: `src/commands/admin/unmute.ts`

12. **`/warn`** - Avisar usuário
    - Arquivo: `src/commands/admin/warn.ts`

13. **`/warnings`** - Ver avisos de um usuário
    - Arquivo: `src/commands/admin/warnings.ts`

14. **`/welcome`** - Configurar mensagens de boas-vindas
    - Arquivo: `src/commands/admin/welcome.ts`

---

## 🔫 Recompensas/Bounty (4 comandos)
15. **`/wanted`** - Colocar recompensa em alguém
    - Arquivo: `src/commands/bounty/wanted.ts`

16. **`/bounties`** - Ver recompensas ativas
    - Arquivo: `src/commands/bounty/bounties.ts`

17. **`/capture`** - Capturar procurado
    - Arquivo: `src/commands/bounty/capture.ts`

18. **`/clearbounty`** - Limpar recompensa
    - Arquivo: `src/commands/bounty/clearbounty.ts`

---

## 💰 Economia (14 comandos)
19. **`/daily`** - Recompensa diária
    - Arquivo: `src/commands/economy/daily.ts`

20. **`/expedition`** - Expedição ao deserto
    - Duração: 3h ou 10h (solo/grupo)
    - Custo: 12-30 seals dependendo do tipo
    - Recompensas: prata, ouro, wheat, honey, XP
    - Arquivo: `src/commands/economy/expedition.ts`

21. **`/give`** - Transferir moedas/itens
    - Arquivo: `src/commands/economy/give.ts`

22. **`/leaderboard`** - Top 10 jogadores
    - Arquivo: `src/commands/economy/leaderboard.ts`

23. **`/territories`** - Sistema de territórios
    - Arquivo: `src/commands/economy/territories.ts`

24. **`/middleman`** - Sistema de intermediário seguro
    - Arquivo: `src/commands/economy/middleman.ts`

25. **`/redeem`** - Resgatar códigos
    - Arquivo: `src/commands/economy/redeem.ts`

26. **`/addbackpack`** - Adicionar upgrade de mochila (Admin)
    - Arquivo: `src/commands/economy/addbackpack.ts`

27. **`/addgold`** - Adicionar ouro (Admin)
    - Arquivo: `src/commands/economy/addgold.ts`

28. **`/addseal`** - Adicionar selos (Admin)
    - Arquivo: `src/commands/economy/addseal.ts`

29. **`/addsilver`** - Adicionar prata (Admin)
    - Arquivo: `src/commands/economy/addsilver.ts`

30. **`/addtokens`** - Adicionar tokens (Admin)
    - Arquivo: `src/commands/economy/addtokens.ts`

31. **`/removegold`** - Remover ouro (Admin)
    - Arquivo: `src/commands/economy/removegold.ts`

32. **`/setuptoken`** - Configurar sistema de tokens (Admin)
    - Arquivo: `src/commands/economy/setuptoken.ts`

---

## 🎰 Jogos/Gambling (4 comandos)
33. **`/dice`** - Duelo de dados PvP
    - Parâmetros: `opponent`, `bet`, `guess` (2-12)
    - Aposta mínima: 10 tokens
    - Cooldown: 10 segundos
    - Arquivo: `src/commands/gambling/dice.ts`

34. **`/bankrob`** - Assalto ao banco cooperativo
    - Parâmetros: `partner`
    - Modo cooperativo (2 jogadores)
    - Sistema de punição por falha
    - Arquivo: `src/commands/gambling/bankrob.ts`

35. **`/duel`** - Duelo PvP com apostas
    - Arquivo: `src/commands/gambling/duel.ts`

36. **`/roulette`** - Roleta de cassino
    - Arquivo: `src/commands/gambling/roulette.ts`

---

## 🏰 Guilda (1 comando)
37. **`/guilda`** - Sistema de guildas
    - Arquivo: `src/commands/guild/guilda.ts`

---

## ⛏️ Mineração (1 comando)
38. **`/mine`** - Minerar ouro
    - Modos: Solo (90 min) ou Cooperativo (30 min)
    - Sistema de coleta de barras de ouro
    - Sistema de mochila: 100kg → 500kg
    - Boost de 50% para donos de Gold Mine Shares
    - Arquivo: `src/commands/mining/mine.ts`

---

## 👤 Perfil (2 comandos)
39. **`/profile`** - Ver perfil com estatísticas
    - Arquivo: `src/commands/profile/profile.ts`

40. **`/inventory`** - Ver inventário completo
    - Arquivo: `src/commands/profile/inventory.ts`

---

## 🔧 Utilidades (3 comandos)
41. **`/help`** - Menu de ajuda
    - Arquivo: `src/commands/utility/help.ts`

42. **`/ping`** - Ver latência do bot
    - Arquivo: `src/commands/utility/ping.ts`

43. **`/poll`** - Criar enquete
    - Arquivo: `src/commands/utility/poll.ts`

---

## 📋 Resumo por Categoria

| Categoria | Quantidade | Descrição |
|-----------|-----------|-----------|
| 🤖 AI | 2 | Assistente AI e modelos |
| ⚙️ Admin | 12 | Moderação e configuração |
| 🔫 Bounty | 4 | Sistema de recompensas |
| 💰 Economia | 14 | Sistema econômico completo |
| 🎰 Jogos | 4 | Mini jogos e apostas |
| 🏰 Guilda | 1 | Sistema de guildas |
| ⛏️ Mineração | 1 | Sistema de mineração |
| 👤 Perfil | 2 | Perfis e inventário |
| 🔧 Utilidades | 3 | Ferramentas gerais |
| **TOTAL** | **44** | |

---

## 🎯 Comandos Mais Complexos (Candidatos para Correção)

### 1. `/expedition` - Sistema mais elaborado
- Múltiplos modos (3h, 10h solo, 10h grupo)
- Sistema de party com múltiplos jogadores
- Recompensas variadas e complexas
- DM notifications
- **~918 linhas de código**

### 2. `/mine` - Sistema de mineração completo
- Modo solo e cooperativo
- Sistema de mochila e upgrades
- Tracker de sessões ativas
- Boosts de territórios
- **~775 linhas de código**

### 3. `/bankrob` - Assalto cooperativo
- Sistema de parceiros
- Mecânica de timing
- Sistema de punição
- Auto-wanted ao falhar
- **~581 linhas de código**

### 4. `/dice` - Jogo PvP com apostas
- Sistema de desafios
- Apostas e transferências
- Cooldowns e validações
- **~396 linhas de código**

### 5. `/criaservidor` - IA para criar servidor
- Integração com OpenRouter
- Criação automática de canais
- Sistema de permissões
- Validação complexa

---

## ⚠️ Comandos que Precisam de Secrets

Para executar o bot, você precisará configurar:
- `DISCORD_TOKEN` - Token do bot
- `DISCORD_CLIENT_ID` ou `CLIENT_ID` - ID da aplicação
- `OPENROUTER_API_KEY` - Para comandos de AI (opcional)

---

## 📝 Qual Comando Você Deseja Modificar?

Agora que você tem a lista completa de comandos, **qual comando você gostaria de corrigir ou modificar?**

Você pode escolher qualquer um dos 44 comandos listados acima!

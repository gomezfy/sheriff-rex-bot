# ComponentRegistry Integration - Sheriff Bot

## ✅ Status: INTEGRATED

O ComponentRegistry foi **integrado com sucesso** no fluxo de interações do bot, permitindo migração gradual dos handlers de botões e select menus.

## 🔧 Como Funciona

### Fluxo de Execução (interactionCreate.ts)

```typescript
if (interaction.isButton()) {
  // 1. Tenta processar com ComponentRegistry primeiro
  const handled = await componentRegistry.handleButton(interaction);
  if (handled) {
    return; // Handler encontrado e executado ✅
  }

  // 2. Se não encontrar, cai nos handlers legados (if-else chains)
  if (interaction.customId === "edit_bio") {
    // código legado...
  }
}
```

**Benefícios desta abordagem:**
- ✅ Migração gradual sem quebrar funcionalidade existente
- ✅ Handlers novos podem usar o registry
- ✅ Handlers antigos continuam funcionando
- ✅ Permite testar handlers migrados antes de remover código legado

## 📁 Estrutura de Arquivos

```
src/
├── interactions/
│   ├── ComponentRegistry.ts        # Sistema de registro
│   └── index.ts                    # Export
├── events/
│   ├── interactionCreate.ts        # INTEGRADO ✅
│   └── interaction-handlers/
│       ├── registerHandlers.ts     # Registro central
│       ├── buttons/
│       │   ├── profileHandlers.ts  # Exemplos criados
│       │   └── shopHandlers.ts
│       ├── selectMenus/
│       └── modals/
```

## 📝 Como Migrar um Handler

### Passo 1: Extrair Handler

Crie arquivo em `src/events/interaction-handlers/buttons/` ou `selectMenus/`:

```typescript
// src/events/interaction-handlers/buttons/profileHandlers.ts
import { ButtonInteraction } from 'discord.js';

export async function handleEditBio(
  interaction: ButtonInteraction
): Promise<void> {
  // Lógica do handler
  const modal = new ModalBuilder()
    .setCustomId('bio_modal')
    .setTitle('Edit Your Bio');
  
  await interaction.showModal(modal);
}
```

### Passo 2: Registrar Handler

Em `src/events/interaction-handlers/registerHandlers.ts`:

```typescript
import { handleEditBio } from './buttons/profileHandlers';

export function registerAllHandlers(): void {
  // Exact match
  componentRegistry.registerButton('edit_bio', handleEditBio);
  
  // Pattern-based
  componentRegistry.registerButton(/^carousel_/, handleCarousel);
}
```

### Passo 3: Chamar no Bot Startup

No event handler `ready.ts` (ou onde o bot inicia):

```typescript
import { registerAllHandlers } from '@/events/interaction-handlers/registerHandlers';

// Quando bot conecta
registerAllHandlers();
```

### Passo 4: Testar e Remover Legacy

1. Teste o handler migrado
2. Se funcionar corretamente, remova o if-else correspondente em `interactionCreate.ts`

## 🎯 Handlers Disponíveis para Migração

### Botões (20+ handlers)

**Exact Match:**
- `edit_bio` - Modal de edição de bio
- `edit_phrase` - Modal de frase
- `change_background` - Select menu de backgrounds
- `shop_backgrounds` - Carousel de backgrounds
- `shop_frames` - Carousel de molduras
- `change_frame` - Select menu de molduras
- `profile_show_public` - Compartilhar perfil
- `warehouse_sell/buy/refresh/back` - Warehouse actions
- `guild_info` - Info da guilda
- `guild_members` - Lista de membros
- `guild_leave` - Sair da guilda

**Pattern-Based:**
- `/^carousel_/` - Navegação de carousel backgrounds
- `/^frame_carousel_/` - Navegação de carousel frames
- `/^buy_bg_/` - Compra de background
- `/^buy_frame_/` - Compra de moldura
- `/^guild_approve_/` - Aprovar membro
- `/^guild_reject_/` - Rejeitar membro
- `/^kick_member_/` - Expulsar membro
- `/^promote_member_/` - Promover membro
- `/^demote_member_/` - Rebaixar membro

### Select Menus (6 handlers)

- `warehouse_sell_select` - Venda no armazém
- `warehouse_buy_select` - Compra no armazém
- `help_category_select` - Categoria de ajuda
- `select_frame` - Selecionar moldura
- `select_background` - Selecionar background
- `guild_member_select` - Selecionar membro

### Modals (3 handlers)

- `bio_modal` - Salvar bio
- `phrase_modal` - Salvar frase
- `guild_create_modal_new` - Criar guilda

## 🔍 Handlers Ignorados

Estes NÃO devem ser migrados (processados por collectors de comandos):

- `duel_*` - Duelo
- `mine_*` - Mineração
- `join_mining_*` - Mining cooperativo
- `claim_mining_*` - Claim mining
- `expedition_*` - Expedições

## ✨ Exemplos de Pattern-Based

### Carousel Navigation

```typescript
async function handleCarousel(interaction: ButtonInteraction): Promise<void> {
  const [_, action, index] = interaction.customId.split('_');
  const newIndex = action === 'next' 
    ? parseInt(index) + 1 
    : parseInt(index) - 1;
  
  await showBackgroundCarousel(interaction, newIndex, true);
}

componentRegistry.registerButton(/^carousel_/, handleCarousel);
```

### Guild Actions

```typescript
async function handleGuildApprove(interaction: ButtonInteraction): Promise<void> {
  const requestId = interaction.customId.split('_')[2];
  // Processar aprovação...
}

componentRegistry.registerButton(/^guild_approve_/, handleGuildApprove);
```

## 📊 Progresso de Migração

**Status Atual:**
- ✅ ComponentRegistry criado
- ✅ Integrado no interactionCreate.ts
- ✅ Estrutura de diretórios criada
- ✅ Exemplos de handlers criados
- ✅ Sistema de registro documentado
- ⏳ 0 handlers ativamente registrados (migração pendente)

**Próximos Passos:**
1. Extrair e registrar handlers de perfil (4-5 handlers)
2. Extrair e registrar handlers de guilda (5+ handlers)
3. Extrair e registrar handlers de carousel (4+ handlers)
4. Extrair e registrar handlers de warehouse (4 handlers)
5. Remover código legado gradualmente

## 🎯 Benefícios Finais

Quando a migração estiver completa:

1. **Código mais limpo**: Sem if-else chains enormes
2. **Manutenção fácil**: Um arquivo por handler
3. **Testável**: Handlers isolados e testáveis
4. **Extensível**: Adicionar novos handlers é trivial
5. **Pattern-based**: Handlers dinâmicos com regex

## 📝 Notas

- A migração pode ser feita aos poucos (incremental)
- Código legado continua funcionando enquanto migra
- Não há urgência - pode fazer quando for conveniente
- Sistema está pronto e funcionando ✅

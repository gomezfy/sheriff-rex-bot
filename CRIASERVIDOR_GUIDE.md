# 🏗️ /criaservidor - Guia Completo

## O Que É?

O comando `/criaservidor` usa **Inteligência Artificial** para interpretar suas descrições em linguagem natural e criar automaticamente uma estrutura completa de servidor Discord, incluindo:
- 🎭 **Cargos personalizados**
- 📁 **Categorias organizadas**
- 💬 **Canais de texto, voz e anúncios**

## Como Usar

### Comando Básico
```
/criaservidor descricao: [descreva o que você quer]
```

### ⚠️ Requisitos
- **Permissão:** Administrador do servidor
- **API:** Requer OPENROUTER_API_KEY configurada
- **Bot:** Precisa de permissões para gerenciar canais e cargos

---

## 📝 Exemplos de Uso

### 1. Servidor de Gaming
```
/criaservidor descricao: servidor de jogos com canais de voz e texto
```

**O que a IA cria:**
- **Cargos:** Admin, Moderador, Jogador, VIP
- **Categorias:** 
  - 📋 INFORMAÇÕES (regras, boas-vindas)
  - 🎮 GAMING (chat geral, LFG, voice channels)
  - 💬 SOCIAL (off-topic, memes)

### 2. Servidor de RPG
```
/criaservidor descricao: servidor de RPG de mesa com sistema de fichas
```

**O que a IA cria:**
- **Cargos:** Mestre, Jogador, Narrador
- **Categorias:**
  - 📚 REGRAS E INFO
  - 🎲 MESAS DE JOGO (sessões, fichas, dados)
  - 🗺️ WORLD BUILDING

### 3. Comunidade de Estudo
```
/criaservidor descricao: servidor de estudos com canais por matéria
```

**O que a IA cria:**
- **Cargos:** Professor, Monitor, Estudante
- **Categorias:**
  - 📖 ADMINISTRAÇÃO
  - 🔬 EXATAS (matemática, física, química)
  - 📚 HUMANAS (história, português)
  - 🎯 FOCO (pomodoro, metas)

### 4. Servidor Empresarial
```
/criaservidor descricao: servidor corporativo para equipe de desenvolvimento
```

**O que a IA cria:**
- **Cargos:** CEO, Tech Lead, Developer, Designer
- **Categorias:**
  - 💼 GERAL (anúncios, regras)
  - 👨‍💻 DESENVOLVIMENTO (frontend, backend, QA)
  - 🎨 DESIGN
  - 📊 GESTÃO

### 5. Comunidade de Streamer
```
/criaservidor descricao: servidor para comunidade de streamer com sistema de VIP
```

**O que a IA cria:**
- **Cargos:** Streamer, Moderador, VIP, Subscriber, Viewer
- **Categorias:**
  - 📢 ANÚNCIOS
  - 💬 CHAT (geral, eventos, memes)
  - 🎬 STREAMS (ao-vivo, clipes, agenda)

---

## 🎯 Dicas para Melhores Resultados

### ✅ Seja Específico
**Bom:** "servidor de minecraft com canais de sobrevivência e criativo"  
**Ruim:** "servidor"

### ✅ Mencione Propósito
**Bom:** "comunidade de arte digital para compartilhar portfólios"  
**Ruim:** "cria canais"

### ✅ Especifique Tipos de Canal
**Bom:** "servidor com 3 canais de voz e canais de texto por jogo"  
**Ruim:** "servidor de jogos"

### ✅ Inclua Hierarquia se Importante
**Bom:** "servidor com cargos de staff: admin, moderador, helper"  
**Ruim:** "servidor com moderação"

---

## 🔧 Como Funciona (Por Trás dos Panos)

1. **Você descreve** o que quer em linguagem natural
2. **Sheriff Rex AI** interpreta seu pedido usando OpenRouter
3. **IA gera JSON** estruturado com cargos, categorias e canais
4. **Bot cria automaticamente** tudo no seu servidor Discord
5. **Você recebe relatório** do que foi criado com sucesso

---

## 📊 Estrutura Gerada pela IA

A IA retorna uma estrutura JSON que o bot executa:

```json
{
  "roles": [
    {
      "name": "Sheriff",
      "color": "#D4AF37",
      "permissions": ["Administrator"],
      "hoist": true
    }
  ],
  "categories": [
    {
      "name": "📋 INFORMATION",
      "channels": [
        {
          "name": "welcome",
          "type": "announcement",
          "topic": "Welcome to the server!"
        },
        {
          "name": "rules",
          "type": "text",
          "topic": "Server rules"
        }
      ]
    }
  ]
}
```

---

## ⚙️ Configurações Automáticas

### Cores dos Cargos
A IA usa cores temáticas do Velho Oeste por padrão:
- 🟡 **Ouro (#D4AF37)** - Cargos de liderança
- 🤎 **Marrom (#8B4513)** - Cargos gerais
- ⚪ **Prata (#C0C0C0)** - Cargos de moderação

### Nomes de Canais
- Sempre em **minúsculas**
- Usa **hífens** no lugar de espaços
- Exemplo: `regras-do-servidor`, `chat-geral`

### Organização
- Emojis nas categorias para fácil identificação
- Canais de informação sempre primeiro
- Canais de voz agrupados logicamente

---

## ❌ Tratamento de Erros

Se algo der errado, você verá:

### Erro de Permissão
```
❌ Bot needs permission to manage channels and roles
```
**Solução:** Dê permissões de administrador ao bot

### Erro de API
```
❌ OpenRouter API is not configured
```
**Solução:** Configure OPENROUTER_API_KEY nas variáveis de ambiente

### Erro de Interpretação
```
❌ AI returned invalid JSON. Please try rephrasing your request.
```
**Solução:** Reformule sua descrição de forma mais clara

---

## 🎨 Personalização Avançada

### Temas Específicos
Você pode pedir temas específicos:

```
/criaservidor descricao: servidor cyberpunk com neon e tecnologia
```

```
/criaservidor descricao: servidor medieval fantasia com guildas
```

```
/criaservidor descricao: servidor minimalista e profissional
```

### Quantidade Controlada
Especifique quantidades:

```
/criaservidor descricao: servidor pequeno com apenas 5 canais essenciais
```

```
/criaservidor descricao: servidor grande com muitos canais temáticos
```

---

## 🚨 Limitações

- **Máximo de caracteres:** 500 na descrição
- **Permissões:** Apenas administradores podem usar
- **Rate Limits:** Respeita limites do Discord API
- **Conflitos:** Se cargo/canal já existe, pode gerar erro

---

## 🔄 Casos de Uso Reais

### 1. Setup Rápido de Servidor Novo
Ao criar um servidor novo, use para estrutura instantânea:
```
/criaservidor descricao: servidor completo de comunidade com sistema de níveis
```

### 2. Expansão de Servidor Existente
Adicione novas seções a servidor existente:
```
/criaservidor descricao: adicione seção de eventos e competições
```

### 3. Reorganização
Crie estrutura alternativa para testar:
```
/criaservidor descricao: estrutura mais organizada para servidor de 1000 membros
```

---

## 📈 Estatísticas do Comando

Após execução, você recebe:
- ✅ Total de cargos criados
- ✅ Total de categorias criadas
- ✅ Total de canais criados
- ⚠️ Lista de erros (se houver)

---

## 🤝 Combinação com Outros Comandos

### Após Criar Estrutura

1. **Configure boas-vindas:**
   ```
   /welcome
   ```

2. **Configure logs de moderação:**
   ```
   /setlogs
   ```

3. **Crie recompensas de nível:**
   ```
   /addreward
   ```

---

## 💡 Dicas Pro

1. **Teste em Servidor de Testes:** Primeiro teste em servidor privado
2. **Backup Antes:** Faça backup manual se servidor já tem estrutura
3. **Seja Claro:** Quanto mais detalhes, melhor o resultado
4. **Iteração:** Pode usar múltiplas vezes para diferentes seções
5. **Revise:** Sempre revise o que foi criado e ajuste manualmente se necessário

---

## 🎯 Exemplos de Descrições Perfeitas

```
/criaservidor descricao: servidor de anime e manga com canais separados por gênero, sistema de spoilers, e voice chat para assistir juntos
```

```
/criaservidor descricao: hub de desenvolvedores com canais de frontend, backend, devops, e sala de pair programming
```

```
/criaservidor descricao: comunidade fitness com canais de treino, nutrição, progress tracking, e accountability partners
```

```
/criaservidor descricao: servidor educacional de programação com canais por linguagem (Python, JavaScript, C++), área de dúvidas, e projetos colaborativos
```

---

## 🆘 Troubleshooting

### Problema: Canais criados com nomes estranhos
**Solução:** A IA interpretou mal. Seja mais específico na próxima vez.

### Problema: Muitos canais criados
**Solução:** Especifique "estrutura simples" ou "apenas o essencial"

### Problema: Poucas categorias
**Solução:** Peça "bem organizado por categorias" na descrição

### Problema: Cores não aplicadas aos cargos
**Solução:** Normal em alguns casos, ajuste manualmente depois

---

## 🌟 Casos de Sucesso

> "Criei um servidor de 50 canais em 30 segundos!" - @User123

> "A IA entendeu perfeitamente minha ideia de servidor temático!" - @Admin456

> "Economizei horas de trabalho manual" - @Mod789

---

**Criado com 🤠 pelo Sheriff Rex AI**

> "Building servers faster than a bullet, partner!" - Sheriff Rex

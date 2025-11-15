# 🛒 Sistema de Loja de RexBucks - Guia Completo

## 📋 Visão Geral

Sistema completo de venda de RexBucks integrado com Mercado Pago, permitindo pagamentos via **PIX** e **Cartão de Crédito**.

## 🎯 Funcionalidades Implementadas

### ✅ Comando `/loja`
- Interface interativa com botões
- Exibição visual com imagem de RexBucks
- Múltiplos pacotes disponíveis
- Informações detalhadas de cada pacote (preço, quantidade, bônus)

### ✅ Integração Mercado Pago
- Geração automática de links de pagamento
- Suporte a PIX (aprovação instantânea)
- Suporte a Cartão de Crédito (até 12x)
- Suporte a Boleto Bancário

### ✅ Sistema de Webhook
- Processamento automático de pagamentos
- Crédito automático de RexBucks após aprovação
- Registro de todas as transações no banco de dados
- Páginas de retorno (sucesso, pendente, falha)

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Adicione no arquivo `.env` ou nos secrets do Replit:

```bash
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_WEBHOOK_URL=https://seu-dominio.replit.app/webhook/mercadopago

# URL de Retorno
REPLIT_DEV_DOMAIN=https://seu-dominio.replit.app
```

### 2. Obter Credenciais do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. **Modo Teste** (para testes):
   - Copie o `Access Token` de teste
3. **Modo Produção** (para uso real):
   - Ative suas credenciais de produção
   - Copie o `Access Token` de produção

### 3. Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Clique em "Criar webhook"
3. Configure:
   - **URL**: `https://seu-dominio.replit.app/webhook/mercadopago`
   - **Eventos**: Selecione "Pagamentos"
4. Salve o webhook

## 📦 Popular Pacotes de RexBucks

Execute o script para criar os pacotes padrão:

```bash
npm run db:seed-packages
```

Ou manualmente via script:

```bash
ts-node -r tsconfig-paths/register scripts/seed-rexbuck-packages.ts
```

### Pacotes Padrão Criados:

| Pacote | Preço | RexBucks | Bônus |
|--------|-------|----------|-------|
| 💵 Pacote Iniciante | R$ 5,00 | 100 | 0 |
| 💰 Pacote Popular | R$ 20,00 | 500 | 50 |
| 💎 Pacote Premium | R$ 35,00 | 1.000 | 150 |
| 👑 Pacote VIP | R$ 75,00 | 2.500 | 500 |
| ⭐ Pacote Ultimate | R$ 120,00 | 5.000 | 1.500 |

## 🚀 Como Usar

### Para Usuários:

1. Digite `/loja` no Discord
2. Visualize os pacotes disponíveis
3. Clique no botão do pacote desejado
4. Aguarde a geração do link de pagamento
5. Clique no botão "💳 Abrir Pagamento"
6. Complete o pagamento no Mercado Pago
7. Receba os RexBucks automaticamente!

### Verificar Saldo:

```
/rexbucks balance
```

### Histórico de Transações:

```
/rexbucks history
```

## 📂 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/commands/economy/loja.ts` - Comando /loja
- `src/utils/mercadoPagoService.ts` - Serviço de integração
- `scripts/seed-rexbuck-packages.ts` - Script para popular pacotes
- `assets/currency/rexbucks-icon.png` - Ícone de RexBucks
- `assets/currency/rexbucks-stack.png` - Imagem de pilha de RexBucks

### Modificados:
- `src/linked-roles-server.ts` - Adicionado webhook e páginas de retorno
- `package.json` - Adicionado mercadopago

### Schema do Banco (já existente):
- `rexBuckPackages` - Tabela de pacotes
- `mercadoPagoPayments` - Tabela de pagamentos
- `rexBuckTransactions` - Tabela de transações

## 🧪 Testando o Sistema

### Modo Teste (Sandbox):

1. Configure o `MERCADOPAGO_ACCESS_TOKEN` com o token de teste
2. Use cartões de teste do Mercado Pago:
   - **Aprovado**: `5031 4332 1540 6351` | CVV: `123` | Validade: `11/25`
   - **Rejeitado**: `5031 7557 3453 0604` | CVV: `123` | Validade: `11/25`
3. Use CPF de teste: `123.456.789-00`

### Verificações:

1. **Comando funcionando**: `/loja` exibe pacotes
2. **Link gerado**: Botão abre página do Mercado Pago
3. **Webhook recebendo**: Verificar logs do servidor
4. **RexBucks creditados**: Verificar com `/rexbucks balance`

## 📊 Logs e Monitoramento

### Logs do Webhook:
```
📥 Mercado Pago Webhook received: { type: 'payment', data: { id: '123456' } }
✅ Payment 123456 processed successfully
💵 RexBucks added: +550 to user 123456789 (0 → 550)
```

### Verificar Pagamentos no Banco:
```sql
SELECT * FROM mercadopago_payments ORDER BY created_at DESC LIMIT 10;
```

### Verificar Transações de RexBucks:
```sql
SELECT * FROM rex_buck_transactions WHERE type = 'purchase' ORDER BY timestamp DESC LIMIT 10;
```

## 🔒 Segurança

- ✅ Webhook valida notificações do Mercado Pago
- ✅ Transações atômicas no banco de dados
- ✅ Idempotência (evita crédito duplicado)
- ✅ Registro completo de todas as transações
- ✅ Status de processamento para evitar duplicatas

## 🛠️ Manutenção

### Adicionar Novo Pacote:

```typescript
await db.insert(rexBuckPackages).values({
  id: crypto.randomBytes(8).toString('hex'),
  name: '🎁 Pacote Especial',
  description: 'Promoção limitada!',
  amountRexBucks: 3000,
  bonusRexBucks: 1000,
  priceCents: 5000, // R$ 50,00
  currency: 'BRL',
  active: true,
  displayOrder: 6,
});
```

### Desativar Pacote:

```typescript
await db.update(rexBuckPackages)
  .set({ active: false })
  .where(eq(rexBuckPackages.id, 'package_id_here'));
```

## 📝 Próximos Passos

- [ ] Deploy dos comandos: `npm run deploy`
- [ ] Configurar webhook de produção no Mercado Pago
- [ ] Testar com pagamento real em modo teste
- [ ] Monitorar primeiros pagamentos
- [ ] Criar sistema de notificação no Discord após pagamento

## ⚠️ Importante

- Sempre use **modo teste** antes de produção
- Mantenha o `MERCADOPAGO_ACCESS_TOKEN` seguro
- Configure o webhook corretamente
- Teste o fluxo completo antes de liberar para usuários
- Monitore os logs de pagamento regularmente

## 🆘 Solução de Problemas

### Webhook não está recebendo notificações:
1. Verifique se a URL do webhook está correta
2. Confirme que o servidor está rodando na porta 5000
3. Verifique se a URL é acessível publicamente
4. Veja os logs no painel do Mercado Pago

### RexBucks não foram creditados:
1. Verifique os logs do webhook
2. Consulte a tabela `mercadopago_payments`
3. Verifique se o pagamento foi aprovado
4. Confirme que `processed = true` após crédito

### Comando /loja não aparece:
1. Execute: `npm run deploy`
2. Aguarde alguns minutos para sincronização
3. Verifique se o bot está online

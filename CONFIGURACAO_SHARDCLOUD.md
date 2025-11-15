# 🌐 Configuração para ShardCloud

## Variáveis de Ambiente Necessárias

Configure estas variáveis no painel do ShardCloud:

### 1. **WEBHOOK_URL** (obrigatório)
A URL base do seu servidor no ShardCloud.

**Exemplo:**
```
WEBHOOK_URL=https://seu-bot.shardcloud.app
```

**Como pegar:**
1. No painel do ShardCloud, procure a URL do seu projeto
2. Geralmente é algo como: `https://seu-bot.shardcloud.app` ou `https://api.seu-bot.com`
3. **NÃO** coloque `/` no final
4. **NÃO** adicione `/webhook/mercadopago` - o código já faz isso automaticamente

### 2. **MERCADOPAGO_ACCESS_TOKEN** (obrigatório)
Seu token de acesso do Mercado Pago.

**Como pegar:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. **Para testes:** Use o "Access Token" de **Teste**
3. **Para produção:** Use o "Access Token" de **Produção**

**Exemplo:**
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890-XXXXXX-XXXXXX-XXXXXX
```

### 3. **DISCORD_TOKEN** (já deve ter)
Token do seu bot no Discord.

### 4. **DATABASE_URL** (já deve ter)
URL do banco de dados PostgreSQL.

---

## 📋 Passo a Passo Completo

### **1. Configure as Variáveis no ShardCloud**

No painel do ShardCloud, adicione:

```env
# URL base do servidor (SEM barra no final)
WEBHOOK_URL=https://seu-bot.shardcloud.app

# Token do Mercado Pago (teste ou produção)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-seu-token-aqui

# As outras que você já deve ter configurado:
DISCORD_TOKEN=seu_token_discord
DISCORD_CLIENT_ID=seu_client_id
DATABASE_URL=postgresql://...
```

### **2. Popular os Pacotes no Banco de Dados**

Execute uma vez para criar os pacotes de RexBucks:

```bash
npm run db:seed-packages
```

### **3. Fazer Deploy dos Comandos**

Para registrar o comando `/loja` no Discord:

```bash
npm run deploy
```

### **4. Configurar Webhook no Mercado Pago**

1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Clique em **"Criar webhook"**
3. Configure:
   - **URL**: `https://seu-bot.shardcloud.app/webhook/mercadopago`
   - **Eventos**: Marque **"Pagamentos"** (Payment)
4. Salve

**⚠️ IMPORTANTE:** A URL deve terminar com `/webhook/mercadopago`

### **5. Reiniciar o Servidor**

Reinicie o bot no ShardCloud para aplicar as configurações.

---

## ✅ Verificar se Está Funcionando

### **1. Testar o Comando**
No Discord, digite:
```
/loja
```

Deve aparecer a lista de pacotes com botões.

### **2. Testar Pagamento (Modo Teste)**

Use um cartão de teste do Mercado Pago:
- **Número:** `5031 4332 1540 6351`
- **CVV:** `123`
- **Validade:** `11/25`
- **Nome:** Qualquer nome
- **CPF:** `123.456.789-00`

### **3. Verificar Logs do Webhook**

Nos logs do ShardCloud, você deve ver:
```
📥 Mercado Pago Webhook received: { type: 'payment', data: { id: '123456' } }
✅ Payment 123456 processed successfully
💵 RexBucks added: +550 to user 123456789
```

### **4. Verificar Saldo**

No Discord:
```
/rexbucks balance
```

Deve mostrar os RexBucks creditados!

---

## 🔍 Solução de Problemas

### **Webhook não está recebendo notificações**

1. ✅ Verifique se `WEBHOOK_URL` está configurado corretamente
2. ✅ Confirme que o servidor está rodando
3. ✅ Teste se a URL está acessível: `https://seu-bot.shardcloud.app/payment/success`
4. ✅ Verifique os logs no painel do Mercado Pago (seção Webhooks)

### **Link de pagamento não é gerado**

1. ✅ Verifique se `MERCADOPAGO_ACCESS_TOKEN` está correto
2. ✅ Certifique-se que os pacotes foram criados (`npm run db:seed-packages`)
3. ✅ Veja os logs do servidor para erros

### **RexBucks não foram creditados**

1. ✅ Verifique se o pagamento foi aprovado no Mercado Pago
2. ✅ Consulte os logs do webhook
3. ✅ Verifique a tabela `mercadopago_payments` no banco:
   ```sql
   SELECT * FROM mercadopago_payments ORDER BY created_at DESC LIMIT 5;
   ```

---

## 🚀 Pronto para Produção

Quando estiver tudo testado e funcionando:

1. ✅ Troque `MERCADOPAGO_ACCESS_TOKEN` para o token de **PRODUÇÃO**
2. ✅ Reconfigure o webhook no Mercado Pago com a URL de produção
3. ✅ Teste com um pagamento real de baixo valor (R$ 5,00)
4. ✅ Monitore os logs de pagamento por alguns dias

---

## 📊 URLs Importantes

### **Seu Bot:**
- 🔗 Base: `https://seu-bot.shardcloud.app`
- 🪝 Webhook: `https://seu-bot.shardcloud.app/webhook/mercadopago`
- ✅ Sucesso: `https://seu-bot.shardcloud.app/payment/success`
- ⏳ Pendente: `https://seu-bot.shardcloud.app/payment/pending`
- ❌ Falha: `https://seu-bot.shardcloud.app/payment/failure`

### **Mercado Pago:**
- 🔑 Credenciais: https://www.mercadopago.com.br/developers/panel/credentials
- 🪝 Webhooks: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
- 📚 Documentação: https://www.mercadopago.com.br/developers/pt/docs

---

## 💡 Dica Final

Sempre use o **modo teste** primeiro! Só vá para produção quando tudo estiver 100% funcionando.

**Boa sorte com a loja! 🤠💰**

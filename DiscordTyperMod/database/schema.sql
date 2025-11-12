-- Schema para o Sheriff Bot PostgreSQL
-- Migração de JSON para PostgreSQL

-- Tabela de usuários (economy + inventory combinados)
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(255) PRIMARY KEY,
  silver BIGINT DEFAULT 0,
  saloon_tokens BIGINT DEFAULT 0,
  inventory_weight DECIMAL(10, 2) DEFAULT 0,
  max_weight DECIMAL(10, 2) DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inventário (itens individuais)
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  quantity BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type)
);

-- Tabela de sessões de mineração
CREATE TABLE IF NOT EXISTS mining_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('solo', 'coop')),
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  gold_amount INTEGER NOT NULL,
  partner_id VARCHAR(255),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de bounties (recompensas)
CREATE TABLE IF NOT EXISTS bounties (
  id SERIAL PRIMARY KEY,
  target_user_id VARCHAR(255) NOT NULL,
  issuer_user_id VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL,
  reason TEXT,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações de guild
CREATE TABLE IF NOT EXISTS guild_config (
  guild_id VARCHAR(255) PRIMARY KEY,
  welcome_channel_id VARCHAR(255),
  logs_channel_id VARCHAR(255),
  wanted_channel_id VARCHAR(255),
  language VARCHAR(10) DEFAULT 'en',
  config_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de códigos de resgate
CREATE TABLE IF NOT EXISTS redemption_codes (
  code VARCHAR(255) PRIMARY KEY,
  reward_type VARCHAR(100) NOT NULL,
  reward_amount BIGINT NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de resgates de código (tracking de quem usou)
CREATE TABLE IF NOT EXISTS code_redemptions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(255) REFERENCES redemption_codes(code) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_claimed ON mining_sessions(claimed);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_end_time ON mining_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_bounties_target ON bounties(target_user_id);
CREATE INDEX IF NOT EXISTS idx_bounties_claimed ON bounties(claimed);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mining_sessions_updated_at BEFORE UPDATE ON mining_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bounties_updated_at BEFORE UPDATE ON bounties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guild_config_updated_at BEFORE UPDATE ON guild_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

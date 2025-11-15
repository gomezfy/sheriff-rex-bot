import { db } from '../server/db';
import { rexBuckPackages } from '../shared/schema';
import crypto from 'crypto';

const packages = [
  {
    id: crypto.randomBytes(8).toString('hex'),
    name: '💵 Pacote Iniciante',
    description: 'Perfeito para começar sua jornada!',
    amountRexBucks: 100,
    bonusRexBucks: 0,
    priceCents: 500, // R$ 5,00
    currency: 'BRL',
    active: true,
    displayOrder: 1,
  },
  {
    id: crypto.randomBytes(8).toString('hex'),
    name: '💰 Pacote Popular',
    description: 'O mais escolhido pelos cowboys!',
    amountRexBucks: 500,
    bonusRexBucks: 50,
    priceCents: 2000, // R$ 20,00
    currency: 'BRL',
    active: true,
    displayOrder: 2,
  },
  {
    id: crypto.randomBytes(8).toString('hex'),
    name: '💎 Pacote Premium',
    description: 'Economize mais com bônus extra!',
    amountRexBucks: 1000,
    bonusRexBucks: 150,
    priceCents: 3500, // R$ 35,00
    currency: 'BRL',
    active: true,
    displayOrder: 3,
  },
  {
    id: crypto.randomBytes(8).toString('hex'),
    name: '👑 Pacote VIP',
    description: 'Para verdadeiros sheriffs!',
    amountRexBucks: 2500,
    bonusRexBucks: 500,
    priceCents: 7500, // R$ 75,00
    currency: 'BRL',
    active: true,
    displayOrder: 4,
  },
  {
    id: crypto.randomBytes(8).toString('hex'),
    name: '⭐ Pacote Ultimate',
    description: 'O melhor custo-benefício!',
    amountRexBucks: 5000,
    bonusRexBucks: 1500,
    priceCents: 12000, // R$ 120,00
    currency: 'BRL',
    active: true,
    displayOrder: 5,
  },
];

async function seedPackages() {
  try {
    console.log('🌱 Seeding RexBucks packages...');

    for (const pkg of packages) {
      await db.insert(rexBuckPackages).values(pkg);
      console.log(`✅ Created package: ${pkg.name}`);
    }

    console.log('✅ All packages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
    process.exit(1);
  }
}

seedPackages();

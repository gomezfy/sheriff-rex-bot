import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { db } from '../../server/db';
import { rexBuckPackages, mercadoPagoPayments } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { addRexBucks } from './rexBuckManager';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN not found in environment variables');
}

const client = accessToken 
  ? new MercadoPagoConfig({ 
      accessToken,
      options: {
        timeout: 5000,
      }
    })
  : null;

export const preference = client ? new Preference(client) : null;
export const payment = client ? new Payment(client) : null;

export interface PackageInfo {
  id: string;
  name: string;
  description: string;
  amountRexBucks: number;
  bonusRexBucks: number;
  priceCents: number;
  currency: string;
  totalRexBucks: number;
  displayPrice: string;
}

export async function getActivePackages(): Promise<PackageInfo[]> {
  try {
    const packages = await db
      .select()
      .from(rexBuckPackages)
      .where(eq(rexBuckPackages.active, true))
      .orderBy(rexBuckPackages.displayOrder);

    return packages.map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      amountRexBucks: pkg.amountRexBucks,
      bonusRexBucks: pkg.bonusRexBucks,
      priceCents: pkg.priceCents,
      currency: pkg.currency,
      totalRexBucks: pkg.amountRexBucks + pkg.bonusRexBucks,
      displayPrice: formatPrice(pkg.priceCents, pkg.currency),
    }));
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

export async function createPaymentPreference(
  userId: string,
  username: string,
  packageId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!preference) {
    return { success: false, error: 'Mercado Pago não está configurado. Por favor, configure MERCADOPAGO_ACCESS_TOKEN.' };
  }

  try {
    const packages = await db
      .select()
      .from(rexBuckPackages)
      .where(eq(rexBuckPackages.id, packageId))
      .limit(1);

    if (packages.length === 0) {
      return { success: false, error: 'Pacote não encontrado' };
    }

    const pkg = packages[0];
    const externalReference = `rexbucks_${userId}_${crypto.randomBytes(8).toString('hex')}`;

    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: pkg.id,
            title: pkg.name,
            description: pkg.description,
            quantity: 1,
            unit_price: pkg.priceCents / 100,
            currency_id: pkg.currency,
          },
        ],
        payer: {
          name: username,
          email: `${userId}@discord.user`,
        },
        external_reference: externalReference,
        notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
        back_urls: {
          success: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/payment/success`,
          failure: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/payment/failure`,
          pending: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/payment/pending`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        statement_descriptor: 'RexBucks - Sheriff Rex',
      },
    });

    await db.insert(mercadoPagoPayments).values({
      id: crypto.randomBytes(16).toString('hex'),
      userId,
      packageId,
      externalReference,
      preferenceId: preferenceData.id,
      status: 'pending',
      amount: pkg.priceCents,
      currency: pkg.currency,
    });

    return {
      success: true,
      url: preferenceData.init_point || undefined,
    };
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar preferência de pagamento',
    };
  }
}

export async function processPaymentNotification(paymentId: string): Promise<void> {
  if (!payment) {
    console.error('Mercado Pago client not initialized');
    return;
  }

  try {
    const paymentData = await payment.get({ id: paymentId });

    const externalReference = paymentData.external_reference;
    if (!externalReference) {
      console.error('Payment without external reference');
      return;
    }

    const existingPayments = await db
      .select()
      .from(mercadoPagoPayments)
      .where(eq(mercadoPagoPayments.externalReference, externalReference))
      .limit(1);

    if (existingPayments.length === 0) {
      console.error(`Payment not found for external reference: ${externalReference}`);
      return;
    }

    const paymentRecord = existingPayments[0];

    if (paymentRecord.processed) {
      console.log(`Payment ${paymentId} already processed`);
      return;
    }

    await db
      .update(mercadoPagoPayments)
      .set({
        mpPaymentId: paymentId,
        status: paymentData.status || 'unknown',
        rawPayload: paymentData as any,
        paidAt: paymentData.status === 'approved' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(mercadoPagoPayments.id, paymentRecord.id));

    if (paymentData.status === 'approved') {
      const packages = await db
        .select()
        .from(rexBuckPackages)
        .where(eq(rexBuckPackages.id, paymentRecord.packageId))
        .limit(1);

      if (packages.length === 0) {
        console.error(`Package ${paymentRecord.packageId} not found`);
        return;
      }

      const pkg = packages[0];
      const totalRexBucks = pkg.amountRexBucks + pkg.bonusRexBucks;

      const result = await addRexBucks(
        paymentRecord.userId,
        'User',
        totalRexBucks,
        'purchase',
        undefined,
        {
          paymentId: paymentId,
          packageId: pkg.id,
          packageName: pkg.name,
          amountPaid: paymentRecord.amount / 100,
          currency: paymentRecord.currency,
        }
      );

      if (result.success) {
        await db
          .update(mercadoPagoPayments)
          .set({
            processed: true,
            rexBuckTransactionId: result.transactionId,
            updatedAt: new Date(),
          })
          .where(eq(mercadoPagoPayments.id, paymentRecord.id));

        console.log(
          `✅ Payment processed: ${paymentId} - ${totalRexBucks} RexBucks credited to user ${paymentRecord.userId}`
        );
      } else {
        console.error(`Failed to credit RexBucks: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error processing payment notification:', error);
  }
}

function formatPrice(cents: number, currency: string): string {
  const value = cents / 100;
  
  if (currency === 'BRL') {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
  
  return `${currency} ${value.toFixed(2)}`;
}

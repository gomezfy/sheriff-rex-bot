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
        notification_url: process.env.WEBHOOK_URL ? `${process.env.WEBHOOK_URL}/webhook/mercadopago` : undefined,
        back_urls: {
          success: `${process.env.WEBHOOK_URL || 'http://localhost:5000'}/payment/success`,
          failure: `${process.env.WEBHOOK_URL || 'http://localhost:5000'}/payment/failure`,
          pending: `${process.env.WEBHOOK_URL || 'http://localhost:5000'}/payment/pending`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        statement_descriptor: 'RexBucks - Sheriff Rex',
      },
    });

    // Persist payment record immediately after creating preference
    // This ensures webhook can find the record even if it arrives quickly
    const paymentId = crypto.randomBytes(16).toString('hex');
    await db.insert(mercadoPagoPayments).values({
      id: paymentId,
      userId,
      packageId,
      externalReference,
      preferenceId: preferenceData.id,
      status: 'pending',
      amount: pkg.priceCents,
      currency: pkg.currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`💳 Payment preference created: ${externalReference} for user ${userId}`);

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

export async function processPaymentNotification(paymentId: string): Promise<{ success: boolean; error?: string }> {
  if (!payment) {
    console.error('Mercado Pago client not initialized');
    return { success: false, error: 'Mercado Pago not configured' };
  }

  try {
    // SECURITY: Fetch payment details directly from Mercado Pago API
    // This validates that the payment actually exists and prevents basic spoofing
    const paymentData = await payment.get({ id: paymentId });

    if (!paymentData) {
      console.error(`Payment ${paymentId} not found in Mercado Pago API`);
      return { success: false, error: 'Payment not found in Mercado Pago' };
    }

    const externalReference = paymentData.external_reference;
    if (!externalReference || !externalReference.startsWith('rexbucks_')) {
      console.error(`Invalid external reference: ${externalReference}`);
      return { success: false, error: 'Invalid external reference format' };
    }

    // SECURITY: Find payment record by external_reference and verify it exists
    const existingPayments = await db
      .select()
      .from(mercadoPagoPayments)
      .where(eq(mercadoPagoPayments.externalReference, externalReference))
      .limit(1);

    if (existingPayments.length === 0) {
      console.error(`No pending payment found for reference: ${externalReference}`);
      return { success: false, error: 'Payment record not found - may be fraudulent' };
    }

    const paymentRecord = existingPayments[0];

    // SECURITY: Verify payment wasn't already processed to prevent double-credit exploits
    if (paymentRecord.processed) {
      console.log(`Payment ${paymentId} already processed - preventing double credit`);
      return { success: true }; // Not an error, idempotency check passed
    }

    // SECURITY: Store the MP payment ID and verify it matches if already set
    if (paymentRecord.mpPaymentId && paymentRecord.mpPaymentId !== paymentId) {
      console.error(`Payment ID mismatch: stored=${paymentRecord.mpPaymentId}, received=${paymentId}`);
      return { success: false, error: 'Payment ID mismatch - potential fraud' };
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
        return { success: false, error: 'Package not found' };
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
        return { success: true };
      } else {
        console.error(`Failed to credit RexBucks: ${result.error}`);
        return { success: false, error: result.error };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing payment notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

function formatPrice(cents: number, currency: string): string {
  const value = cents / 100;
  
  if (currency === 'BRL') {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
  
  return `${currency} ${value.toFixed(2)}`;
}

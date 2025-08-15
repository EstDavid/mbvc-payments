import z from 'zod';
import { prisma } from '@/lib/db';
import { redsysRestEventSchema } from '@/lib/schemas/redsys';
import translations from '@/lib/translations';
import { getRedsysResponseData } from '@/lib/utils/crypto';
import { requireEnv } from '@/lib/utils/server';
import { Language } from '@/types/payment';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const redsysMerchantCode = requireEnv("REDSYS_MERCHANT_CODE");
const emailFeatureFlag = requireEnv("NEXT_PUBLIC_EMAIL_FEATURE_FLAG");

const useEmailFeature = emailFeatureFlag === 'TRUE';

const isAuthorized = (code: string) => {
  return /^00\d{2}$/.test(code) && Number(code) <= 99;
};

const isCancelledOrReturned = (code: string) => {
  return code === '0400' || code === '0900';
};

export async function POST (req: NextRequest) {
  let body: Record<string, unknown> | undefined;
  try {
    // Redsys posts application/x-www-form-urlencoded (Ds_MerchantParameters, Ds_Signature, ...)
    const contentType = (req.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text)) as Record<string, unknown>;
    } else if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // Try json first, fallback to form parsing
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        body = Object.fromEntries(new URLSearchParams(text)) as Record<string, unknown>;
      }
    }

    if (!body) throw new Error('Empty request body');

    const data = getRedsysResponseData<z.infer<typeof redsysRestEventSchema>>(body, redsysRestEventSchema);

    if ('Ds_Response' in data && typeof data.Ds_Response === 'string') {
      const responseCode = data.Ds_Response;

      if (data.Ds_MerchantCode === redsysMerchantCode) {
        let status: OrderStatus;
        if (isAuthorized(responseCode)) {
          console.log({ useEmailFeature });
          if (useEmailFeature) {
            const { sendEmail } = await import('@/lib/services/email');

            const order = await prisma.order.findUnique({
              where: { id: data.Ds_Order },
              include: {
                user: {
                  select: { name: true }
                }
              }
            });

            console.log({ order });

            if (order && order.email) {
              console.log('Sending order');
              sendEmail(
                translations[order.language].emailText as Record<Language, string>,
                order.language as Language,
                {
                  to: order.email,
                  name: order.user.name,
                  orderNumber: order.id.toString(),
                  description: order.description,
                  amount: order.amount.toString()
                }
              );
            }
          }
          status = 'Paid';
        } else if (isCancelledOrReturned(responseCode)) {
          status = 'Returned';
        } else {
          status = 'Cancelled';
        }
        await prisma.order.update({
          where: { id: data.Ds_Order },
          data: { status, redsysResponse: responseCode }
        });
      } else {
        throw new Error('Unexpected redsys event');
      }
    }
    return NextResponse.json({ message: 'Payment received', data }, { status: 200 });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
import { prisma } from '@/lib/db';
import { redsysRestEventSchema } from '@/lib/schemas/redsys';
import { getRedsysResponseData } from '@/lib/utils/crypto';
import { requireEnv } from '@/lib/utils/server';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

const redsysMerchantCode = requireEnv("REDSYS_MERCHANT_CODE");

const isAuthorized = (code: string) => {
  return /^00\d{2}$/.test(code) && Number(code) <= 99;
};

const isCancelledOrReturned = (code: string) => {
  return code === '0400' || code === '0900';
};

export async function POST (req: NextRequest) {
  let body;
  try {
    body = await req.json();
    // Process the received data here

    const data = getRedsysResponseData<z.infer<typeof redsysRestEventSchema>>(
      body,
      redsysRestEventSchema
    );

    if ('Ds_Response' in data && typeof data.Ds_Response === 'string') {
      const responseCode = data.Ds_Response;

      if (data.Ds_MerchantCode === redsysMerchantCode) {
        let status: OrderStatus;
        if (isAuthorized(responseCode)) {
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
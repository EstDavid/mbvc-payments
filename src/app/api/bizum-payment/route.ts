import { decodeMerchantParameters } from '@/lib/utils/crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST (req: NextRequest) {
  try {
    const data = await req.json();
    // Process the received data here

    const decodedData = decodeMerchantParameters(data.Ds_MerchantParameters);

    console.log({ decodedData });

    // TODO: Update database with transaction status

    return NextResponse.json({ message: 'Payment received', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
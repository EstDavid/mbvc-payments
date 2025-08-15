import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET (req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('orderNumber');

  try {
    if (!orderNumber) {
      throw new Error('orderNumber query parameter not set');
    }

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderNumber)
      }
    });

    if (!order) {
      throw new Error(`Order number: ${orderNumber} not found`);
    }
    return NextResponse.json({ status: order.status }, { status: 200 });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
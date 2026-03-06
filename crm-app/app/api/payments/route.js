import prisma from '@/lib/prisma';

// GET /api/payments?clientId=123
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId || isNaN(parseInt(clientId))) {
            return Response.json({ error: 'Valid client ID is required' }, { status: 400 });
        }

        const payments = await prisma.payment.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { paidAt: 'desc' },
        });

        return Response.json(payments);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}

// POST /api/payments
export async function POST(request) {
    try {
        const body = await request.json();
        const { clientId, amount, paidAt, note } = body;

        if (!clientId || isNaN(parseInt(clientId))) {
            return Response.json({ error: 'Valid client ID is required' }, { status: 400 });
        }
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return Response.json({ error: 'Valid payment amount is required' }, { status: 400 });
        }
        if (!paidAt) {
            return Response.json({ error: 'Payment date is required' }, { status: 400 });
        }

        // Verify client exists
        const client = await prisma.client.findUnique({
            where: { id: parseInt(clientId) },
        });
        if (!client) {
            return Response.json({ error: 'Client not found' }, { status: 404 });
        }

        const payment = await prisma.payment.create({
            data: {
                clientId: parseInt(clientId),
                amount: parseFloat(amount),
                paidAt: new Date(paidAt),
                note: note?.trim() || null,
            },
        });

        return Response.json(payment, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to create payment' }, { status: 500 });
    }
}

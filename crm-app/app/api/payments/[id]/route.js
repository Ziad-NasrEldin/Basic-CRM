import prisma from '@/lib/prisma';

// GET /api/payments/[id]
export async function GET(request, { params }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return Response.json({ error: 'Invalid payment ID' }, { status: 400 });
        }

        const payment = await prisma.payment.findUnique({
            where: { id },
        });

        if (!payment) {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }

        return Response.json(payment);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch payment' }, { status: 500 });
    }
}

// PUT /api/payments/[id]
export async function PUT(request, { params }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return Response.json({ error: 'Invalid payment ID' }, { status: 400 });
        }

        const body = await request.json();
        const { amount, paidAt, note } = body;

        const updateData = {};
        if (amount !== undefined) {
            if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                return Response.json({ error: 'Valid payment amount is required' }, { status: 400 });
            }
            updateData.amount = parseFloat(amount);
        }
        if (paidAt !== undefined) {
            updateData.paidAt = new Date(paidAt);
        }
        if (note !== undefined) {
            updateData.note = note?.trim() || null;
        }

        const payment = await prisma.payment.update({
            where: { id },
            data: updateData,
        });

        return Response.json(payment);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }
        return Response.json({ error: 'Failed to update payment' }, { status: 500 });
    }
}

// DELETE /api/payments/[id]
export async function DELETE(request, { params }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return Response.json({ error: 'Invalid payment ID' }, { status: 400 });
        }

        await prisma.payment.delete({
            where: { id },
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }
        return Response.json({ error: 'Failed to delete payment' }, { status: 500 });
    }
}

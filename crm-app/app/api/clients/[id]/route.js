import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
        return Response.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                product: true,
                status: true,
                notes: { orderBy: { createdAt: 'desc' } },
                tasks: {
                    orderBy: [
                        { completed: 'asc' },
                        { dueAt: 'asc' },
                        { createdAt: 'desc' },
                    ],
                },
            },
        });

        if (!client) {
            return Response.json({ error: 'Client not found' }, { status: 404 });
        }

        return Response.json(client);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
        return Response.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { fullName, phoneNumber, productId, statusId } = body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName.trim();
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();
        if (productId !== undefined) updateData.productId = productId ? parseInt(productId) : null;
        if (statusId !== undefined) updateData.statusId = statusId ? parseInt(statusId) : null;

        const client = await prisma.client.update({
            where: { id: clientId },
            data: updateData,
            include: {
                product: true,
                status: true,
                notes: { orderBy: { createdAt: 'desc' } },
                tasks: {
                    orderBy: [
                        { completed: 'asc' },
                        { dueAt: 'asc' },
                        { createdAt: 'desc' },
                    ],
                },
            },
        });

        return Response.json(client);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to update client' }, { status: 500 });
    }
}

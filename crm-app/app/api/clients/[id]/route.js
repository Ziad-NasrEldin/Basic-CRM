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
                notes: { orderBy: { createdAt: 'desc' } },
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

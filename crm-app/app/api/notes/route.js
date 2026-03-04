import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { clientId, content } = body;

        if (!clientId || isNaN(parseInt(clientId))) {
            return Response.json({ error: 'Valid client ID is required' }, { status: 400 });
        }
        if (!content || !content.trim()) {
            return Response.json({ error: 'Note content is required' }, { status: 400 });
        }

        // Verify client exists
        const client = await prisma.client.findUnique({
            where: { id: parseInt(clientId) },
        });
        if (!client) {
            return Response.json({ error: 'Client not found' }, { status: 404 });
        }

        const note = await prisma.note.create({
            data: {
                clientId: parseInt(clientId),
                content: content.trim(),
            },
        });

        return Response.json(note, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to create note' }, { status: 500 });
    }
}

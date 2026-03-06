import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const parsedClientId = clientId ? parseInt(clientId) : null;

    if (clientId && (isNaN(parsedClientId) || parsedClientId <= 0)) {
        return Response.json({ error: 'Invalid clientId query parameter' }, { status: 400 });
    }

    try {
        const tasks = await prisma.task.findMany({
            where: parsedClientId
                ? { clientId: parsedClientId }
                : undefined,
            include: {
                client: {
                    select: { id: true, fullName: true, phoneNumber: true },
                },
            },
            orderBy: [
                { completed: 'asc' },
                { dueAt: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        return Response.json(tasks);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { clientId, title, description, dueAt, remindAt, priority } = body;

        const parsedClientId = parseInt(clientId);
        if (!parsedClientId || isNaN(parsedClientId)) {
            return Response.json({ error: 'Valid client ID is required' }, { status: 400 });
        }
        if (!title || !title.trim()) {
            return Response.json({ error: 'Task title is required' }, { status: 400 });
        }

        const client = await prisma.client.findUnique({
            where: { id: parsedClientId },
            select: { id: true },
        });
        if (!client) {
            return Response.json({ error: 'Client not found' }, { status: 404 });
        }

        const task = await prisma.task.create({
            data: {
                clientId: parsedClientId,
                title: title.trim(),
                description: description?.trim() || null,
                dueAt: dueAt ? new Date(dueAt) : null,
                remindAt: remindAt ? new Date(remindAt) : null,
                priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
            },
            include: {
                client: {
                    select: { id: true, fullName: true, phoneNumber: true },
                },
            },
        });

        return Response.json(task, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

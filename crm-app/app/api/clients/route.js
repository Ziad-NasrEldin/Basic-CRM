import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    try {
        const clients = await prisma.client.findMany({
            where: search
                ? {
                    OR: [
                        { fullName: { contains: search } },
                        { phoneNumber: { contains: search } },
                    ],
                }
                : undefined,
            include: { 
                product: true,
                status: true,
                tasks: {
                    where: { completed: false },
                    select: { id: true, dueAt: true, priority: true },
                    orderBy: { dueAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return Response.json(clients);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { fullName, phoneNumber, productId, statusId } = body;

        if (!fullName || !fullName.trim()) {
            return Response.json({ error: 'Full name is required' }, { status: 400 });
        }
        if (!phoneNumber || !phoneNumber.trim()) {
            return Response.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const client = await prisma.client.create({
            data: {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                productId: productId ? parseInt(productId) : null,
                statusId: statusId ? parseInt(statusId) : null,
            },
            include: { 
                product: true,
                status: true
            },
        });

        return Response.json(client, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to create client' }, { status: 500 });
    }
}

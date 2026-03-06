import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const statuses = await prisma.clientStatus.findMany({
            orderBy: { name: 'asc' },
        });
        return Response.json(statuses);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch statuses' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, color } = body;

        if (!name || !name.trim()) {
            return Response.json({ error: 'Status name is required' }, { status: 400 });
        }

        const existing = await prisma.clientStatus.findFirst({
            where: { name: name.trim() },
        });
        if (existing) {
            return Response.json({ error: 'A status with this name already exists' }, { status: 409 });
        }

        const status = await prisma.clientStatus.create({
            data: { 
                name: name.trim(),
                color: color || '#6B7280'
            },
        });
        return Response.json(status, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to create status' }, { status: 500 });
    }
}

import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' },
        });
        return Response.json(products);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return Response.json({ error: 'Product name is required' }, { status: 400 });
        }

        const existing = await prisma.product.findFirst({
            where: { name: name.trim() },
        });
        if (existing) {
            return Response.json({ error: 'A product with this name already exists' }, { status: 409 });
        }

        const product = await prisma.product.create({
            data: { name: name.trim() },
        });
        return Response.json(product, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

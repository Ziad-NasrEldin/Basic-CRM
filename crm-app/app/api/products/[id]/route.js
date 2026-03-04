import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
        return Response.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    try {
        await prisma.product.delete({ where: { id: productId } });
        return Response.json({ success: true });
    } catch (error) {
        if (error.code === 'P2025') {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }
        console.error(error);
        return Response.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}

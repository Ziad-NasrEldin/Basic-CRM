import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
    const { id } = await params;
    const statusId = parseInt(id);

    if (isNaN(statusId)) {
        return Response.json({ error: 'Invalid status ID' }, { status: 400 });
    }

    try {
        await prisma.clientStatus.delete({
            where: { id: statusId },
        });
        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to delete status' }, { status: 500 });
    }
}

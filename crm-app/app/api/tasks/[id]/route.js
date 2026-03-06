import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { title, description, dueAt, remindAt, priority, completed } = body;

        const updateData = {};

        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (dueAt !== undefined) updateData.dueAt = dueAt ? new Date(dueAt) : null;
        if (remindAt !== undefined) updateData.remindAt = remindAt ? new Date(remindAt) : null;
        if (priority !== undefined) {
            updateData.priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
        }
        if (completed !== undefined) updateData.completed = Boolean(completed);

        const task = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                client: {
                    select: { id: true, fullName: true, phoneNumber: true },
                },
            },
        });

        return Response.json(task);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    try {
        await prisma.task.delete({ where: { id: taskId } });
        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}

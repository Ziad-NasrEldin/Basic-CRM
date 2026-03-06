import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const now = new Date();
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        const reminders = await prisma.task.findMany({
            where: {
                completed: false,
                OR: [
                    { remindAt: { lte: endOfToday } },
                    { remindAt: null, dueAt: { lte: endOfToday } },
                ],
            },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        status: { select: { name: true, color: true } },
                    },
                },
            },
            orderBy: [
                { remindAt: 'asc' },
                { dueAt: 'asc' },
                { createdAt: 'asc' },
            ],
        });

        return Response.json(reminders);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch reminders' }, { status: 500 });
    }
}

import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get all clients with their sale values and payments
        const clients = await prisma.client.findMany({
            include: {
                payments: {
                    orderBy: { paidAt: 'asc' }
                }
            }
        });

        // Calculate total sale value
        const totalSaleValue = clients.reduce((sum, client) => {
            return sum + (parseFloat(client.saleValue) || 0);
        }, 0);

        // Calculate total paid
        const totalPaid = clients.reduce((sum, client) => {
            const clientPaid = client.payments.reduce((pSum, payment) => {
                return pSum + parseFloat(payment.amount);
            }, 0);
            return sum + clientPaid;
        }, 0);

        // Group payments by month
        const paymentsByMonth = {};
        
        clients.forEach(client => {
            client.payments.forEach(payment => {
                const date = new Date(payment.paidAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!paymentsByMonth[monthKey]) {
                    paymentsByMonth[monthKey] = {
                        month: monthKey,
                        year: date.getFullYear(),
                        monthNumber: date.getMonth() + 1,
                        total: 0,
                        count: 0,
                        payments: []
                    };
                }
                
                paymentsByMonth[monthKey].total += parseFloat(payment.amount);
                paymentsByMonth[monthKey].count += 1;
                paymentsByMonth[monthKey].payments.push({
                    id: payment.id,
                    amount: parseFloat(payment.amount),
                    paidAt: payment.paidAt,
                    clientId: client.id,
                    clientName: client.fullName
                });
            });
        });

        // Convert to array and sort by month
        const monthlyData = Object.values(paymentsByMonth).sort((a, b) => {
            return b.month.localeCompare(a.month); // Most recent first
        });

        // Get clients with sale value
        const clientsWithSaleValue = clients.filter(c => c.saleValue && parseFloat(c.saleValue) > 0);
        const totalRemaining = totalSaleValue - totalPaid;

        return Response.json({
            totalSaleValue,
            totalPaid,
            totalRemaining,
            clientsCount: clients.length,
            clientsWithSaleValueCount: clientsWithSaleValue.length,
            monthlyData,
            averagePaymentPerMonth: monthlyData.length > 0 
                ? totalPaid / monthlyData.length 
                : 0
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

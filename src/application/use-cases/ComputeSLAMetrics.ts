import type { MetricsQueryInput, SLAMetrics } from "../dtos/metrics";
import type { TicketRepository } from "../ports/TicketRepository";

/**
 * Caso de uso: Calcular métricas de cumplimiento SLA
 *
 * Este caso de uso no depende de Prisma ni de infraestructura.
 * Solo requiere un repositorio que proporcione los tickets.
 */
export class ComputeSLAMetrics {
    constructor(private readonly ticketRepo: TicketRepository) {}

    async execute(query: MetricsQueryInput): Promise<SLAMetrics> {
        const tickets = await this.ticketRepo.findByFilters({
            areaId: query.areaId,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        });

        const totalTickets = tickets.length;
        const slaBreached = tickets.filter((t) => t.slaBreached).length;
        const slaCompliant = totalTickets - slaBreached;

        const compliancePercentage = totalTickets > 0 ? (slaCompliant / totalTickets) * 100 : 0;

        const ticketsWithFirstResponse = tickets.filter((t) => t.firstResponseAt);
        const avgFirstResponseTime = this.calculateAverageMinutes(
            ticketsWithFirstResponse.map((t) => [t.createdAt, t.firstResponseAt!]),
        );

        const ticketsResolved = tickets.filter((t) => t.resolvedAt);
        const avgResolutionTime = this.calculateAverageMinutes(
            ticketsResolved.map((t) => [t.createdAt, t.resolvedAt!]),
        );

        const ticketsByPriority = this.groupByField(tickets, "priority");
        const ticketsByStatus = this.groupByField(tickets, "status");

        return {
            totalTickets,
            slaCompliant,
            slaBreached,
            compliancePercentage: this.round(compliancePercentage),
            avgFirstResponseTime: avgFirstResponseTime ? this.round(avgFirstResponseTime) : null,
            avgResolutionTime: avgResolutionTime ? this.round(avgResolutionTime) : null,
            ticketsByPriority,
            ticketsByStatus,
        };
    }

    /**
     * Calcula el promedio en minutos entre pares de fechas.
     */
    private calculateAverageMinutes(pairs: [Date, Date][]): number | null {
        if (pairs.length === 0) return null;

        const totalMinutes = pairs.reduce((sum, [start, end]) => {
            return sum + (end.getTime() - start.getTime()) / 1000 / 60;
        }, 0);

        return totalMinutes / pairs.length;
    }

    /**
     * Agrupa los tickets por el campo especificado.
     */
    private groupByField<T extends Record<string, any>>(
        items: T[],
        field: keyof T,
    ): Record<string, number> {
        return items.reduce(
            (acc, item) => {
                const key = String(item[field]);
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
    }

    private round(value: number, decimals = 2): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
}

import { z } from "zod";

/**
 * Validation schema for SLA metric queries.
 * Allows filtering by area and date range.
 */
export const MetricsQuerySchema = z.object({
    areaId: z.string().uuid().optional(), 
    from: z
        .union([z.string(), z.date()])
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)), 
    to: z
        .union([z.string(), z.date()])
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

export type MetricsQueryInput = z.infer<typeof MetricsQuerySchema>;

/**
 * Represents the SLA metrics calculated for a set of tickets.
 */
export interface SLAMetrics {
<<<<<<< HEAD
    /** Total de tickets evaluados */
    totalTickets: number;
    /** Tickets que cumplieron con el SLA */
    slaCompliant: number;
    /** Tickets que incumplieron el SLA */
    slaBreached: number;
    /** Porcentaje de cumplimiento SLA */
    compliancePercentage: number;
    /** Tiempo promedio de primera respuesta (en minutos) */
    avgFirstResponseTime: number | null;
    /** Tiempo promedio de resolución (en minutos) */
    avgResolutionTime: number | null;
    /** Distribución de tickets por prioridad */
    ticketsByPriority: Record<string, number>;
    /** Distribución de tickets por estado */
    ticketsByStatus: Record<string, number>;
=======
    /** Total tickets evaluated */
    totalTickets: number
    /** Tickets that met the SLA */
    slaCompliant: number
    /** Tickets that violated the SLA */
    slaBreached: number
    /** SLA compliance percentage */
    compliancePercentage: number
    /** Average first response time (in minutes) */
    avgFirstResponseTime: number | null
    /** Average resolution time (in minutes) */
    avgResolutionTime: number | null
    /** Ticket distribution by priority */
    ticketsByPriority: Record<string, number>
    /** Ticket distribution by state */
    ticketsByStatus: Record<string, number>
>>>>>>> main
}

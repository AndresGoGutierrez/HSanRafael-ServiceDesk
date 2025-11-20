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
}

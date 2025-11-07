import { z } from "zod"

/**
 * Schema de validación para las consultas de métricas SLA.
 * Permite filtrar por área y rango de fechas.
 */
export const MetricsQuerySchema = z.object({
    areaId: z.string().uuid().optional(), // si existe, debe ser un UUID válido
    from: z
        .union([z.string(), z.date()])
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)), // conversión segura a Date
    to: z
        .union([z.string(), z.date()])
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
})

export type MetricsQueryInput = z.infer<typeof MetricsQuerySchema>

/**
 * Representa las métricas SLA calculadas para un conjunto de tickets.
 */
export interface SLAMetrics {
    /** Total de tickets evaluados */
    totalTickets: number
    /** Tickets que cumplieron con el SLA */
    slaCompliant: number
    /** Tickets que incumplieron el SLA */
    slaBreached: number
    /** Porcentaje de cumplimiento SLA */
    compliancePercentage: number
    /** Tiempo promedio de primera respuesta (en minutos) */
    avgFirstResponseTime: number | null
    /** Tiempo promedio de resolución (en minutos) */
    avgResolutionTime: number | null
    /** Distribución de tickets por prioridad */
    ticketsByPriority: Record<string, number>
    /** Distribución de tickets por estado */
    ticketsByStatus: Record<string, number>
}

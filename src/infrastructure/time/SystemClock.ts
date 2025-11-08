import type { Clock } from "../../application/ports/Clock"

/**
 * Implementación concreta del puerto Clock.
 *
 * Proporciona la hora actual del sistema.
 * 
 * Esta clase pertenece a la capa de infraestructura.
 * Se puede reemplazar fácilmente por un mock o una versión fija
 * durante pruebas unitarias.
 */
export class SystemClock implements Clock {
    private readonly fixedDate?: Date

    /**
     * Permite crear un reloj fijo (útil en testing)
     * o un reloj real basado en la hora del sistema.
     * @param fixedDate Si se provee, siempre devolverá esta fecha.
     */
    constructor(fixedDate?: Date) {
        this.fixedDate = fixedDate
    }

    /**
     * Devuelve la hora actual del sistema o una hora fija.
     */
    now(): Date {
        return this.fixedDate ? new Date(this.fixedDate) : new Date()
    }
}

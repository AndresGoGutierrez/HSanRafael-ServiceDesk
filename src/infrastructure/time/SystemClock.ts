import type { Clock } from "../../application/ports/Clock"

/**
 * Concrete implementation of the Clock port.
 *
 * Provides the current system time.
 *
 * This class belongs to the infrastructure layer.
 * It can be easily replaced by a mock or a fixed version
 * during unit testing.
 */
export class SystemClock implements Clock {
    private readonly fixedDate?: Date

    /**
     * Allows you to create a fixed clock (useful for testing)
     * or a real clock based on the system time.
     * @param fixedDate If provided, it will always return this date.
     */
    constructor(fixedDate?: Date) {
        this.fixedDate = fixedDate
    }

    /**
     * Returns the current system time or a fixed time.
     */
    now(): Date {
        return this.fixedDate ? new Date(this.fixedDate) : new Date()
    }
}

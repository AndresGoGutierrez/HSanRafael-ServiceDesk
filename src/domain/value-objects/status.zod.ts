import { z } from "zod";
import { TicketPriority, TicketStatus } from "./Status";

export const ZTicketStatus = z.enum(TicketStatus);
export const ZTicketPriority = z.enum(TicketPriority);

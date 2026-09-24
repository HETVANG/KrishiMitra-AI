import mongoose from 'mongoose';
import { SupportTicket, ISupportTicket, SupportCategory, SupportPriority, SupportStatus } from '../../models/SupportTicket';

export interface CreateTicketPayload {
  userId: string;
  farmId?: string;
  organizationId?: string;
  category: SupportCategory;
  priority?: SupportPriority;
  subject: string;
  description: string;
  language?: string;
}

export class SupportTicketService {
  /**
   * Create a new farmer support ticket
   */
  static async createTicket(payload: CreateTicketPayload): Promise<ISupportTicket> {
    const ticketId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;

    let priority: SupportPriority = payload.priority || 'MEDIUM';
    if (payload.category === 'PAYMENT' || payload.subject.toLowerCase().includes('charge') || payload.subject.toLowerCase().includes('hacked')) {
      priority = 'CRITICAL';
    }

    if (mongoose.connection.readyState !== 1) {
      return {
        ticketId,
        userId: payload.userId,
        farmId: payload.farmId,
        organizationId: payload.organizationId,
        category: payload.category,
        priority,
        status: 'OPEN',
        subject: payload.subject,
        description: payload.description,
        language: payload.language || 'en',
        messages: [
          {
            sender: 'USER',
            text: payload.description,
            timestamp: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    const ticket = await SupportTicket.create({
      ticketId,
      userId: payload.userId,
      farmId: payload.farmId,
      organizationId: payload.organizationId,
      category: payload.category,
      priority,
      status: 'OPEN',
      subject: payload.subject,
      description: payload.description,
      language: payload.language || 'en',
      messages: [
        {
          sender: 'USER',
          text: payload.description,
          timestamp: new Date()
        }
      ]
    });

    return ticket;
  }

  /**
   * Get farmer's own support tickets
   */
  static async getUserTickets(userId: string): Promise<ISupportTicket[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return await SupportTicket.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  /**
   * Add message to ticket
   */
  static async addMessage(ticketId: string, userId: string, text: string, isSupportAgent = false): Promise<ISupportTicket | null> {
    if (mongoose.connection.readyState !== 1) {
      return {
        ticketId,
        userId,
        status: isSupportAgent ? 'IN_REVIEW' : 'OPEN',
        messages: [{ sender: isSupportAgent ? 'SUPPORT_AGENT' : 'USER', text, timestamp: new Date() }]
      } as any;
    }

    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) return null;

    ticket.messages.push({
      sender: isSupportAgent ? 'SUPPORT_AGENT' : 'USER',
      text,
      timestamp: new Date()
    });

    if (isSupportAgent && ticket.status === 'OPEN') {
      ticket.status = 'IN_REVIEW';
    } else if (!isSupportAgent && ticket.status === 'WAITING_FOR_USER') {
      ticket.status = 'IN_REVIEW';
    }

    await ticket.save();
    return ticket;
  }

  /**
   * Update ticket status (Admin / Support Agent)
   */
  static async updateStatus(ticketId: string, status: SupportStatus, resolutionNotes?: string, assignedTo?: string): Promise<ISupportTicket | null> {
    if (mongoose.connection.readyState !== 1) return null;
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) return null;

    ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();
    return ticket;
  }

  /**
   * Get open tickets for admin dashboard
   */
  static async getAdminTickets(status?: SupportStatus, priority?: SupportPriority): Promise<ISupportTicket[]> {
    if (mongoose.connection.readyState !== 1) return [];
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    return await SupportTicket.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean() as any;
  }
}


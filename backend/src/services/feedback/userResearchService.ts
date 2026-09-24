import mongoose from 'mongoose';
import { ResearchParticipant } from '../../models/ResearchParticipant';
import { ResearchInterview } from '../../models/ResearchInterview';

export class UserResearchService {
  /**
   * Register research participant with explicit consent
   */
  static async registerParticipant(payload: {
    userId?: string;
    name: string;
    phone?: string;
    region?: string;
    cropsGrown?: string[];
    consentGiven: boolean;
    consentScope?: string;
  }): Promise<any> {
    if (!payload.consentGiven) {
      throw new Error('Explicit consent is required before registering a research participant.');
    }

    if (mongoose.connection.readyState !== 1) {
      return {
        _id: `part_${Date.now()}`,
        userId: payload.userId,
        name: payload.name,
        phone: payload.phone,
        region: payload.region || 'IN',
        cropsGrown: payload.cropsGrown || [],
        consentGiven: true,
        consentScope: payload.consentScope || 'Product usability and workflow feedback research',
        consentTimestamp: new Date(),
        status: 'ACTIVE'
      };
    }

    return await ResearchParticipant.create({
      userId: payload.userId,
      name: payload.name,
      phone: payload.phone,
      region: payload.region || 'IN',
      cropsGrown: payload.cropsGrown || [],
      consentGiven: true,
      consentScope: payload.consentScope || 'Product usability and workflow feedback research',
      consentTimestamp: new Date(),
      status: 'ACTIVE'
    });
  }

  /**
   * Log internal structured research interview notes
   */
  static async logInterview(payload: {
    participantId: string;
    interviewer: string;
    workflowObserved: string;
    keyObservations: string[];
    quotes: string[];
    followUpRequired?: boolean;
    notes: string;
  }): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: `intv_${Date.now()}`,
        participantId: payload.participantId,
        interviewDate: new Date(),
        interviewer: payload.interviewer,
        workflowObserved: payload.workflowObserved,
        keyObservations: payload.keyObservations,
        quotes: payload.quotes,
        followUpRequired: payload.followUpRequired || false,
        notes: payload.notes
      };
    }

    const participant = await ResearchParticipant.findById(payload.participantId);
    if (!participant || participant.status !== 'ACTIVE') {
      throw new Error('Participant not found or consent has been withdrawn.');
    }

    return await ResearchInterview.create({
      participantId: payload.participantId,
      interviewDate: new Date(),
      interviewer: payload.interviewer,
      workflowObserved: payload.workflowObserved,
      keyObservations: payload.keyObservations,
      quotes: payload.quotes,
      followUpRequired: payload.followUpRequired || false,
      notes: payload.notes
    });
  }

  /**
   * Withdraw research consent
   */
  static async withdrawConsent(participantId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: participantId,
        status: 'WITHDRAWN',
        consentGiven: false
      };
    }

    const participant = await ResearchParticipant.findById(participantId);
    if (participant) {
      participant.status = 'WITHDRAWN';
      participant.consentGiven = false;
      await participant.save();
    }
    return participant;
  }
}


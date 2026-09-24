import mongoose from 'mongoose';
import { Invitation } from '../../models/Invitation';
import { User } from '../../models/User';
import { FarmMembership } from '../../models/FarmMembership';
import { OrganizationMembership } from '../../models/OrganizationMembership';
import crypto from 'crypto';

export interface CreateInviteInput {
  inviterId: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  role?: string;
  farmId?: string;
  organizationId?: string;
}

export class InviteService {
  /**
   * Create invitation for a farmer, farm worker, advisor, or team member
   */
  static async createInvitation(input: CreateInviteInput): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        success: true,
        inviteToken: 'inv_offline_token',
        inviteUrl: 'http://localhost:5173/register?invite=inv_offline_token'
      };
    }

    const token = crypto.randomBytes(16).toString('hex');
    const invitation = await Invitation.create({
      inviterId: input.inviterId,
      inviteeEmail: input.inviteeEmail?.toLowerCase().trim(),
      inviteePhone: input.inviteePhone?.trim(),
      role: input.role || 'farmer',
      farmId: input.farmId ? new mongoose.Types.ObjectId(input.farmId) : undefined,
      organizationId: input.organizationId ? new mongoose.Types.ObjectId(input.organizationId) : undefined,
      inviteToken: token,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    return {
      success: true,
      invitationId: invitation._id,
      inviteToken: token,
      expiresAt: invitation.expiresAt
    };
  }

  /**
   * Verify an invitation token
   */
  static async verifyInvitationToken(token: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return { valid: true, role: 'farmer' };
    }

    const invite = await Invitation.findOne({ inviteToken: token, status: 'PENDING' })
      .populate('inviterId', 'name email')
      .populate('farmId', 'name')
      .populate('organizationId', 'name');

    if (!invite) {
      return { valid: false, message: 'Invalid or expired invitation' };
    }

    if (new Date() > invite.expiresAt) {
      invite.status = 'EXPIRED';
      await invite.save();
      return { valid: false, message: 'Invitation has expired' };
    }

    return {
      valid: true,
      inviterName: (invite.inviterId as any)?.name,
      farmName: (invite.farmId as any)?.name,
      orgName: (invite.organizationId as any)?.name,
      role: invite.role,
      expiresAt: invite.expiresAt
    };
  }

  /**
   * Accept an invitation and link user to Farm/Organization memberships
   */
  static async acceptInvitation(userId: string, token: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return { success: true };
    }

    const invite = await Invitation.findOne({ inviteToken: token, status: 'PENDING' });
    if (!invite) {
      throw new Error('Invalid or expired invitation token');
    }

    if (new Date() > invite.expiresAt) {
      invite.status = 'EXPIRED';
      await invite.save();
      throw new Error('Invitation has expired');
    }

    // Attach user to FarmMembership if farmId is specified
    if (invite.farmId) {
      const existingFarmMem = await FarmMembership.findOne({
        farm: invite.farmId,
        user: userId
      });
      if (!existingFarmMem) {
        await FarmMembership.create({
          farm: invite.farmId,
          user: new mongoose.Types.ObjectId(userId),
          role: invite.role === 'farm_manager' ? 'MANAGER' : invite.role === 'advisor' ? 'CONSULTANT' : 'WORKER',
          permissions: ['VIEW_FARM', 'ADD_RECORDS']
        });
      }
    }

    // Attach user to OrganizationMembership if organizationId is specified
    if (invite.organizationId) {
      const existingOrgMem = await OrganizationMembership.findOne({
        organization: invite.organizationId,
        user: userId
      });
      if (!existingOrgMem) {
        await OrganizationMembership.create({
          organization: invite.organizationId,
          user: new mongoose.Types.ObjectId(userId),
          role: invite.role === 'admin' ? 'ADMIN' : invite.role === 'advisor' ? 'ADVISOR' : 'MEMBER',
          status: 'ACTIVE'
        });
      }
    }

    invite.status = 'ACCEPTED';
    invite.acceptedAt = new Date();
    await invite.save();

    return { success: true, message: 'Invitation accepted successfully' };
  }
}

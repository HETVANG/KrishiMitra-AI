import mongoose from 'mongoose';
import { ProductSafetyReport, IProductSafetyReport, SafetyCategory, SafetyStatus } from '../../models/ProductSafetyReport';

export interface CreateSafetyReportPayload {
  userId: string;
  farmId?: string;
  category: SafetyCategory;
  feature: string;
  referenceId?: string;
  description: string;
}

export class SafetyReportService {
  /**
   * Submit an agricultural AI safety hazard report
   */
  static async submitReport(payload: CreateSafetyReportPayload): Promise<IProductSafetyReport> {
    const reportId = `SAF-${Math.floor(10000 + Math.random() * 90000)}`;

    if (mongoose.connection.readyState !== 1) {
      return {
        reportId,
        userId: payload.userId,
        farmId: payload.farmId,
        category: payload.category,
        feature: payload.feature,
        referenceId: payload.referenceId,
        description: payload.description,
        status: 'OPEN',
        severity: 'CRITICAL',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    const report = await ProductSafetyReport.create({
      reportId,
      userId: payload.userId,
      farmId: payload.farmId,
      category: payload.category,
      feature: payload.feature,
      referenceId: payload.referenceId,
      description: payload.description,
      status: 'OPEN',
      severity: 'CRITICAL'
    });

    return report;
  }

  /**
   * List open safety reports for admin product safety team
   */
  static async getOpenReports(): Promise<IProductSafetyReport[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return await ProductSafetyReport.find({ status: { $in: ['OPEN', 'INVESTIGATING'] } })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean() as any;
  }

  /**
   * Investigate & resolve safety report
   */
  static async updateReportStatus(reportId: string, status: SafetyStatus, internalActionTaken: string, investigatedBy: string): Promise<IProductSafetyReport | null> {
    if (mongoose.connection.readyState !== 1) return null;
    const report = await ProductSafetyReport.findOne({ reportId });
    if (!report) return null;

    report.status = status;
    report.internalActionTaken = internalActionTaken;
    report.investigatedBy = investigatedBy;

    await report.save();
    return report;
  }
}


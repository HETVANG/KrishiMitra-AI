import { DiseaseAnalysisService, DiseaseAnalysisResult } from './diseaseAnalysisService';
import { DiseaseRiskEngine, EnvironmentalRiskResult } from './diseaseRiskEngine';
import { DiseaseSeverityService } from './diseaseSeverityService';
import { DiseaseRecommendationService, ActionPlanItem } from './diseaseRecommendationService';
import { CloudinaryService } from '../CloudinaryService';
import { DiseaseHistory } from '../../models/DiseaseHistory';
import { Notification } from '../../models/Notification';
import { User } from '../../models/User';

export interface ComprehensiveDiseaseAssessment {
  id?: string;
  imageUri: string;
  crop: string;
  variety?: string;
  growthStage?: string;
  condition: string;
  diseaseName: string;
  localName: string;
  scientificName: string;
  confidence: 'low' | 'moderate' | 'high';
  confidenceScore: number;
  severity: 'low' | 'moderate' | 'high' | 'uncertain';
  symptoms: string[];
  evidence: Array<{ label: string; value: string }>;
  possibleCauses: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  pesticideDetails?: any;
  preventiveTips: string[];
  recommendedActions: ActionPlanItem[];
  environmentalContext: EnvironmentalRiskResult;
  limitations: string;
  chemicalSafetyNotice: string;
  followUpDate?: Date;
  followUpStatus?: string;
  progressionNote?: string;
  analyzedAt: Date;
}

export class DiseaseIntelligenceService {
  /**
   * Complete Advanced Disease Intelligence Pipeline:
   * Image Validation → Cloudinary Upload → Gemini Analysis → Env Context → Severity → Action Plan → Persistence → Alerts
   */
  static async processLeafScan(
    imageBuffer: Buffer,
    mimeType: string,
    context: {
      userId?: string;
      farmId?: string;
      crop?: string;
      variety?: string;
      growthStage?: string;
      farmerNotes?: string;
      language?: string;
    }
  ): Promise<ComprehensiveDiseaseAssessment> {
    // 1. Validate Image
    const validation = DiseaseAnalysisService.validateImageBuffer(imageBuffer, mimeType);
    if (!validation.valid) {
      throw new Error(validation.message || 'Invalid image file.');
    }

    // 2. Upload image to Cloudinary (or fallback empty string)
    let imageUri = '';
    try {
      imageUri = await CloudinaryService.uploadImageBuffer(imageBuffer, mimeType);
    } catch (uploadErr) {
      console.warn('[DiseaseIntelligenceService] Cloudinary upload warn:', uploadErr);
    }

    // 3. AI Multimodal Disease Analysis
    const analysis: DiseaseAnalysisResult = await DiseaseAnalysisService.analyzeLeafImage(
      imageBuffer,
      mimeType,
      {
        crop: context.crop,
        variety: context.variety,
        growthStage: context.growthStage,
        farmerNotes: context.farmerNotes,
        language: context.language || 'en'
      }
    );

    // 4. Environmental Risk Context Integration (Step 17 + Step 18)
    const envContext: EnvironmentalRiskResult = await DiseaseRiskEngine.evaluateEnvironmentalContext(
      context.userId,
      context.farmId
    );

    // 5. Severity Assessment
    const severity = DiseaseSeverityService.assessSeverity(analysis, envContext);

    // 6. Action Plan Generation
    const recommendedActions = DiseaseRecommendationService.generateActionPlan(
      analysis,
      severity,
      envContext,
      context.language || 'en'
    );

    // 7. Progression comparison with previous scan
    let previousScanId: string | undefined;
    let progressionNote: string | undefined;

    if (context.userId && context.crop) {
      try {
        const lastScan = await DiseaseHistory.findOne({
          user: context.userId,
          crop: context.crop
        }).sort({ createdAt: -1 });

        if (lastScan) {
          previousScanId = lastScan._id.toString();
          if (lastScan.diseaseName === analysis.diseaseName) {
            progressionNote = `Recurring symptom: ${analysis.diseaseName} was previously observed on this crop on ${new Date(lastScan.createdAt).toLocaleDateString()}.`;
          } else {
            progressionNote = `New observation: Previous scan on ${new Date(lastScan.createdAt).toLocaleDateString()} indicated "${lastScan.diseaseName}".`;
          }
        }
      } catch (histErr) {
        console.warn('[DiseaseIntelligenceService] Progression history check error:', histErr);
      }
    }

    // Default follow-up date calculation (e.g. 5 days for moderate, 2 days for high)
    const followUpDays = severity === 'high' ? 2 : severity === 'moderate' ? 5 : 7;
    const defaultFollowUpDate = new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000);

    // 8. Persist to MongoDB DiseaseHistory if user is authenticated
    let recordId: string | undefined;
    if (context.userId) {
      try {
        await User.findByIdAndUpdate(context.userId, { $inc: { scansUsedToday: 1 } });

        const historyDoc = await DiseaseHistory.create({
          user: context.userId,
          farm: context.farmId || undefined,
          crop: analysis.crop || context.crop,
          variety: context.variety,
          growthStage: context.growthStage,
          diseaseName: analysis.diseaseName,
          localName: analysis.localName,
          scientificName: analysis.scientificName,
          condition: analysis.condition,
          confidence: analysis.confidence,
          confidenceScore: analysis.confidenceScore,
          severity,
          imageUri,
          symptoms: analysis.symptoms,
          evidence: analysis.evidence,
          possibleCauses: analysis.possibleCauses,
          causes: analysis.possibleCauses,
          organicTreatment: analysis.organicTreatment,
          chemicalTreatment: analysis.chemicalTreatment,
          preventiveTips: analysis.preventiveTips,
          recommendedActions,
          pesticideDetails: analysis.pesticideDetails,
          environmentalContext: {
            temperature: envContext.temperature,
            humidity: envContext.humidity,
            rainProb: envContext.rainProb,
            soilMoisture: envContext.soilMoisture,
            favorabilityNote: envContext.favorabilityNote
          },
          limitations: analysis.limitations,
          chemicalSafetyNotice: analysis.chemicalSafetyNotice,
          followUpDate: defaultFollowUpDate,
          followUpStatus: 'scheduled',
          previousScan: previousScanId || undefined,
          progressionNote,
          farmerNotes: context.farmerNotes,
          language: context.language || 'en'
        });

        recordId = historyDoc._id.toString();

        // 9. Generate Notification Alert if High / Moderate severity
        if (severity === 'high' || severity === 'moderate') {
          await Notification.create({
            user: context.userId,
            title: `Disease Alert: ${analysis.diseaseName} (${severity.toUpperCase()})`,
            message: `Scan detected ${analysis.diseaseName} on ${analysis.crop || 'crop'}. Immediate field inspection recommended.`,
            type: 'disease',
            isRead: false
          });
        }
      } catch (dbErr) {
        console.error('[DiseaseIntelligenceService] Database save error:', dbErr);
      }
    }

    return {
      id: recordId,
      imageUri,
      crop: analysis.crop || context.crop || 'Crop Leaf',
      variety: context.variety,
      growthStage: context.growthStage,
      condition: analysis.condition,
      diseaseName: analysis.diseaseName,
      localName: analysis.localName,
      scientificName: analysis.scientificName,
      confidence: analysis.confidence,
      confidenceScore: analysis.confidenceScore,
      severity,
      symptoms: analysis.symptoms,
      evidence: analysis.evidence,
      possibleCauses: analysis.possibleCauses,
      organicTreatment: analysis.organicTreatment,
      chemicalTreatment: analysis.chemicalTreatment,
      pesticideDetails: analysis.pesticideDetails,
      preventiveTips: analysis.preventiveTips,
      recommendedActions,
      environmentalContext: envContext,
      limitations: analysis.limitations,
      chemicalSafetyNotice: analysis.chemicalSafetyNotice,
      followUpDate: defaultFollowUpDate,
      followUpStatus: 'scheduled',
      progressionNote,
      analyzedAt: new Date()
    };
  }

  /**
   * Schedule or update follow-up for a scan
   */
  static async scheduleFollowUp(
    userId: string,
    scanId: string,
    days: number,
    notes?: string
  ) {
    const followUpDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const updated = await DiseaseHistory.findOneAndUpdate(
      { _id: scanId, user: userId },
      {
        followUpDate,
        followUpStatus: 'scheduled',
        followUpNotes: notes || `Follow-up scheduled for ${days} days`
      },
      { new: true }
    );
    if (!updated) {
      throw new Error('Scan record not found or access denied.');
    }
    return updated;
  }
}

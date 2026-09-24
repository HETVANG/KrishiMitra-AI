import assert from 'assert';
import { ProductFeedbackService } from '../services/feedback/productFeedbackService';
import { SupportTicketService } from '../services/feedback/supportTicketService';
import { SafetyReportService } from '../services/feedback/safetyReportService';
import { FeatureRequestService } from '../services/feedback/featureRequestService';
import { UserResearchService } from '../services/feedback/userResearchService';

async function runStep42FarmerValidationTests() {
  console.log('--- STARTING STEP 42: REAL FARMER VALIDATION & CONTINUOUS IMPROVEMENT TESTS ---');

  const mockUserId = '507f1f77bcf86cd799439011';

  // 1. Central Product Feedback Architecture
  console.log('Test 1: Verifying Centralized Feedback Architecture & Classification...');
  const feedbackRes = await ProductFeedbackService.submitFeedback({
    userId: mockUserId,
    feature: 'disease_scan',
    type: 'INCORRECT_RESULT',
    rating: 2,
    message: 'The disease scanner misidentified early blight on tomato leaves as leaf curl.',
    language: 'en',
    region: 'IN'
  });

  assert.ok(feedbackRes, 'Feedback object returned');
  assert.strictEqual(feedbackRes.aiClassification.category, 'DATA_QUALITY');
  assert.ok(feedbackRes.aiClassification.confidence > 0.8, 'High classification confidence');
  console.log('✓ Centralized Feedback Architecture & Classification verified.');

  // 2. Farmer Support System & Priority Escalation
  console.log('\nTest 2: Verifying Support Ticket Pipeline & Critical Escalation...');
  const ticket = await SupportTicketService.createTicket({
    userId: mockUserId,
    category: 'PAYMENT',
    subject: 'Double charge on subscription checkout',
    description: 'Razorpay debited my account twice during plan renewal.'
  });

  assert.ok(ticket.ticketId.startsWith('TKT-'), 'Ticket ID generated with TKT prefix');
  assert.strictEqual(ticket.priority, 'CRITICAL', 'Payment issue automatically escalated to CRITICAL priority');
  assert.strictEqual(ticket.status, 'OPEN');
  assert.strictEqual(ticket.messages.length, 1);

  // Add agent message
  const updatedTicket = await SupportTicketService.addMessage(ticket.ticketId, mockUserId, 'We have initiated a refund for the duplicate transaction.', true);
  assert.strictEqual(updatedTicket?.status, 'IN_REVIEW', 'Ticket status updated to IN_REVIEW after support agent response');
  console.log('✓ Farmer Support System & Priority Escalation verified.');

  // 3. Agricultural AI Safety Hazard Reporting
  console.log('\nTest 3: Verifying Agricultural AI Safety Hazard Reporting...');
  const safetyReport = await SafetyReportService.submitReport({
    userId: mockUserId,
    category: 'UNSAFE_DOSAGE',
    feature: 'copilot',
    description: 'Copilot suggested 10x recommended pesticide concentration for cotton crop.'
  });

  assert.ok(safetyReport.reportId.startsWith('SAF-'), 'Safety report ID generated with SAF prefix');
  assert.strictEqual(safetyReport.severity, 'CRITICAL', 'Safety hazard flagged as CRITICAL');
  assert.strictEqual(safetyReport.status, 'OPEN');
  console.log('✓ Agricultural AI Safety Hazard Reporting verified.');

  // 4. Feature Request & Duplicate Detection System
  console.log('\nTest 4: Verifying Feature Request Pipeline & Upvoting...');
  const featReq = await FeatureRequestService.createRequest({
    userId: mockUserId,
    title: 'Offline Bluetooth Sensor Sync for Soil Moisture',
    description: 'Allow syncing Bluetooth soil sensors without active internet connection.',
    category: 'IRRIGATION',
    region: 'IN'
  });

  assert.ok(featReq.request, 'Feature request created');
  assert.strictEqual(featReq.request.status, 'SUBMITTED');

  // Upvote feature request
  const upvoted = await FeatureRequestService.upvoteRequest(featReq.request._id, '507f1f77bcf86cd799439099');
  assert.strictEqual(upvoted.upvotes, 2, 'Upvote count incremented');
  console.log('✓ Feature Request Pipeline & Upvoting verified.');

  // 5. User Research & Participant Consent
  console.log('\nTest 5: Verifying User Research Participant Consent & Withdrawal...');
  const participant = await UserResearchService.registerParticipant({
    userId: mockUserId,
    name: 'Ramesh Patel',
    phone: '+919876543210',
    region: 'IN',
    cropsGrown: ['Cotton', 'Groundnut'],
    consentGiven: true,
    consentScope: 'Usability testing and workflow feedback'
  });

  assert.strictEqual(participant.consentGiven, true);
  assert.strictEqual(participant.status, 'ACTIVE');

  // Log interview
  const interview = await UserResearchService.logInterview({
    participantId: participant._id,
    interviewer: 'KrishiMitra Product Specialist',
    workflowObserved: 'Market price check and disease scan upload',
    keyObservations: ['Farmer found market comparison table very clear', 'Audio search preferred over typing'],
    quotes: ['Voice command in Gujarati makes checking mandi prices very fast'],
    notes: 'Participant interested in follow-up research for irrigation automation.'
  });

  assert.strictEqual(interview.interviewer, 'KrishiMitra Product Specialist');

  // Withdraw consent
  const withdrawn = await UserResearchService.withdrawConsent(participant._id);
  assert.strictEqual(withdrawn.status, 'WITHDRAWN');
  assert.strictEqual(withdrawn.consentGiven, false);
  console.log('✓ User Research Participant Consent & Withdrawal verified.');

  // 6. Knowledge Gaps & Regional Gaps Aggregation
  console.log('\nTest 6: Verifying Knowledge Gaps & Regional Gaps Aggregation...');
  const knowledgeGaps = await ProductFeedbackService.getKnowledgeGaps();
  assert.ok(Array.isArray(knowledgeGaps), 'Knowledge gaps returned as array');

  const regionalGaps = await ProductFeedbackService.getRegionalGaps();
  assert.ok(regionalGaps.length >= 3, 'Regional gaps returned for unsupported countries');
  console.log('✓ Knowledge Gaps & Regional Gaps Aggregation verified.');

  console.log('\n=============================================================');
  console.log('🎉 ALL STEP 42 REAL FARMER VALIDATION TESTS PASSED CLEANLY! 🎉');
  console.log('=============================================================\n');
}

runStep42FarmerValidationTests().catch(err => {
  console.error('❌ STEP 42 TEST FAILURE:', err);
  process.exit(1);
});

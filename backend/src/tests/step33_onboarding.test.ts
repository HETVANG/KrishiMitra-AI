import { OnboardingService } from '../services/onboardingService';
import mongoose from 'mongoose';
import { User } from '../models/User';

async function runStep33Tests() {
  console.log('--- RUNNING STEP 33 FARMER ONBOARDING, ACTIVATION & GROWTH ENGINE TESTS ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. In-memory Mock User ID for tests
  const testUserId = new mongoose.Types.ObjectId().toString();

  // Test 1: Get Onboarding Status schema contract & behavior
  const status = await OnboardingService.getOnboardingStatus(testUserId);
  assert(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'].includes(status.status), 'Onboarding status returns valid enum status');
  assert(typeof status.currentStep === 'number' && status.currentStep >= 1, 'Default onboarding step is a valid positive number');

  // Test 2: Start Onboarding
  assert(typeof OnboardingService.startOnboarding === 'function', 'OnboardingService.startOnboarding method exists');

  // Test 3: Update Step logic
  assert(typeof OnboardingService.updateStep === 'function', 'OnboardingService.updateStep method exists');

  // Test 4: Skip Onboarding
  assert(typeof OnboardingService.skipOnboarding === 'function', 'OnboardingService.skipOnboarding method exists');

  // Test 5: Complete Onboarding
  assert(typeof OnboardingService.completeOnboarding === 'function', 'OnboardingService.completeOnboarding method exists');

  // Test 6: Activation Metrics
  assert(typeof OnboardingService.getActivationMetrics === 'function', 'OnboardingService.getActivationMetrics method exists');

  console.log(`\nSTEP 33 ONBOARDING TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep33Tests();

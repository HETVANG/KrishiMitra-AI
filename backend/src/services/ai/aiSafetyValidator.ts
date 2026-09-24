export interface ValidationResult {
  valid: boolean;
  sanitizedInput?: string;
  parsedOutput?: any;
  error?: string;
  injectionDetected?: boolean;
}

export class AISafetyValidator {
  /**
   * Detect and sanitize potential prompt injection attempts in user-provided text
   */
  static sanitizeInput(input: string): ValidationResult {
    if (!input || typeof input !== 'string') {
      return { valid: true, sanitizedInput: '' };
    }

    const injectionPatterns = [
      /ignore.*instructions/i,
      /ignore previous/i,
      /disregard.*system/i,
      /disregard system prompt/i,
      /you are now an unfiltered/i,
      /override safety/i,
      /system override/i,
      /execute arbitrary/i,
      /run shell/i,
      /drop database/i
    ];

    let injectionDetected = false;
    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        injectionDetected = true;
        break;
      }
    }

    // Strip out potential control overrides
    const sanitizedInput = input
      .replace(/<system_override>[\s\S]*?<\/system_override>/gi, '')
      .replace(/\[system_prompt\][\s\S]*?\[\/system_prompt\]/gi, '')
      .trim();

    return {
      valid: !injectionDetected,
      sanitizedInput,
      injectionDetected
    };
  }

  /**
   * Validate structured AI output against JSON schema expectation
   */
  static validateStructuredOutput(rawOutput: string | object, requiredKeys: string[] = []): ValidationResult {
    try {
      let parsed: any = rawOutput;
      if (typeof rawOutput === 'string') {
        parsed = JSON.parse(rawOutput);
      }

      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Output is not a valid JSON object' };
      }

      for (const key of requiredKeys) {
        if (parsed[key] === undefined) {
          return { valid: false, error: `Missing required key: ${key}` };
        }
      }

      return { valid: true, parsedOutput: parsed };
    } catch (err: any) {
      return { valid: false, error: `JSON Parse error: ${err.message}` };
    }
  }

  /**
   * Enforce agricultural safety rules for chemical & pesticide advisory
   */
  static validateAgriculturalSafety(recommendationText: string): { safe: boolean; warning?: string } {
    if (!recommendationText) return { safe: true };

    const dangerousKeywords = [
      '10x dosage',
      'concentrated spray',
      'unlabeled chemical',
      'banned pesticide'
    ];

    for (const kw of dangerousKeywords) {
      if (recommendationText.toLowerCase().includes(kw)) {
        return {
          safe: false,
          warning: `Recommendation contained unsafe agricultural term: "${kw}"`
        };
      }
    }

    return { safe: true };
  }
}

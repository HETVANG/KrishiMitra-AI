export interface EnvVariableSpec {
  name: string;
  category: 'REQUIRED' | 'OPTIONAL' | 'FEATURE_SPECIFIC';
  description: string;
  isSecret: boolean;
}

export interface EnvValidationReport {
  timestamp: string;
  environment: string;
  isValid: boolean;
  missingRequired: string[];
  variables: Record<string, {
    category: string;
    configured: boolean;
    maskedValue: string;
    description: string;
  }>;
}

export const ENV_SPECS: EnvVariableSpec[] = [
  // Required core system variables
  { name: 'MONGODB_URI', category: 'REQUIRED', description: 'MongoDB connection string', isSecret: true },
  { name: 'JWT_SECRET', category: 'REQUIRED', description: 'JSON Web Token signing secret', isSecret: true },

  // Optional server variables
  { name: 'PORT', category: 'OPTIONAL', description: 'API Server HTTP port (default 5000)', isSecret: false },
  { name: 'NODE_ENV', category: 'OPTIONAL', description: 'Node environment (development/production/test)', isSecret: false },
  { name: 'CLIENT_URL', category: 'OPTIONAL', description: 'Frontend URL for CORS origins', isSecret: false },

  // Feature-Specific External Providers
  { name: 'GEMINI_API_KEY', category: 'FEATURE_SPECIFIC', description: 'Google Gemini AI API Key', isSecret: true },
  { name: 'OPENWEATHER_API_KEY', category: 'FEATURE_SPECIFIC', description: 'OpenWeather API Key for live weather', isSecret: true },
  { name: 'CLOUDINARY_CLOUD_NAME', category: 'FEATURE_SPECIFIC', description: 'Cloudinary Cloud Name for media uploads', isSecret: false },
  { name: 'CLOUDINARY_API_KEY', category: 'FEATURE_SPECIFIC', description: 'Cloudinary API Key', isSecret: true },
  { name: 'CLOUDINARY_API_SECRET', category: 'FEATURE_SPECIFIC', description: 'Cloudinary API Secret', isSecret: true },
  { name: 'RAZORPAY_KEY_ID', category: 'FEATURE_SPECIFIC', description: 'Razorpay Public Key ID', isSecret: false },
  { name: 'RAZORPAY_KEY_SECRET', category: 'FEATURE_SPECIFIC', description: 'Razorpay Key Secret', isSecret: true },
  { name: 'GOOGLE_MAPS_API_KEY', category: 'FEATURE_SPECIFIC', description: 'Google Maps API Key', isSecret: true }
];

export class EnvValidator {
  private static maskSecret(value: string | undefined, isSecret: boolean): string {
    if (!value) return '[NOT_CONFIGURED]';
    if (!isSecret) return value;
    if (value.length <= 8) return '[CONFIGURED]';
    return `[CONFIGURED - ${value.slice(0, 3)}...${value.slice(-3)} (${value.length} chars)]`;
  }

  public static validateEnvironment(): EnvValidationReport {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const missingRequired: string[] = [];
    const variables: EnvValidationReport['variables'] = {};

    for (const spec of ENV_SPECS) {
      const val = process.env[spec.name];
      const isConfigured = Boolean(val && val.trim().length > 0);

      if (spec.category === 'REQUIRED' && !isConfigured) {
        missingRequired.push(spec.name);
      }

      variables[spec.name] = {
        category: spec.category,
        configured: isConfigured,
        maskedValue: this.maskSecret(val, spec.isSecret),
        description: spec.description
      };
    }

    const isValid = missingRequired.length === 0;

    return {
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      isValid,
      missingRequired,
      variables
    };
  }

  public static auditStartup(): EnvValidationReport {
    const report = this.validateEnvironment();
    console.info(`[EnvValidator] Executing startup environment validation (${report.environment})...`);
    
    if (!report.isValid) {
      console.error(`[EnvValidator CRITICAL] Missing REQUIRED environment variables: ${report.missingRequired.join(', ')}`);
      if (report.environment === 'production') {
        throw new Error(`Fatal Environment Error: Missing required variables [${report.missingRequired.join(', ')}] in production mode.`);
      }
    } else {
      console.info('[EnvValidator PASS] All REQUIRED environment variables are present.');
    }

    // Print non-sensitive summary
    console.info('[EnvValidator Audit Summary]:');
    for (const [key, details] of Object.entries(report.variables)) {
      console.info(`  - ${key} (${details.category}): ${details.maskedValue}`);
    }

    return report;
  }
}

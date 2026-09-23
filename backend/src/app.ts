import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

// Import Routers
import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import diseaseRoutes from './routes/diseaseRoutes';
import weatherRoutes from './routes/weatherRoutes';
import marketRoutes from './routes/marketRoutes';
import expenseRoutes from './routes/expenseRoutes';
import forumRoutes from './routes/forumRoutes';
import communityRoutes from './routes/communityRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import reportRoutes from './routes/reportRoutes';
import schemeRoutes from './routes/schemeRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import billingRoutes from './routes/billingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import videoConsultationRoutes from './routes/videoConsultationRoutes';
import copilotRoutes from './routes/copilotRoutes';
import predictiveRoutes from './routes/predictiveRoutes';
import irrigationRoutes from './routes/irrigationRoutes';
import cropCycleRoutes from './routes/cropCycleRoutes';
import agentRoutes from './routes/agentRoutes';
import regionRoutes from './routes/regionRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';
import knowledgeGraphRoutes from './routes/knowledgeGraphRoutes';
import decisionRoutes from './routes/decisionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import proactiveRoutes from './routes/proactiveRoutes';
import multiFarmRoutes from './routes/multiFarmRoutes';
import organizationRoutes from './routes/organizationRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import providerRoutes from './routes/providerRoutes';
import partnerRoutes from './routes/partnerRoutes';
import productIntelligenceRoutes from './routes/productIntelligenceRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import { requestIdMiddleware } from './middleware/requestIdMiddleware';
import { ObservabilityService } from './services/observabilityService';
import { AgentOrchestrator } from './services/agents/agentOrchestrator';
import { authenticate } from './middleware/auth';
import { PaymentController } from './controllers/PaymentController';

// Initialize Agent Orchestrator event listeners
AgentOrchestrator.init();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(requestIdMiddleware);
app.use(cors({
  origin: '*', // For development. Change to specific domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiter to guard against DOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Binding Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/predictions', predictiveRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/crop-cycles', cropCycleRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/knowledge-graph', knowledgeGraphRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/proactive', proactiveRoutes);
app.use('/api', multiFarmRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin/providers', providerRoutes);
app.use('/api/admin/partners', partnerRoutes);
app.use('/api/product-intelligence', productIntelligenceRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.post('/api/create-order', authenticate, PaymentController.createOrder);
app.post('/api/verify-payment', authenticate, PaymentController.verify);
app.use('/api/admin', adminRoutes);
app.use('/api/video-consultation', videoConsultationRoutes);

// Production Health & Observability Endpoints
app.get('/health', (req, res) => {
  const telemetry = ObservabilityService.getTelemetry();
  res.json({ success: true, telemetry });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'live', uptime: process.uptime(), timestamp: new Date() });
});

app.get('/health/ready', (req, res) => {
  const telemetry = ObservabilityService.getTelemetry();
  if (telemetry.status === 'UNAVAILABLE') {
    return res.status(503).json({ status: 'not_ready', telemetry });
  }
  res.status(200).json({ status: 'ready', telemetry });
});

// Centralized error handler
app.use(errorHandler);

export default app;

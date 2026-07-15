import { Router } from 'express';
import { WeatherController } from '../controllers/WeatherController';

const router = Router();

router.get('/', WeatherController.getWeather);

export default router;

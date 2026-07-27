import { Router } from 'express';
import { WeatherController } from '../controllers/WeatherController';

const router = Router();

router.get('/', WeatherController.getWeather);
router.get('/reverse-geocode', WeatherController.reverseGeocode);
router.get('/geocode', WeatherController.geocode);

export default router;

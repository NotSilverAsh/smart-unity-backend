# NASA Weather Forecast API 🌤️

A backend service that provides weather forecast data using NASA's satellite and climate data sources.  
Built with **Express.js** for the frontend weather application.

---

⚠️ **Warning**: This API uses external NASA data sources and climate models.  
Weather forecasts may not always be accurate or up to date.  
Do not rely on this data for safety-critical decisions.

---

## 🚀 Features

- **Multiple NASA Data Sources**: POWER API, GMAO Forecast, Worldview Satellite Data  
- **Smart Fallback System**: Automatically switches between data sources when one fails  
- **Desert Climate Detection**: Specialized weather calculations for desert regions  
- **Probability Calculations**: Weather event probabilities based on historical data  
- **Data Export**: Download weather data in CSV or JSON format  
- **Real-time Weather Conditions**: Current weather with feels-like temperature  
- **7-Day Forecast**: Extended weather predictions  

---

## 📡 Data Sources

1. **NASA POWER API** – Primary data source for satellite and model data  
2. **NASA GMAO** – Global Modeling and Assimilation Office forecasts  
3. **NASA Worldview** – Satellite imagery and derived data  
4. **Climate Model Simulation** – Fallback simulation based on NASA climate models  

---

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### 🔧 Environment

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
```

---

## 🎯 API Endpoints

### Get Weather Forecast
```http
GET /api/v1/weather?lat={latitude}&lon={longitude}
```

**Parameters:**
- `lat` (required): Latitude coordinate (-90 to 90)  
- `lon` (required): Longitude coordinate (-180 to 180)  
- `thresholds` (optional): JSON string for probability calculations  

**Example (frontend usage):**
```javascript
const response = await fetch('/api/v1/weather?lat=40.7128&lon=-74.0060');
const weatherData = await response.json();
```

---

### Download Weather Data
```http
GET /api/v1/weather/download?lat={latitude}&lon={longitude}&format={csv|json}
```

---

## 📊 Response Format

```json
{
  "current": {
    "temperature": 22.5,
    "feels_like": 23.1,
    "humidity": "65%",
    "wind_speed": 3.2,
    "pressure": 1013.2,
    "conditions": "Clear Sky"
  },
  "forecast": [
    {
      "date": "2024-01-15",
      "temperature": 23.1,
      "max_temp": 26.5,
      "min_temp": 18.7,
      "precipitation": 0.0,
      "conditions": "Partly Cloudy"
    }
  ],
  "location": "New York, NY, USA",
  "data_source": "NASA POWER API",
  "units": {
    "temperature": "°C",
    "humidity": "%",
    "wind_speed": "m/s",
    "precipitation": "mm",
    "pressure": "hPa"
  }
}
```

---

## 🏜️ Desert Regions

Automatically detects and provides specialized calculations for:  
- Sahara, Arabian, Gobi Deserts  
- Australian, North American Deserts  
- Kalahari, Thar, Syrian Deserts  

---

## 📈 Probability Calculations

```javascript
// Get probabilities for specific thresholds
const thresholds = {
  temperature: 25,
  precipitation: 5,
  windSpeed: 10
};

const response = await fetch(
  `/api/v1/weather?lat=40.7128&lon=-74.0060&thresholds=${JSON.stringify(thresholds)}`
);
```

---

## 🐛 Debugging

The API provides color-coded console logging:  
- 🔵 Blue: API attempts  
- 🟡 Yellow: Warnings and fallbacks  
- 🟢 Green: Success responses  
- 🔴 Red: Errors  
- 🟣 Purple: Debug information  

---

## 📦 Dependencies

- `express` – Web server framework  
- `chalk` – Terminal string styling  

---

## 🚨 Error Handling

- **400**: Missing required parameters  
- **Graceful Fallbacks**: Automatic fallback to simulation data if APIs fail  

---

## 📝 Frontend Integration

```javascript
// Example frontend usage
async function getWeather(lat, lon) {
  try {
    const response = await fetch(`/api/v1/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Weather data fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}
```

---

> **Note**: This API is designed specifically for the frontend weather application and relies on external NASA services.

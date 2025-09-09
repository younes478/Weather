const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const forecast = document.getElementById('forecast');

// Event listeners
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === '10dacf08c11cd5f441f73f1415589408') {
        getWeather();
    }
});

// Get current location weather on page load
window.addEventListener('load', getCurrentLocationWeather);

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        showLoading();
        
        // Get current weather
        const currentWeather = await fetchWeatherData(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        
        // Get 5-day forecast
        const forecastData = await fetchWeatherData(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        
        displayCurrentWeather(currentWeather);
        displayForecast(forecastData);
        
    } catch (error) {
        showError('City not found. Please check the spelling and try again.');
    }
}

async function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const currentWeather = await fetchWeatherData(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                const forecastData = await fetchWeatherData(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                
                displayCurrentWeather(currentWeather);
                displayForecast(forecastData);
                
            } catch (error) {
                console.log('Error getting location weather:', error);
            }
        });
    }
}

async function fetchWeatherData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Weather data not found');
    }
    return await response.json();
}

function displayCurrentWeather(data) {
    const { name, main, weather, wind, visibility } = data;
    
    weatherInfo.innerHTML = `
        <h2>${name}, ${data.sys.country}</h2>
        <div class="weather-main">
            <div class="temperature">${Math.round(main.temp)}°C</div>
            <div>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
                <p>${weather[0].description}</p>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail-item">
                <h4>Feels Like</h4>
                <p>${Math.round(main.feels_like)}°C</p>
            </div>
            <div class="detail-item">
                <h4>Humidity</h4>
                <p>${main.humidity}%</p>
            </div>
            <div class="detail-item">
                <h4>Wind Speed</h4>
                <p>${wind.speed} m/s</p>
            </div>
            <div class="detail-item">
                <h4>Pressure</h4>
                <p>${main.pressure} hPa</p>
            </div>
            <div class="detail-item">
                <h4>Visibility</h4>
                <p>${visibility / 1000} km</p>
            </div>
            <div class="detail-item">
                <h4>Min/Max</h4>
                <p>${Math.round(main.temp_min)}°/${Math.round(main.temp_max)}°C</p>
            </div>
        </div>
    `;
    
    weatherInfo.classList.remove('hidden');
}

function displayForecast(data) {
    // Get one forecast per day (every 8th item = 24 hours later)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    forecast.innerHTML = dailyForecasts.map(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        return `
            <div class="forecast-item">
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p>${Math.round(item.main.temp)}°C</p>
                <p>${item.weather[0].description}</p>
            </div>
        `;
    }).join('');
    
    forecast.classList.remove('hidden');
}

function showLoading() {
    weatherInfo.innerHTML = '<p>Loading weather data...</p>';
    weatherInfo.classList.remove('hidden');
    forecast.classList.add('hidden');
}

function showError(message) {
    weatherInfo.innerHTML = `<div class="error">${message}</div>`;
    weatherInfo.classList.remove('hidden');
    forecast.classList.add('hidden');
}
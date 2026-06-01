 const API_KEY = 'a9f4b92312c21ad95dfbe68dfe198ff1';
    const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

    // Weather condition → emoji mapping
    function getWeatherEmoji(code) {
      if (code >= 200 && code < 300) return '⛈️';
      if (code >= 300 && code < 400) return '🌦️';
      if (code >= 500 && code < 600) return '🌧️';
      if (code >= 600 && code < 700) return '❄️';
      if (code >= 700 && code < 800) return '🌫️';
      if (code === 800) return '☀️';
      if (code === 801) return '🌤️';
      if (code === 802) return '⛅';
      if (code >= 803) return '☁️';
      return '🌡️';
    }

    // Unix timestamp → HH:MM format
    function formatTime(unix, offset) {
      const date = new Date((unix + offset) * 1000);
      const h = String(date.getUTCHours()).padStart(2, '0');
      const m = String(date.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }

    function showError(msg) {
      const el = document.getElementById('errorMsg');
      el.textContent = msg;
      el.style.display = 'block';
      document.getElementById('weatherCard').style.display = 'none';
    }

    function hideError() {
      document.getElementById('errorMsg').style.display = 'none';
    }

    function showLoader(show) {
      document.getElementById('loader').style.display = show ? 'block' : 'none';
    }

    async function fetchWeather(lat = null, lon = null) {
      hideError();
      showLoader(true);
      document.getElementById('weatherCard').style.display = 'none';

      let url;
      if (lat && lon) {
        url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      } else {
        const city = document.getElementById('cityInput').value.trim();
        if (!city) { showLoader(false); showError('Please enter a city name!'); return; }
        url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod !== 200) {
          showLoader(false);
          showError(`City not found! Please check the spelling and try again.`);
          return;
        }

        updateUI(data);
        showLoader(false);
        document.getElementById('weatherCard').style.display = 'flex';

      } catch (err) {
        showLoader(false);
        showError('Network error. Please check your internet connection.');
      }
    }

    function updateUI(data) {
      const { name, sys, weather, main, wind, visibility, timezone } = data;

      // Main info
      document.getElementById('cityName').textContent = name;
      document.getElementById('countryName').textContent = `${sys.country} 🌍`;
      document.getElementById('weatherIcon').textContent = getWeatherEmoji(weather[0].id);
      document.getElementById('temperature').textContent = `${Math.round(main.temp)}°C`;
      document.getElementById('feelsLike').textContent = `Feels like ${Math.round(main.feels_like)}°C`;
      document.getElementById('condition').textContent = weather[0].description;

      // Stats
      document.getElementById('humidity').textContent = `${main.humidity}%`;
      document.getElementById('windSpeed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
      document.getElementById('visibility').textContent = visibility ? `${(visibility / 1000).toFixed(1)} km` : 'N/A';
      document.getElementById('pressure').textContent = `${main.pressure} hPa`;

      // Sun times
      document.getElementById('sunrise').textContent = formatTime(sys.sunrise, timezone);
      document.getElementById('sunset').textContent = formatTime(sys.sunset, timezone);

      // Date & time
      const now = new Date();
      document.getElementById('datetime').textContent =
        now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
        ' • ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    function getLocation() {
      if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
      }
      showLoader(true);
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => { showLoader(false); showError('Location access denied. Please search manually.'); }
      );
    }

    // Auto load Hyderabad on page open
    window.onload = () => {
      document.getElementById('cityInput').value = 'Hyderabad';
      fetchWeather();
    };
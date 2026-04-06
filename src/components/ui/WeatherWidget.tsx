import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WeatherWidgetProps {
  backgroundImage?: string;
  address?: string | null;
}

interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  feelsLike: string;
  humidity: string;
  windSpeed: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ }) => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    location: 'Loading...',
    temperature: '--°C',
    condition: 'Loading...',
    feelsLike: '--°C',
    humidity: '--%',
    windSpeed: '-- km/h'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const locationQuery = 'Sousse, Tunisia';

        const response = await fetch(`https://wttr.in/${encodeURIComponent(locationQuery)}?format=j1`);
        const data = await response.json();

        if (data && data.current_condition && data.current_condition[0]) {
          const current = data.current_condition[0];

          setWeather({
            location: 'Sousse, Tunisia',
            temperature: `${current.temp_C}°C`,
            condition: current.weatherDesc?.[0]?.value || 'N/A',
            feelsLike: `${current.FeelsLikeC}°C`,
            humidity: `${current.humidity}%`,
            windSpeed: `${current.windspeedKmph} km/h`
          });
        }
      } catch (error) {
        setWeather({
          location: 'Sousse, Tunisia',
          temperature: '55°C',
          condition: 'Sunny',
          feelsLike: '26°C',
          humidity: '45%',
          windSpeed: '12 km/h'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  return (
    <div
      className="rounded-2xl shadow-sm relative overflow-hidden text-white h-full min-h-[180px]"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/images/weather-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative p-5 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-medium tracking-tight">{weather.location}</p>
            <div className="flex items-center space-x-2">
              <p className="text-4xl font-medium">{weather.temperature}</p>
              <p className="text-sm font-medium opacity-80">{weather.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-medium opacity-90" suppressHydrationWarning>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="font-medium tracking-tighter opacity-80" suppressHydrationWarning>
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="font-medium tracking-widest opacity-80">Feeling</p>
            <p className="text-sm font-medium">{weather.feelsLike}</p>
          </div>
          <div>
            <p className="font-medium tracking-widest opacity-80">Humidity</p>
            <p className="text-sm font-medium">{weather.humidity}</p>
          </div>
          <div>
            <p className="font-medium tracking-widest opacity-80">Wind</p>
            <p className="text-sm font-medium">{weather.windSpeed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
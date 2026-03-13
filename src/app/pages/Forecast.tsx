import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, Wind, ArrowLeft, CheckCircle, AlertTriangle, Info, XCircle, Sun, Home as HomeIcon } from 'lucide-react';
import malaysiaCities from '../../imports/malaysia-cities-1.json';

// Group stations by state and sort
const groupedStations = malaysiaCities.reduce((acc, station) => {
  if (!acc[station.state]) {
    acc[station.state] = [];
  }
  acc[station.state].push(station);
  return acc;
}, {} as Record<string, typeof malaysiaCities>);

// Sort states alphabetically
const sortedStates = Object.keys(groupedStations).sort();

// Sort stations within each state
sortedStates.forEach(state => {
  groupedStations[state].sort((a, b) => a.name.localeCompare(b.name));
});

// Air quality data for Malaysian cities
const airQualityData: { [key: string]: { aqi: number; level: string; pollutant: string } } = {
  'Kuala Lumpur': { aqi: 68, level: 'Moderate', pollutant: 'PM2.5' },
  'Penang': { aqi: 42, level: 'Low', pollutant: 'PM10' },
  'Johor Bahru': { aqi: 85, level: 'Moderate', pollutant: 'PM2.5' },
  'Ipoh': { aqi: 38, level: 'Low', pollutant: 'PM10' },
  'Kuching': { aqi: 125, level: 'High', pollutant: 'PM2.5' },
  'Kota Kinabalu': { aqi: 35, level: 'Low', pollutant: 'O3' },
  'Melaka': { aqi: 55, level: 'Moderate', pollutant: 'PM10' },
  'Shah Alam': { aqi: 45, level: 'Low', pollutant: 'PM2.5' },
  'Petaling Jaya': { aqi: 52, level: 'Moderate', pollutant: 'PM2.5' },
  'Klang': { aqi: 48, level: 'Low', pollutant: 'PM2.5' },
};

// Tomorrow's forecast data
const tomorrowForecastData: { [key: string]: { aqi: number; level: string; pollutant: string; available: boolean } } = {
  'Kuala Lumpur': { aqi: 62, level: 'Moderate', pollutant: 'PM2.5', available: true },
  'Penang': { aqi: 38, level: 'Low', pollutant: 'PM10', available: true },
  'Johor Bahru': { aqi: 78, level: 'Moderate', pollutant: 'PM2.5', available: true },
  'Ipoh': { aqi: 35, level: 'Low', pollutant: 'PM10', available: true },
  'Kuching': { aqi: 110, level: 'High', pollutant: 'PM2.5', available: true },
  'Kota Kinabalu': { aqi: 32, level: 'Low', pollutant: 'O3', available: true },
  'Melaka': { aqi: 0, level: '', pollutant: '', available: false },
  'Shah Alam': { aqi: 42, level: 'Low', pollutant: 'PM2.5', available: true },
  'Petaling Jaya': { aqi: 48, level: 'Low', pollutant: 'PM2.5', available: true },
  'Klang': { aqi: 45, level: 'Low', pollutant: 'PM2.5', available: true },
};

export default function Forecast() {
  const [currentLocation, setCurrentLocation] = useState('Kuala Lumpur');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [currentData, setCurrentData] = useState<{
    aqi: number | string;
    level: string;
    pollutant: string;
    cityName: string;
    lastUpdated: string;
  }>({
    aqi: '0000',
    level: '',
    pollutant: '0000',
    cityName: '0000',
    lastUpdated: '0000'
  });
  const [tomorrowData, setTomorrowData] = useState<{
    aqi: number | string;
    level: string;
    pollutant: string;
    available: boolean;
  }>({
    aqi: '0000',
    level: '',
    pollutant: '0000',
    available: false
  });
  
  const cities = Object.keys(airQualityData);
  
  // Helper function to determine AQI level based on value
  const getAQILevel = (aqi: number): string => {
    if (aqi >= 0 && aqi <= 50) return 'Low';
    if (aqi >= 51 && aqi <= 100) return 'Moderate';
    if (aqi > 100) return 'High';
    return '';
  };
  
  // Helper function to extract main pollutant from API data
  const getMainPollutant = (apiData: any): string => {
    if (!apiData.iaqi) return 'PM2.5';
    
    const pollutants = apiData.iaqi;
    const pollutantValues: { [key: string]: number } = {};
    
    if (pollutants.pm25?.v !== undefined) pollutantValues['PM2.5'] = pollutants.pm25.v;
    if (pollutants.pm10?.v !== undefined) pollutantValues['PM10'] = pollutants.pm10.v;
    if (pollutants.o3?.v !== undefined) pollutantValues['O3'] = pollutants.o3.v;
    if (pollutants.no2?.v !== undefined) pollutantValues['NO2'] = pollutants.no2.v;
    if (pollutants.so2?.v !== undefined) pollutantValues['SO2'] = pollutantValues.so2.v;
    if (pollutants.co?.v !== undefined) pollutantValues['CO'] = pollutants.co.v;
    
    if (Object.keys(pollutantValues).length === 0) return 'PM2.5';
    
    // Find the pollutant with highest value
    const mainPollutant = Object.keys(pollutantValues).reduce((a, b) => 
      pollutantValues[a] > pollutantValues[b] ? a : b
    );
    
    return mainPollutant;
  };
  
  // Handle location change and call WAQI API
  const handleLocationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocationName = e.target.value;
    setCurrentLocation(selectedLocationName);
    
    // Find the selected station from malaysiaCities array
    const selectedStation = malaysiaCities.find(station => station.name === selectedLocationName);
    
    if (!selectedStation) {
      setApiStatus('error');
      return;
    }
    
    const { lat, lon, name } = selectedStation;
    
    setApiStatus('loading');
    
    try {
      // Call WAQI API with latitude and longitude
      const apiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=0432e9941dd9474b614b0a70d5f5b285374c822a`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('Forecast Location change API call');
      console.log('Selected:', name);
      console.log('Full API Response:', data);
      
      if (data.status === 'ok' && data.data) {
        const apiAqi = data.data.aqi !== undefined ? data.data.aqi : '0000';
        const apiCity = data.data.city?.name || '0000';
        const apiTime = data.data.time?.iso || '0000';
        const apiUid = data.data.idx; // Station UID from API
        const mainPollutant = getMainPollutant(data.data);
        
        console.log('AQI:', apiAqi);
        console.log('City:', apiCity);
        console.log('UID:', apiUid);
        console.log('Last Updated:', apiTime);
        console.log('Main Pollutant:', mainPollutant);
        
        // Find the matching station by uid
        const matchingStation = malaysiaCities.find(station => station.uid === apiUid);
        
        if (matchingStation) {
          console.log('Matching station found:', matchingStation.name);
          // Set dropdown to the station returned by API (based on UID)
          setCurrentLocation(matchingStation.name);
        } else {
          console.log('No matching station found for UID:', apiUid);
          // Keep the selected location if no match found
        }
        
        // Update current data with API data
        setCurrentData({
          aqi: apiAqi,
          level: typeof apiAqi === 'number' ? getAQILevel(apiAqi) : '',
          pollutant: mainPollutant,
          cityName: apiCity,
          lastUpdated: apiTime
        });
        
        // Check if forecast data is available
        if (data.data.forecast && data.data.forecast.daily) {
          const dailyForecast = data.data.forecast.daily;
          
          // Get tomorrow's forecast (index 1 if available)
          if (dailyForecast.pm25 && dailyForecast.pm25.length > 1) {
            const tomorrowPM25 = dailyForecast.pm25[1];
            const tomorrowAqi = tomorrowPM25.avg || '0000';
            
            console.log('Tomorrow AQI:', tomorrowAqi);
            
            setTomorrowData({
              aqi: tomorrowAqi,
              level: typeof tomorrowAqi === 'number' ? getAQILevel(tomorrowAqi) : '',
              pollutant: 'PM2.5',
              available: true
            });
          } else {
            setTomorrowData({
              aqi: '0000',
              level: '',
              pollutant: '0000',
              available: false
            });
          }
        } else {
          setTomorrowData({
            aqi: '0000',
            level: '',
            pollutant: '0000',
            available: false
          });
        }
        
        setApiStatus('success');
      } else {
        console.log('API returned non-ok status:', data.status);
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Failed to fetch air quality data', error);
      setApiStatus('error');
    }
  };
  
  useEffect(() => {
    // Call API on component mount using geolocation endpoint
    const fetchInitialData = async () => {
      setApiStatus('loading');
      
      try {
        // Call WAQI API with geolocation (here) endpoint
        const apiUrl = 'https://api.waqi.info/feed/here/?token=0432e9941dd9474b614b0a70d5f5b285374c822a';
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('Forecast Initial API call (geolocation)');
        console.log('Full API Response:', data);
        
        if (data.status === 'ok' && data.data) {
          const apiAqi = data.data.aqi !== undefined ? data.data.aqi : '0000';
          const apiCity = data.data.city?.name || '0000';
          const apiTime = data.data.time?.iso || '0000';
          const apiUid = data.data.idx; // Station UID from API
          const mainPollutant = getMainPollutant(data.data);
          
          console.log('AQI:', apiAqi);
          console.log('City:', apiCity);
          console.log('UID:', apiUid);
          console.log('Last Updated:', apiTime);
          console.log('Main Pollutant:', mainPollutant);
          
          // Find the matching station by uid
          const matchingStation = malaysiaCities.find(station => station.uid === apiUid);
          
          if (matchingStation) {
            console.log('Matching station found:', matchingStation.name);
            setCurrentLocation(matchingStation.name);
          } else {
            console.log('No matching station found for UID:', apiUid);
          }
          
          // Update current data with API data
          setCurrentData({
            aqi: apiAqi,
            level: typeof apiAqi === 'number' ? getAQILevel(apiAqi) : '',
            pollutant: mainPollutant,
            cityName: apiCity,
            lastUpdated: apiTime
          });
          
          // Check if forecast data is available
          if (data.data.forecast && data.data.forecast.daily) {
            const dailyForecast = data.data.forecast.daily;
            
            // Get tomorrow's forecast (index 1 if available)
            if (dailyForecast.pm25 && dailyForecast.pm25.length > 1) {
              const tomorrowPM25 = dailyForecast.pm25[1];
              const tomorrowAqi = tomorrowPM25.avg || '0000';
              
              console.log('Tomorrow AQI:', tomorrowAqi);
              
              setTomorrowData({
                aqi: tomorrowAqi,
                level: typeof tomorrowAqi === 'number' ? getAQILevel(tomorrowAqi) : '',
                pollutant: 'PM2.5',
                available: true
              });
            } else {
              setTomorrowData({
                aqi: '0000',
                level: '',
                pollutant: '0000',
                available: false
              });
            }
          } else {
            setTomorrowData({
              aqi: '0000',
              level: '',
              pollutant: '0000',
              available: false
            });
          }
          
          setApiStatus('success');
        } else {
          console.log('API returned non-ok status:', data.status);
          setApiStatus('error');
        }
      } catch (error) {
        console.error('Failed to fetch initial air quality data', error);
        setApiStatus('error');
      }
    };
    
    fetchInitialData();
  }, []);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const getColorForLevel = (level: string): string => {
    switch (level) {
      case 'Low': return '#10b981';
      case 'Moderate': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getBgColorForLevel = (level: string): string => {
    switch (level) {
      case 'Low': return 'bg-green-50 border-green-400';
      case 'Moderate': return 'bg-yellow-50 border-yellow-400';
      case 'High': return 'bg-red-50 border-red-400';
      default: return 'bg-gray-50 border-gray-400';
    }
  };
  
  const getHealthRecommendation = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          message: 'Air quality is good tomorrow. Perfect for outdoor activities!',
          maskAdvice: 'No mask needed',
          maxOutdoorDuration: 'No restrictions',
          activities: ['Morning walks', 'Exercise outdoors', 'Gardening', 'Visit parks'],
          familyAdvice: 'Safe for children and elderly to play or exercise outdoors. Great day for family activities!'
        };
      case 'Moderate':
        return {
          message: 'Air quality will be moderate tomorrow. Limit prolonged outdoor activity.',
          maskAdvice: 'Cloth mask recommended for sensitive groups',
          maxOutdoorDuration: '1-2 hours recommended',
          activities: ['Light outdoor activities', 'Short walks', 'Indoor exercise preferred'],
          familyAdvice: 'Children and elderly can go outside for short periods. Monitor anyone with breathing problems.'
        };
      case 'High':
        return {
          message: 'Air quality will be unhealthy tomorrow for outdoor activity.',
          maskAdvice: 'N95 mask required if going outside',
          maxOutdoorDuration: '15-30 minutes maximum',
          activities: ['Stay indoors', 'Keep windows closed', 'Use air purifier', 'Avoid outdoor exercise'],
          familyAdvice: 'Keep children and elderly indoors. Close all windows. If going out, ensure N95 masks are worn properly.'
        };
      default:
        return {
          message: 'Forecast data unavailable.',
          maskAdvice: 'Check later',
          maxOutdoorDuration: 'Check official sources',
          activities: ['Check local air quality reports'],
          familyAdvice: 'Stay informed about air quality conditions.'
        };
    }
  };
  
  const tomorrowHealthRec = tomorrowData.available ? getHealthRecommendation(tomorrowData.level) : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xl text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </Link>

        <header className="bg-white rounded-3xl shadow-2xl p-10 mb-8 border-4 border-cyan-200">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-16 h-16 text-cyan-600" />
            <div>
              <h1 className="text-5xl font-bold text-gray-900">Tomorrow's Forecast</h1>
              <p className="text-2xl text-gray-700 mt-2">
                Plan your outdoor activities for tomorrow
              </p>
            </div>
          </div>
        </header>

        {/* Location Selector */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-3 border-cyan-200">
          <label className="block text-2xl font-bold text-gray-900 mb-4">
            Select your location:
          </label>
          <select
            value={currentLocation}
            className="w-full text-2xl p-4 border-3 border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-cyan-400 font-semibold"
            style={{ maxHeight: '400px' }}
            onChange={handleLocationChange}
          >
            {sortedStates.map(state => (
              <optgroup key={state} label={state} className="font-bold text-gray-900 bg-gray-100 py-2">
                {groupedStations[state].map(station => (
                  <option key={station.uid} value={station.name} className="font-normal text-gray-700 py-2 px-4">
                    {station.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {tomorrowData.available ? (
          <>
            {/* Today vs Tomorrow Comparison */}
            <div className="bg-white rounded-2xl p-8 mb-8 border-3 border-cyan-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Air Quality Comparison
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Today */}
                <div className={`rounded-2xl p-6 border-4 ${getBgColorForLevel(currentData.level)} relative`}>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-6 py-2 rounded-full text-xl font-bold">
                    TODAY
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg text-gray-600 mb-2">{new Date().toLocaleDateString('en-MY', { weekday: 'long' })}</p>
                    <div className="text-7xl font-bold mb-4" style={{ color: getColorForLevel(currentData.level) }}>
                      {currentData.aqi}
                    </div>
                    <div 
                      className="inline-block text-white px-8 py-3 rounded-full text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: getColorForLevel(currentData.level) }}
                    >
                      {currentData.level} Risk
                    </div>
                  </div>
                </div>

                {/* Tomorrow */}
                <div className={`rounded-2xl p-6 border-4 ${getBgColorForLevel(tomorrowData.level)} relative`}>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-6 py-2 rounded-full text-xl font-bold">
                    TOMORROW
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg text-gray-600 mb-2">{tomorrow.toLocaleDateString('en-MY', { weekday: 'long' })}</p>
                    <div className="text-7xl font-bold mb-4" style={{ color: getColorForLevel(tomorrowData.level) }}>
                      {tomorrowData.aqi}
                    </div>
                    <div 
                      className="inline-block text-white px-8 py-3 rounded-full text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: getColorForLevel(tomorrowData.level) }}
                    >
                      {tomorrowData.level} Risk
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Indicator */}
              <div className="mt-6 text-center">
                {typeof tomorrowData.aqi === 'number' && typeof currentData.aqi === 'number' && tomorrowData.aqi < currentData.aqi ? (
                  <div className="inline-flex items-center gap-3 bg-green-100 border-2 border-green-400 text-green-900 px-8 py-4 rounded-2xl">
                    <CheckCircle className="w-8 h-8" />
                    <p className="text-2xl font-bold">
                      Air quality improving by {currentData.aqi - tomorrowData.aqi} points
                    </p>
                  </div>
                ) : typeof tomorrowData.aqi === 'number' && typeof currentData.aqi === 'number' && tomorrowData.aqi > currentData.aqi ? (
                  <div className="inline-flex items-center gap-3 bg-yellow-100 border-2 border-yellow-400 text-yellow-900 px-8 py-4 rounded-2xl">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-2xl font-bold">
                      Air quality worsening by {tomorrowData.aqi - currentData.aqi} points
                    </p>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 bg-blue-100 border-2 border-blue-400 text-blue-900 px-8 py-4 rounded-2xl">
                    <Info className="w-8 h-8" />
                    <p className="text-2xl font-bold">
                      Air quality expected to remain similar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tomorrow's Details */}
            <div className="bg-white rounded-2xl p-8 border-3 border-cyan-200 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Sun className="w-8 h-8 text-cyan-600" />
                What to Expect Tomorrow
              </h2>
              <p className="text-2xl text-gray-700 mb-6 leading-relaxed">
                {tomorrowHealthRec?.message}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-cyan-50 rounded-xl p-6 border-2 border-cyan-200">
                  <p className="text-xl font-bold text-cyan-900 mb-2">😷 Mask Recommendation:</p>
                  <p className="text-xl text-cyan-800">{tomorrowHealthRec?.maskAdvice}</p>
                </div>
                <div className="bg-sky-50 rounded-xl p-6 border-2 border-sky-200">
                  <p className="text-xl font-bold text-sky-900 mb-2">⏱️ Safe Outdoor Time:</p>
                  <p className="text-xl text-sky-800">{tomorrowHealthRec?.maxOutdoorDuration}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-6 border-2 border-cyan-200">
                <h3 className="text-2xl font-bold text-cyan-900 mb-4">📋 Recommended Activities:</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {tomorrowHealthRec?.activities.map((activity, index) => (
                    <li key={index} className="flex items-center gap-3 text-xl text-cyan-800 bg-white p-4 rounded-xl border-2 border-cyan-100">
                      <span className="text-2xl">✓</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Family Advice */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-3 border-indigo-300">
              <h2 className="text-3xl font-bold text-indigo-900 mb-4 flex items-center gap-3">
                <HomeIcon className="w-8 h-8" />
                Family Health Advice for Tomorrow
              </h2>
              <p className="text-xl text-indigo-800 leading-relaxed">
                {tomorrowHealthRec?.familyAdvice}
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-10 border-3 border-gray-300 text-center">
            <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Forecast Not Available
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed mb-6">
              Air quality forecast for {currentLocation} is currently unavailable.
            </p>
            <p className="text-xl text-gray-600">
              Please check again later or contact local environmental authorities.
            </p>
          </div>
        )}

      </div>
      {/* API Status Indicator - REMOVE LATER */}
      <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-300">
        <p className="text-sm font-semibold">
          API: {apiStatus === 'loading' ? '⏳ Loading...' : apiStatus === 'success' ? '✓ Success' : '✗ Failed'}
        </p>
      </div>
    </div>
  );
}
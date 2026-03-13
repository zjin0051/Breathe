import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { GitCompare, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
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
const airQualityData: { [key: string]: { aqi: number; level: string; pollutant: string; temp: number; humidity: number } } = {
  'Kuala Lumpur': { aqi: 68, level: 'Moderate', pollutant: 'PM2.5', temp: 32, humidity: 78 },
  'Penang': { aqi: 42, level: 'Low', pollutant: 'PM10', temp: 31, humidity: 75 },
  'Johor Bahru': { aqi: 85, level: 'Moderate', pollutant: 'PM2.5', temp: 33, humidity: 80 },
  'Ipoh': { aqi: 38, level: 'Low', pollutant: 'PM10', temp: 30, humidity: 72 },
  'Kuching': { aqi: 125, level: 'High', pollutant: 'PM2.5', temp: 34, humidity: 82 },
  'Kota Kinabalu': { aqi: 35, level: 'Low', pollutant: 'O3', temp: 29, humidity: 70 },
  'Melaka': { aqi: 55, level: 'Moderate', pollutant: 'PM10', temp: 32, humidity: 77 },
  'Shah Alam': { aqi: 45, level: 'Low', pollutant: 'PM2.5', temp: 31, humidity: 76 },
  'Petaling Jaya': { aqi: 52, level: 'Moderate', pollutant: 'PM2.5', temp: 32, humidity: 78 },
  'Klang': { aqi: 48, level: 'Low', pollutant: 'PM2.5', temp: 32, humidity: 77 },
};

export default function CompareLocations() {
  const cities = Object.keys(airQualityData);
  const [location1, setLocation1] = useState('Kuala Lumpur');
  const [location2, setLocation2] = useState('Penang');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [location1Data, setLocation1Data] = useState<{
    aqi: number | string;
    level: string;
    pollutant: string;
    temp: number | string;
    humidity: number | string;
    cityName: string;
  }>({
    aqi: '0000',
    level: '',
    pollutant: '0000',
    temp: '0000',
    humidity: '0000',
    cityName: '0000'
  });
  const [location2Data, setLocation2Data] = useState<{
    aqi: number | string;
    level: string;
    pollutant: string;
    temp: number | string;
    humidity: number | string;
    cityName: string;
  }>({
    aqi: '0000',
    level: '',
    pollutant: '0000',
    temp: '0000',
    humidity: '0000',
    cityName: '0000'
  });
  
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
  
  // Handle location 1 change and call WAQI API
  const handleLocation1Change = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocationName = e.target.value;
    setLocation1(selectedLocationName);
    
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
      
      console.log('CompareLocations Location 1 change API call');
      console.log('Selected:', name);
      console.log('Full API Response:', data);
      
      if (data.status === 'ok' && data.data) {
        const apiAqi = data.data.aqi !== undefined ? data.data.aqi : '0000';
        const apiCity = data.data.city?.name || '0000';
        const apiUid = data.data.idx;
        const mainPollutant = getMainPollutant(data.data);
        const temp = data.data.iaqi?.t?.v || '0000';
        const humidity = data.data.iaqi?.h?.v || '0000';
        
        console.log('AQI:', apiAqi);
        console.log('City:', apiCity);
        console.log('UID:', apiUid);
        console.log('Main Pollutant:', mainPollutant);
        console.log('Temperature:', temp);
        console.log('Humidity:', humidity);
        
        // Find the matching station by uid
        const matchingStation = malaysiaCities.find(station => station.uid === apiUid);
        
        if (matchingStation) {
          console.log('Matching station found:', matchingStation.name);
          setLocation1(matchingStation.name);
        } else {
          console.log('No matching station found for UID:', apiUid);
        }
        
        // Update location 1 data with API data
        setLocation1Data({
          aqi: apiAqi,
          level: typeof apiAqi === 'number' ? getAQILevel(apiAqi) : '',
          pollutant: mainPollutant,
          temp: temp,
          humidity: humidity,
          cityName: apiCity
        });
        
        setApiStatus('success');
      } else {
        console.log('API returned non-ok status:', data.status);
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Failed to fetch air quality data for location 1', error);
      setApiStatus('error');
    }
  };
  
  // Handle location 2 change and call WAQI API
  const handleLocation2Change = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocationName = e.target.value;
    setLocation2(selectedLocationName);
    
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
      
      console.log('CompareLocations Location 2 change API call');
      console.log('Selected:', name);
      console.log('Full API Response:', data);
      
      if (data.status === 'ok' && data.data) {
        const apiAqi = data.data.aqi !== undefined ? data.data.aqi : '0000';
        const apiCity = data.data.city?.name || '0000';
        const apiUid = data.data.idx;
        const mainPollutant = getMainPollutant(data.data);
        const temp = data.data.iaqi?.t?.v || '0000';
        const humidity = data.data.iaqi?.h?.v || '0000';
        
        console.log('AQI:', apiAqi);
        console.log('City:', apiCity);
        console.log('UID:', apiUid);
        console.log('Main Pollutant:', mainPollutant);
        console.log('Temperature:', temp);
        console.log('Humidity:', humidity);
        
        // Find the matching station by uid
        const matchingStation = malaysiaCities.find(station => station.uid === apiUid);
        
        if (matchingStation) {
          console.log('Matching station found:', matchingStation.name);
          setLocation2(matchingStation.name);
        } else {
          console.log('No matching station found for UID:', apiUid);
        }
        
        // Update location 2 data with API data
        setLocation2Data({
          aqi: apiAqi,
          level: typeof apiAqi === 'number' ? getAQILevel(apiAqi) : '',
          pollutant: mainPollutant,
          temp: temp,
          humidity: humidity,
          cityName: apiCity
        });
        
        setApiStatus('success');
      } else {
        console.log('API returned non-ok status:', data.status);
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Failed to fetch air quality data for location 2', error);
      setApiStatus('error');
    }
  };
  
  useEffect(() => {
    // Call API on component mount using geolocation endpoint
    const fetchInitialData = async () => {
      setApiStatus('loading');
      
      try {
        // Call WAQI API with geolocation (here) endpoint for Location 1
        const apiUrl = 'https://api.waqi.info/feed/here/?token=0432e9941dd9474b614b0a70d5f5b285374c822a';
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('CompareLocations Initial API call (geolocation) for Location 1');
        console.log('Full API Response:', data);
        
        if (data.status === 'ok' && data.data) {
          const apiAqi = data.data.aqi !== undefined ? data.data.aqi : '0000';
          const apiCity = data.data.city?.name || '0000';
          const apiUid = data.data.idx;
          const mainPollutant = getMainPollutant(data.data);
          const temp = data.data.iaqi?.t?.v || '0000';
          const humidity = data.data.iaqi?.h?.v || '0000';
          
          console.log('AQI:', apiAqi);
          console.log('City:', apiCity);
          console.log('UID:', apiUid);
          console.log('Main Pollutant:', mainPollutant);
          console.log('Temperature:', temp);
          console.log('Humidity:', humidity);
          
          // Find the matching station by uid
          const matchingStation = malaysiaCities.find(station => station.uid === apiUid);
          
          if (matchingStation) {
            console.log('Matching station found:', matchingStation.name);
            setLocation1(matchingStation.name);
          } else {
            console.log('No matching station found for UID:', apiUid);
          }
          
          // Update location 1 data with API data
          setLocation1Data({
            aqi: apiAqi,
            level: typeof apiAqi === 'number' ? getAQILevel(apiAqi) : '',
            pollutant: mainPollutant,
            temp: temp,
            humidity: humidity,
            cityName: apiCity
          });
          
          // Also fetch data for location 2 (Penang by default)
          const location2Station = malaysiaCities.find(station => station.name === 'Penang');
          if (location2Station) {
            const apiUrl2 = `https://api.waqi.info/feed/geo:${location2Station.lat};${location2Station.lon}/?token=0432e9941dd9474b614b0a70d5f5b285374c822a`;
            const response2 = await fetch(apiUrl2);
            const data2 = await response2.json();
            
            console.log('CompareLocations Initial API call for Location 2 (Penang)');
            console.log('Full API Response:', data2);
            
            if (data2.status === 'ok' && data2.data) {
              const apiAqi2 = data2.data.aqi !== undefined ? data2.data.aqi : '0000';
              const apiCity2 = data2.data.city?.name || '0000';
              const apiUid2 = data2.data.idx;
              const mainPollutant2 = getMainPollutant(data2.data);
              const temp2 = data2.data.iaqi?.t?.v || '0000';
              const humidity2 = data2.data.iaqi?.h?.v || '0000';
              
              // Find matching station for location 2
              const matchingStation2 = malaysiaCities.find(station => station.uid === apiUid2);
              
              if (matchingStation2) {
                console.log('Location 2 Matching station found:', matchingStation2.name);
                setLocation2(matchingStation2.name);
              }
              
              // Update location 2 data with API data
              setLocation2Data({
                aqi: apiAqi2,
                level: typeof apiAqi2 === 'number' ? getAQILevel(apiAqi2) : '',
                pollutant: mainPollutant2,
                temp: temp2,
                humidity: humidity2,
                cityName: apiCity2
              });
            }
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
  
  const data1 = location1Data;
  const data2 = location2Data;
  
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
  
  const getHealthAdvice = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          mask: 'No mask needed',
          outdoor: 'Safe for all outdoor activities',
          icon: <CheckCircle className="w-12 h-12 text-green-600" />
        };
      case 'Moderate':
        return {
          mask: 'Cloth mask recommended for sensitive groups',
          outdoor: 'Limit prolonged outdoor activity',
          icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />
        };
      case 'High':
        return {
          mask: 'N95 mask required',
          outdoor: 'Avoid outdoor activity',
          icon: <XCircle className="w-12 h-12 text-red-600" />
        };
      default:
        return {
          mask: 'Check local advisories',
          outdoor: 'Monitor conditions',
          icon: <AlertTriangle className="w-12 h-12 text-gray-600" />
        };
    }
  };
  
  const advice1 = getHealthAdvice(data1.level);
  const advice2 = getHealthAdvice(data2.level);
  
  const getBetterLocation = (): string => {
    // Handle comparison when AQI values might be strings or numbers
    if (typeof data1.aqi === 'number' && typeof data2.aqi === 'number') {
      if (data1.aqi < data2.aqi) return location1;
      if (data2.aqi < data1.aqi) return location2;
    }
    return 'equal';
  };
  
  const betterLocation = getBetterLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xl text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </Link>

        <header className="bg-white rounded-3xl shadow-2xl p-10 mb-8 border-4 border-purple-200">
          <div className="flex items-center gap-4 mb-4">
            <GitCompare className="w-16 h-16 text-purple-600" />
            <div>
              <h1 className="text-5xl font-bold text-gray-900">Compare Locations</h1>
              <p className="text-2xl text-gray-700 mt-2">
                Compare air quality between two Malaysian cities
              </p>
            </div>
          </div>
        </header>

        {/* Location Selectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-8 border-3 border-purple-200">
            <label className="block text-2xl font-bold text-gray-900 mb-4">
              📍 Location 1:
            </label>
            <select
              value={location1}
              className="w-full text-2xl p-4 border-3 border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-purple-400 font-semibold"
              style={{ maxHeight: '400px' }}
              onChange={handleLocation1Change}
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
          
          <div className="bg-white rounded-2xl p-8 border-3 border-purple-200">
            <label className="block text-2xl font-bold text-gray-900 mb-4">
              📍 Location 2:
            </label>
            <select
              value={location2}
              className="w-full text-2xl p-4 border-3 border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-purple-400 font-semibold"
              style={{ maxHeight: '400px' }}
              onChange={handleLocation2Change}
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
        </div>

        {/* Winner Banner */}
        {betterLocation !== 'equal' && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-400 rounded-2xl p-8 mb-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-green-900 mb-3">
              Better Air Quality: {betterLocation}
            </h2>
            <p className="text-2xl text-green-800">
              {betterLocation} has cleaner air with an AQI of {betterLocation === location1 ? data1.aqi : data2.aqi} compared to {betterLocation === location1 ? location2 : location1}'s {betterLocation === location1 ? data2.aqi : data1.aqi}
            </p>
          </div>
        )}
        
        {betterLocation === 'equal' && (
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-4 border-blue-400 rounded-2xl p-8 mb-8 text-center">
            <AlertTriangle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-blue-900 mb-3">
              Similar Air Quality
            </h2>
            <p className="text-2xl text-blue-800">
              Both locations have the same air quality level
            </p>
          </div>
        )}

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Location 1 Card */}
          <div className={`rounded-3xl shadow-xl p-8 border-4 ${getBgColorForLevel(data1.level)} ${betterLocation === location1 ? 'ring-8 ring-green-400' : ''}`}>
            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">{location1}</h3>
              <div className="text-8xl font-bold mb-4" style={{ color: getColorForLevel(data1.level) }}>
                {data1.aqi}
              </div>
              <div 
                className="inline-block text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg mb-4"
                style={{ backgroundColor: getColorForLevel(data1.level) }}
              >
                {data1.level} Risk
              </div>
              {betterLocation === location1 && (
                <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-xl font-bold mt-2">
                  <CheckCircle className="w-6 h-6" />
                  Better Choice
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <p className="text-lg text-gray-600 mb-2">Main Pollutant</p>
                <p className="text-3xl font-bold text-gray-900">{data1.pollutant}</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <p className="text-lg text-gray-600 mb-2">Temperature</p>
                <p className="text-3xl font-bold text-gray-900">{data1.temp}°C</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <p className="text-lg text-gray-600 mb-2">Humidity</p>
                <p className="text-3xl font-bold text-gray-900">{data1.humidity}%</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t-3 border-gray-300">
              <div className="flex items-start gap-4 mb-4">
                {advice1.icon}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Health Advice</h4>
                  <p className="text-xl text-gray-800 mb-2"><strong>😷 Mask:</strong> {advice1.mask}</p>
                  <p className="text-xl text-gray-800"><strong>🏃 Outdoor Activity:</strong> {advice1.outdoor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location 2 Card */}
          <div className={`rounded-3xl shadow-xl p-8 border-4 ${getBgColorForLevel(data2.level)} ${betterLocation === location2 ? 'ring-8 ring-green-400' : ''}`}>
            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">{location2}</h3>
              <div className="text-8xl font-bold mb-4" style={{ color: getColorForLevel(data2.level) }}>
                {data2.aqi}
              </div>
              <div 
                className="inline-block text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg mb-4"
                style={{ backgroundColor: getColorForLevel(data2.level) }}
              >
                {data2.level} Risk
              </div>
              {betterLocation === location2 && (
                <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-xl font-bold mt-2">
                  <CheckCircle className="w-6 h-6" />
                  Better Choice
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <p className="text-lg text-gray-600 mb-2">Main Pollutant</p>
                <p className="text-3xl font-bold text-gray-900">{data2.pollutant}</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <p className="text-lg text-gray-600 mb-2">Temperature</p>
                <p className="text-3xl font-bold text-gray-900">{data2.temp}°C</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <p className="text-lg text-gray-600 mb-2">Humidity</p>
                <p className="text-3xl font-bold text-gray-900">{data2.humidity}%</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t-3 border-gray-300">
              <div className="flex items-start gap-4 mb-4">
                {advice2.icon}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Health Advice</h4>
                  <p className="text-xl text-gray-800 mb-2"><strong>😷 Mask:</strong> {advice2.mask}</p>
                  <p className="text-xl text-gray-800"><strong>🏃 Outdoor Activity:</strong> {advice2.outdoor}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-8 bg-white rounded-2xl p-8 border-3 border-purple-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xl">
              <thead>
                <tr className="border-b-3 border-gray-300">
                  <th className="py-4 px-6 text-left text-2xl font-bold text-gray-900">Metric</th>
                  <th className="py-4 px-6 text-center text-2xl font-bold text-gray-900">{location1}</th>
                  <th className="py-4 px-6 text-center text-2xl font-bold text-gray-900">{location2}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b-2 border-gray-200">
                  <td className="py-4 px-6 font-semibold">Air Quality Index</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-3xl font-bold" style={{ color: getColorForLevel(data1.level) }}>
                      {data1.aqi}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-3xl font-bold" style={{ color: getColorForLevel(data2.level) }}>
                      {data2.aqi}
                    </span>
                  </td>
                </tr>
                <tr className="border-b-2 border-gray-200">
                  <td className="py-4 px-6 font-semibold">Risk Level</td>
                  <td className="py-4 px-6 text-center font-bold">{data1.level}</td>
                  <td className="py-4 px-6 text-center font-bold">{data2.level}</td>
                </tr>
                <tr className="border-b-2 border-gray-200">
                  <td className="py-4 px-6 font-semibold">Main Pollutant</td>
                  <td className="py-4 px-6 text-center font-bold">{data1.pollutant}</td>
                  <td className="py-4 px-6 text-center font-bold">{data2.pollutant}</td>
                </tr>
                <tr className="border-b-2 border-gray-200">
                  <td className="py-4 px-6 font-semibold">Temperature</td>
                  <td className="py-4 px-6 text-center font-bold">{data1.temp}°C</td>
                  <td className="py-4 px-6 text-center font-bold">{data2.temp}°C</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold">Humidity</td>
                  <td className="py-4 px-6 text-center font-bold">{data1.humidity}%</td>
                  <td className="py-4 px-6 text-center font-bold">{data2.humidity}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* API Status Indicator - REMOVE LATER */}
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-300">
          <p className="text-sm font-semibold">
            API: {apiStatus === 'loading' ? '⏳ Loading...' : apiStatus === 'success' ? '✓ Success' : '✗ Failed'}
          </p>
        </div>
      </div>
    </div>
  );
}
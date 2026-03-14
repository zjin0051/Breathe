import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  MapPin,
  ArrowLeft,
  Navigation,
  Clock,
  Home as HomeIcon,
} from "lucide-react";
import malaysiaCities from "../../imports/malaysia-cities-1.json";
import { SpeechButton } from "../components/SpeechButton";

// Group stations by state and sort
const groupedStations = malaysiaCities.reduce(
  (acc, station) => {
    if (!acc[station.state]) {
      acc[station.state] = [];
    }
    acc[station.state].push(station);
    return acc;
  },
  {} as Record<string, typeof malaysiaCities>,
);

// Sort states alphabetically
const sortedStates = Object.keys(groupedStations).sort();

// Sort stations within each state
sortedStates.forEach((state) => {
  groupedStations[state].sort((a, b) => a.name.localeCompare(b.name));
});

// Air quality data for Malaysian cities
const airQualityData: {
  [key: string]: {
    aqi: number;
    level: string;
    pollutant: string;
    lat: number;
    lng: number;
  };
} = {
  "Kuala Lumpur": {
    aqi: 68,
    level: "Moderate",
    pollutant: "PM2.5",
    lat: 3.139,
    lng: 101.6869,
  },
  Penang: {
    aqi: 42,
    level: "Low",
    pollutant: "PM10",
    lat: 5.4164,
    lng: 100.3327,
  },
  "Johor Bahru": {
    aqi: 85,
    level: "Moderate",
    pollutant: "PM2.5",
    lat: 1.4927,
    lng: 103.7414,
  },
  Ipoh: {
    aqi: 38,
    level: "Low",
    pollutant: "PM10",
    lat: 4.5975,
    lng: 101.0901,
  },
  Kuching: {
    aqi: 125,
    level: "High",
    pollutant: "PM2.5",
    lat: 1.5535,
    lng: 110.3593,
  },
  "Kota Kinabalu": {
    aqi: 35,
    level: "Low",
    pollutant: "O3",
    lat: 5.9804,
    lng: 116.0735,
  },
  Melaka: {
    aqi: 55,
    level: "Moderate",
    pollutant: "PM10",
    lat: 2.1896,
    lng: 102.2501,
  },
  "Shah Alam": {
    aqi: 45,
    level: "Low",
    pollutant: "PM2.5",
    lat: 3.0733,
    lng: 101.5185,
  },
  "Petaling Jaya": {
    aqi: 52,
    level: "Moderate",
    pollutant: "PM2.5",
    lat: 3.1073,
    lng: 101.6067,
  },
  Klang: {
    aqi: 48,
    level: "Low",
    pollutant: "PM2.5",
    lat: 3.0333,
    lng: 101.45,
  },
};

export default function SafeAreas() {
  const [currentLocation, setCurrentLocation] = useState("Kuala Lumpur");
  const [apiStatus, setApiStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [sortBy, setSortBy] = useState<"distance" | "aqi">("distance");
  const [currentData, setCurrentData] = useState<{
    aqi: number | string;
    level: string;
    pollutant: string;
    lat: number;
    lng: number;
    cityName: string;
    lastUpdated: string;
  }>({
    aqi: "0000",
    level: "",
    pollutant: "0000",
    lat: 0,
    lng: 0,
    cityName: "0000",
    lastUpdated: "0000",
  });

  // State to store real-time data from map bounds API
  const [malaysiaStationsData, setMalaysiaStationsData] = useState<{
    [key: string]: {
      aqi: number;
      level: string;
      pollutant: string;
      lat: number;
      lng: number;
      uid: number;
    };
  }>({});

  const cities = Object.keys(airQualityData);

  // Helper function to determine AQI level based on value
  const getAQILevel = (aqi: number): string => {
    if (aqi >= 0 && aqi <= 50) return "Low";
    if (aqi >= 51 && aqi <= 100) return "Moderate";
    if (aqi > 100) return "High";
    return "";
  };

  // Helper function to extract main pollutant from API data
  const getMainPollutant = (apiData: any): string => {
    if (!apiData.iaqi) return "PM2.5";

    const pollutants = apiData.iaqi;
    const pollutantValues: { [key: string]: number } = {};

    if (pollutants.pm25?.v !== undefined)
      pollutantValues["PM2.5"] = pollutants.pm25.v;
    if (pollutants.pm10?.v !== undefined)
      pollutantValues["PM10"] = pollutants.pm10.v;
    if (pollutants.o3?.v !== undefined) pollutantValues["O3"] = pollutants.o3.v;
    if (pollutants.no2?.v !== undefined)
      pollutantValues["NO2"] = pollutants.no2.v;
    if (pollutants.so2?.v !== undefined)
      pollutantValues["SO2"] = pollutantValues.so2.v;
    if (pollutants.co?.v !== undefined) pollutantValues["CO"] = pollutants.co.v;

    if (Object.keys(pollutantValues).length === 0) return "PM2.5";

    // Find the pollutant with highest value
    const mainPollutant = Object.keys(pollutantValues).reduce((a, b) =>
      pollutantValues[a] > pollutantValues[b] ? a : b,
    );

    return mainPollutant;
  };

  // Handle location change and call WAQI API
  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedLocationName = e.target.value;
    setCurrentLocation(selectedLocationName);

    // Find the selected station from malaysiaCities array
    const selectedStation = malaysiaCities.find(
      (station) => station.name === selectedLocationName,
    );

    if (!selectedStation) {
      setApiStatus("error");
      return;
    }

    const { lat, lon, name } = selectedStation;

    setApiStatus("loading");

    try {
      // Call WAQI API with latitude and longitude
      const apiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=0432e9941dd9474b614b0a70d5f5b285374c822a`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log("SafeAreas Location change API call");
      console.log("Selected:", name);
      console.log("Full API Response:", data);

      if (data.status === "ok" && data.data) {
        const apiAqi = data.data.aqi !== undefined ? data.data.aqi : "0000";
        const apiCity = data.data.city?.name || "0000";
        const apiTime = data.data.time?.iso || "0000";
        const apiUid = data.data.idx;
        const mainPollutant = getMainPollutant(data.data);
        const apiLat = data.data.city?.geo?.[0] || lat;
        const apiLng = data.data.city?.geo?.[1] || lon;

        console.log("AQI:", apiAqi);
        console.log("City:", apiCity);
        console.log("UID:", apiUid);
        console.log("Main Pollutant:", mainPollutant);
        console.log("Coordinates:", apiLat, apiLng);

        // Find the matching station by uid
        const matchingStation = malaysiaCities.find(
          (station) => station.uid === apiUid,
        );

        if (matchingStation) {
          console.log("Matching station found:", matchingStation.name);
          setCurrentLocation(matchingStation.name);
        } else {
          console.log("No matching station found for UID:", apiUid);
        }

        // Update current data with API data
        setCurrentData({
          aqi: apiAqi,
          level: typeof apiAqi === "number" ? getAQILevel(apiAqi) : "",
          pollutant: mainPollutant,
          lat: apiLat,
          lng: apiLng,
          cityName: apiCity,
          lastUpdated: apiTime,
        });

        setApiStatus("success");
      } else {
        console.log("API returned non-ok status:", data.status);
        setApiStatus("error");
      }
    } catch (error) {
      console.error("Failed to fetch air quality data", error);
      setApiStatus("error");
    }
  };

  useEffect(() => {
    // Call API on component mount using geolocation endpoint
    const fetchInitialData = async () => {
      setApiStatus("loading");

      try {
        // First, call the map bounds API to get all Malaysia stations data
        console.log(
          "SafeAreas Fetching Malaysia stations from map bounds API...",
        );
        const mapBoundsUrl =
          "https://api.waqi.info/v2/map/bounds?latlng=0.85,99.60,7.60,119.30&networks=all&token=401c2a6d614319cdb1b93d1274b9c4e4894d6dc2";
        const mapBoundsResponse = await fetch(mapBoundsUrl);
        const mapBoundsData = await mapBoundsResponse.json();

        console.log("Map Bounds API Response:", mapBoundsData);

        // Process and filter Malaysian stations
        if (mapBoundsData.status === "ok" && mapBoundsData.data) {
          const stations: typeof malaysiaStationsData = {};

          mapBoundsData.data.forEach((station: any) => {
            // Check if station UID exists in our malaysian cities list
            const malayStation = malaysiaCities.find(
              (city) => city.uid === station.uid,
            );

            if (malayStation && station.aqi && station.aqi !== "-") {
              const stationAqi =
                typeof station.aqi === "number"
                  ? station.aqi
                  : parseInt(station.aqi);

              if (!isNaN(stationAqi)) {
                stations[malayStation.name] = {
                  aqi: stationAqi,
                  level: getAQILevel(stationAqi),
                  pollutant: "PM2.5", // Default, would need individual station call for exact pollutant
                  lat: station.lat,
                  lng: station.lon,
                  uid: station.uid,
                };
              }
            }
          });

          console.log("Filtered Malaysia Stations:", stations);
          console.log("Total stations found:", Object.keys(stations).length);
          setMalaysiaStationsData(stations);
        }

        // Then call WAQI API with geolocation (here) endpoint for current location
        const apiUrl =
          "https://api.waqi.info/feed/here/?token=0432e9941dd9474b614b0a70d5f5b285374c822a";
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("SafeAreas Initial API call (geolocation)");
        console.log("Full API Response:", data);

        if (data.status === "ok" && data.data) {
          const apiAqi = data.data.aqi !== undefined ? data.data.aqi : "0000";
          const apiCity = data.data.city?.name || "0000";
          const apiTime = data.data.time?.iso || "0000";
          const apiUid = data.data.idx;
          const mainPollutant = getMainPollutant(data.data);
          const apiLat = data.data.city?.geo?.[0] || 0;
          const apiLng = data.data.city?.geo?.[1] || 0;

          console.log("AQI:", apiAqi);
          console.log("City:", apiCity);
          console.log("UID:", apiUid);
          console.log("Main Pollutant:", mainPollutant);
          console.log("Coordinates:", apiLat, apiLng);

          // Find the matching station by uid
          const matchingStation = malaysiaCities.find(
            (station) => station.uid === apiUid,
          );

          if (matchingStation) {
            console.log("Matching station found:", matchingStation.name);
            setCurrentLocation(matchingStation.name);
          } else {
            console.log("No matching station found for UID:", apiUid);
          }

          // Update current data with API data
          setCurrentData({
            aqi: apiAqi,
            level: typeof apiAqi === "number" ? getAQILevel(apiAqi) : "",
            pollutant: mainPollutant,
            lat: apiLat,
            lng: apiLng,
            cityName: apiCity,
            lastUpdated: apiTime,
          });

          setApiStatus("success");
        } else {
          console.log("API returned non-ok status:", data.status);
          setApiStatus("error");
        }
      } catch (error) {
        console.error("Failed to fetch initial air quality data", error);
        setApiStatus("error");
      }
    };

    fetchInitialData();
  }, []);

  const calculateDistance = (lat: number, lng: number): number => {
    if (currentData.lat === 0 || currentData.lng === 0) {
      return 0;
    }
    const latDiff = Math.abs(currentData.lat - lat);
    const lngDiff = Math.abs(currentData.lng - lng);
    return Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111);
  };

  // Use real-time Malaysia stations data if available, otherwise fallback to hardcoded data
  const stationsDataSource =
    Object.keys(malaysiaStationsData).length > 0
      ? malaysiaStationsData
      : airQualityData;

  const safeZones = Object.keys(stationsDataSource)
    .filter((city) => {
      // Only include cities that have better AQI than current location
      if (city === currentLocation) return false;
      if (!stationsDataSource[city]) return false;
      if (typeof currentData.aqi !== "number") return false;
      return stationsDataSource[city].aqi < currentData.aqi;
    })
    .map((city) => ({
      name: city,
      distance: calculateDistance(
        stationsDataSource[city].lat,
        stationsDataSource[city].lng,
      ),
      aqi: stationsDataSource[city].aqi,
      level: stationsDataSource[city].level,
      pollutant: stationsDataSource[city].pollutant,
    }))
    .sort((a, b) =>
      sortBy === "distance" ? a.distance - b.distance : a.aqi - b.aqi,
    );

  const getColorForLevel = (level: string): string => {
    switch (level) {
      case "Low":
        return "#10b981";
      case "Moderate":
        return "#f59e0b";
      case "High":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getBgColorForLevel = (level: string): string => {
    switch (level) {
      case "Low":
        return "bg-green-50 border-green-400";
      case "Moderate":
        return "bg-yellow-50 border-yellow-400";
      case "High":
        return "bg-red-50 border-red-400";
      default:
        return "bg-gray-50 border-gray-400";
    }
  };

  const getTextColorForLevel = (level: string): string => {
    switch (level) {
      case "Low":
        return "text-green-900";
      case "Moderate":
        return "text-yellow-900";
      case "High":
        return "text-red-900";
      default:
        return "text-gray-900";
    }
  };

  // Helper function to create readable text for speech
  const getSafeAreasSpeechText = (): string => {
    let speechText = `Finding safe areas near ${currentLocation}. Your current air quality index is ${currentData.aqi}, which is ${currentData.level} risk level. `;

    if (safeZones.length > 0) {
      speechText += `We found ${safeZones.length} location${safeZones.length > 1 ? "s" : ""} with better air quality. `;

      // Announce top 3 safe zones
      const topZones = safeZones.slice(0, 3);
      topZones.forEach((zone, index) => {
        speechText += `Number ${index + 1}: ${zone.name}, ${zone.distance} kilometers away, with air quality index of ${zone.aqi}, which is ${zone.level} risk level. `;
      });

      if (safeZones.length > 3) {
        speechText += `And ${safeZones.length - 3} more safe areas available.`;
      }
    } else {
      speechText += `No better areas found. Air quality in nearby areas is similar or worse than ${currentLocation}. We recommend staying indoors.`;
    }

    return speechText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </Link>

        <header className="bg-white rounded-3xl shadow-2xl p-10 mb-8 border-4 border-green-200">
          <div className="flex items-center gap-4 mb-4">
            <Navigation className="w-16 h-16 text-green-600" />
            <div>
              <h1 className="text-5xl font-bold text-gray-900">
                Find Safe Areas
              </h1>
              <p className="text-2xl text-gray-700 mt-2">
                Discover locations with better air quality
              </p>
            </div>
          </div>

          {/* Speech Controls in Header */}
          <div className="mt-6 space-y-4">
            {/* Quick Speech Button */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
              <p className="text-lg font-semibold text-gray-900 mb-3">
                🔊 Quick Audio Controls:
              </p>
              <div className="flex flex-wrap gap-3">
                <SpeechButton
                  text={getSafeAreasSpeechText()}
                  label="🗺️ Hear Safe Areas Near You"
                  variant="secondary"
                  size="medium"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Location Selector */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-3 border-green-200">
          <label className="block text-2xl font-bold text-gray-900 mb-4">
            Your current location:
          </label>
          <select
            value={currentLocation}
            className="w-full text-2xl p-4 border-3 border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-green-400 font-semibold"
            style={{ maxHeight: "400px" }}
            onChange={handleLocationChange}
          >
            {sortedStates.map((state) => (
              <optgroup
                key={state}
                label={state}
                className="font-bold text-gray-900 bg-gray-100 py-2"
              >
                {groupedStations[state].map((station) => (
                  <option
                    key={station.uid}
                    value={station.name}
                    className="font-normal text-gray-700 py-2 px-4"
                  >
                    {station.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="mt-6 bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
            <p className="text-xl text-gray-700 mb-2">
              Your current air quality:
            </p>
            <div className="flex items-center gap-4">
              <div
                className="text-5xl font-bold"
                style={{ color: getColorForLevel(currentData.level) }}
              >
                {currentData.aqi}
              </div>
              <div
                className="inline-block text-white px-6 py-3 rounded-full text-xl font-bold"
                style={{ backgroundColor: getColorForLevel(currentData.level) }}
              >
                {currentData.level} Risk
              </div>
            </div>
          </div>
        </div>

        {safeZones.length > 0 ? (
          <>
            <div className="bg-green-100 border-3 border-green-400 rounded-2xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-green-900 mb-3">
                ✅ Good News!
              </h2>
              <p className="text-2xl text-green-800 leading-relaxed">
                We found {safeZones.length} location
                {safeZones.length > 1 ? "s" : ""} with better air quality than{" "}
                {currentLocation}.
              </p>
            </div>

            {/* Sort By Selector */}
            <div className="bg-white rounded-2xl p-8 mb-8 border-3 border-blue-200">
              <label className="block text-2xl font-bold text-gray-900 mb-4">
                Sort results by:
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "distance" | "aqi")
                }
                className="w-full text-2xl p-4 border-3 border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-400 font-semibold"
              >
                <option value="distance">Nearest Distance</option>
                <option value="aqi">Lowest AQI (Best Air Quality)</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {safeZones.map((zone, index) => (
                <div
                  key={zone.name}
                  className={`rounded-2xl shadow-lg p-8 border-4 ${getBgColorForLevel(zone.level)}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: getColorForLevel(zone.level) }}
                    />
                    <span className="text-2xl font-bold text-gray-600">
                      #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    {zone.name}
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                      <p className="text-lg text-gray-600 mb-2">
                        Distance from you
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {zone.distance} km
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                      <p className="text-lg text-gray-600 mb-2">
                        Air Quality Index
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-4xl font-bold"
                          style={{ color: getColorForLevel(zone.level) }}
                        >
                          {zone.aqi}
                        </span>
                        <span
                          className={`text-xl font-bold ${getTextColorForLevel(zone.level)}`}
                        >
                          ({zone.level} Risk)
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                      <p className="text-lg text-gray-600 mb-2">
                        Main Pollutant
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {zone.pollutant}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <div className="flex items-center gap-2 text-lg text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>
                        Updated:{" "}
                        {new Date().toLocaleTimeString("en-MY", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border-3 border-yellow-400 rounded-2xl p-10 text-center">
            <HomeIcon className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-yellow-900 mb-6">
              No Better Areas Found
            </h2>
            <p className="text-2xl text-yellow-800 leading-relaxed mb-6">
              Air quality in nearby areas is similar or worse than{" "}
              {currentLocation}.
            </p>
            <div className="bg-white rounded-xl p-8 border-2 border-yellow-400">
              <p className="text-2xl text-yellow-900 font-bold mb-3">
                ⚠️ Recommendations:
              </p>
              <ul className="text-xl text-yellow-800 space-y-2 text-left max-w-2xl mx-auto">
                <li>• Stay indoors as much as possible</li>
                <li>• Keep windows closed</li>
                <li>• Use air purifier if available</li>
                <li>• Wear mask if you need to go outside</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-800 text-white rounded-2xl p-8 text-center mt-8">
          <p className="text-sm text-gray-400 mb-2">
            Data sourced from{" "}
            <a
              href="https://aqicn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              aqicn.org
            </a>
          </p>
          <p className="text-xl mb-2">
            Data updates every hour • Stay safe and breathe easy
          </p>
          <p className="text-lg text-gray-400">
            Last updated: {new Date().toLocaleString("en-MY")}
          </p>
        </footer>
      </div>
      {/* API Status Indicator - REMOVE LATER */}
      <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-300">
        <p className="text-sm font-semibold">
          API:{" "}
          {apiStatus === "loading"
            ? "⏳ Loading..."
            : apiStatus === "success"
              ? "✓ Success"
              : "✗ Failed"}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Stations loaded: {Object.keys(malaysiaStationsData).length}
        </p>
      </div>
    </div>
  );
}

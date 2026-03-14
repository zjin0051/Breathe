import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router";
import {
  Wind,
  AlertTriangle,
  MapPin,
  Clock,
  Navigation,
  TrendingUp,
  Home as HomeIcon,
  Info,
  Bell,
  Shield,
  ThermometerSun,
  Calendar,
  CloudRain,
  Sun,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import malaysiaCities from "../../imports/malaysia-cities-1.json";
import { SpeechButton } from "../components/SpeechButton";
import { SpeechSection } from "../components/SpeechSection";

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
  groupedStations[state].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
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

// Tomorrow's forecast data for Malaysian cities
const tomorrowForecastData: {
  [key: string]: {
    aqi: number;
    level: string;
    pollutant: string;
    available: boolean;
  };
} = {
  "Kuala Lumpur": {
    aqi: 62,
    level: "Moderate",
    pollutant: "PM2.5",
    available: true,
  },
  Penang: {
    aqi: 38,
    level: "Low",
    pollutant: "PM10",
    available: true,
  },
  "Johor Bahru": {
    aqi: 78,
    level: "Moderate",
    pollutant: "PM2.5",
    available: true,
  },
  Ipoh: {
    aqi: 35,
    level: "Low",
    pollutant: "PM10",
    available: true,
  },
  Kuching: {
    aqi: 110,
    level: "High",
    pollutant: "PM2.5",
    available: true,
  },
  "Kota Kinabalu": {
    aqi: 32,
    level: "Low",
    pollutant: "O3",
    available: true,
  },
  Melaka: {
    aqi: 0,
    level: "",
    pollutant: "",
    available: false,
  }, // No forecast available
  "Shah Alam": {
    aqi: 42,
    level: "Low",
    pollutant: "PM2.5",
    available: true,
  },
  "Petaling Jaya": {
    aqi: 48,
    level: "Low",
    pollutant: "PM2.5",
    available: true,
  },
  Klang: {
    aqi: 45,
    level: "Low",
    pollutant: "PM2.5",
    available: true,
  },
};

// Seasonal trends data
const seasonalTrends = [
  { month: "Jan", aqi: 58, season: "Northeast Monsoon" },
  { month: "Feb", aqi: 62, season: "Northeast Monsoon" },
  { month: "Mar", aqi: 71, season: "Inter-monsoon" },
  { month: "Apr", aqi: 78, season: "Inter-monsoon" },
  { month: "May", aqi: 68, season: "Southwest Monsoon" },
  { month: "Jun", aqi: 82, season: "Southwest Monsoon" },
  { month: "Jul", aqi: 105, season: "Haze Season" },
  { month: "Aug", aqi: 118, season: "Haze Season" },
  { month: "Sep", aqi: 98, season: "Haze Season" },
  { month: "Oct", aqi: 75, season: "Inter-monsoon" },
  { month: "Nov", aqi: 63, season: "Northeast Monsoon" },
  { month: "Dec", aqi: 55, season: "Northeast Monsoon" },
];

// Seasonal health advice
const seasonalAdvice: {
  [key: string]: {
    title: string;
    advice: string;
    precautions: string[];
  };
} = {
  "Haze Season": {
    title: "Haze Season Alert (Jul-Sep)",
    advice:
      "Air quality is typically unhealthy during this period due to transboundary haze. Stay indoors and use air purifiers.",
    precautions: [
      "Keep N95 masks ready at home",
      "Close all windows during hazy days",
      "Use air purifiers indoors",
      "Avoid outdoor exercise",
      "Drink plenty of water",
    ],
  },
  "Northeast Monsoon": {
    title: "Rainy Season (Nov-Feb)",
    advice:
      "Generally better air quality due to rain. Good time for outdoor activities.",
    precautions: [
      "Air is cleaner after rain",
      "Good time for morning walks",
      "Still monitor daily forecasts",
    ],
  },
  "Southwest Monsoon": {
    title: "Dry Season (May-Jun)",
    advice:
      "Air quality may vary. Monitor daily forecasts before outdoor activities.",
    precautions: [
      "Check air quality daily",
      "Plan activities for early morning",
      "Stay hydrated",
    ],
  },
  "Inter-monsoon": {
    title: "Transition Period (Mar-Apr, Oct)",
    advice:
      "Moderate air quality expected. Weather can be unpredictable.",
    precautions: [
      "Check daily forecasts",
      "Plan outdoor activities for mornings",
      "Keep mask ready as precaution",
    ],
  },
};

export default function Dashboard() {
  const [currentLocation, setCurrentLocation] =
    useState("Kuala Lumpur");
  const [showAlert, setShowAlert] = useState(true);
  const [comparisonCities, setComparisonCities] = useState<
    string[]
  >(["Kuala Lumpur", "Penang", "Kuching"]);
  const [selectedMonth, setSelectedMonth] = useState<
    string | null
  >(null);
  const [apiStatus, setApiStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [currentData, setCurrentData] = useState<{
    aqi: number | string;
    level: string;
    pollutant: string;
    cityName: string;
    lastUpdated: string;
  }>({
    aqi: "0000",
    level: "",
    pollutant: "0000",
    cityName: "0000",
    lastUpdated: "0000",
  });

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
    if (pollutants.o3?.v !== undefined)
      pollutantValues["O3"] = pollutants.o3.v;
    if (pollutants.no2?.v !== undefined)
      pollutantValues["NO2"] = pollutants.no2.v;
    if (pollutants.so2?.v !== undefined)
      pollutantValues["SO2"] = pollutants.so2.v;
    if (pollutants.co?.v !== undefined)
      pollutantValues["CO"] = pollutants.co.v;

    if (Object.keys(pollutantValues).length === 0)
      return "PM2.5";

    // Find the pollutant with highest value
    const mainPollutant = Object.keys(pollutantValues).reduce(
      (a, b) =>
        pollutantValues[a] > pollutantValues[b] ? a : b,
    );

    return mainPollutant;
  };

  // Fetch air quality data from API
  const fetchAirQualityData = async (locationName: string) => {
    setApiStatus("loading");

    // Find the selected station from malaysiaCities array
    const selectedStation = malaysiaCities.find(
      (station) => station.name === locationName,
    );

    if (!selectedStation) {
      setApiStatus("error");
      return;
    }

    const { lat, lon, name } = selectedStation;

    try {
      // Call WAQI API with latitude and longitude
      const apiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=0432e9941dd9474b614b0a70d5f5b285374c822a`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log("API call successful");
      console.log("Full API Response:", data);

      if (data.status === "ok" && data.data) {
        const apiAqi =
          data.data.aqi !== undefined ? data.data.aqi : "0000";
        const apiCity = data.data.city?.name || "0000";
        const apiTime = data.data.time?.iso || "0000";
        const mainPollutant = getMainPollutant(data.data);

        console.log("AQI:", apiAqi);
        console.log("City:", apiCity);
        console.log("Last Updated:", apiTime);
        console.log("Main Pollutant:", mainPollutant);

        // Update state with API data
        setCurrentData({
          aqi: apiAqi,
          level:
            typeof apiAqi === "number"
              ? getAQILevel(apiAqi)
              : "",
          pollutant: mainPollutant,
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

      console.log("Location change API call");
      console.log("Selected:", name);
      console.log("Full API Response:", data);

      if (data.status === "ok" && data.data) {
        const apiAqi =
          data.data.aqi !== undefined ? data.data.aqi : "0000";
        const apiCity = data.data.city?.name || "0000";
        const apiTime = data.data.time?.iso || "0000";
        const apiUid = data.data.idx; // Station UID from API
        const mainPollutant = getMainPollutant(data.data);

        console.log("AQI:", apiAqi);
        console.log("City:", apiCity);
        console.log("UID:", apiUid);
        console.log("Last Updated:", apiTime);
        console.log("Main Pollutant:", mainPollutant);

        // Find the matching station by uid
        const matchingStation = malaysiaCities.find(
          (station) => station.uid === apiUid,
        );

        if (matchingStation) {
          console.log(
            "Matching station found:",
            matchingStation.name,
          );
          // Set dropdown to the station returned by API (based on UID)
          setCurrentLocation(matchingStation.name);
        } else {
          console.log(
            "No matching station found for UID:",
            apiUid,
          );
          // Keep the selected location if no match found
        }

        // Update state with API data
        setCurrentData({
          aqi: apiAqi,
          level:
            typeof apiAqi === "number"
              ? getAQILevel(apiAqi)
              : "",
          pollutant: mainPollutant,
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
        // Call WAQI API with geolocation (here) endpoint
        const apiUrl =
          "https://api.waqi.info/feed/here/?token=0432e9941dd9474b614b0a70d5f5b285374c822a";
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("Initial API call (geolocation)");
        console.log("Full API Response:", data);

        if (data.status === "ok" && data.data) {
          const apiAqi =
            data.data.aqi !== undefined
              ? data.data.aqi
              : "0000";
          const apiCity = data.data.city?.name || "0000";
          const apiTime = data.data.time?.iso || "0000";
          const apiUid = data.data.idx; // Station UID from API
          const mainPollutant = getMainPollutant(data.data);

          console.log("AQI:", apiAqi);
          console.log("City:", apiCity);
          console.log("UID:", apiUid);
          console.log("Last Updated:", apiTime);
          console.log("Main Pollutant:", mainPollutant);

          // Find the matching station by uid
          const matchingStation = malaysiaCities.find(
            (station) => station.uid === apiUid,
          );

          if (matchingStation) {
            console.log(
              "Matching station found:",
              matchingStation.name,
            );
            setCurrentLocation(matchingStation.name);
          } else {
            console.log(
              "No matching station found for UID:",
              apiUid,
            );
          }

          // Update state with API data
          setCurrentData({
            aqi: apiAqi,
            level:
              typeof apiAqi === "number"
                ? getAQILevel(apiAqi)
                : "",
            pollutant: mainPollutant,
            cityName: apiCity,
            lastUpdated: apiTime,
          });

          setApiStatus("success");
        } else {
          console.log(
            "API returned non-ok status:",
            data.status,
          );
          setApiStatus("error");
        }
      } catch (error) {
        console.error(
          "Failed to fetch initial air quality data",
          error,
        );
        setApiStatus("error");
      }
    };

    fetchInitialData();
  }, []);

  const cities = Object.keys(airQualityData);

  // Calculate distance (simplified)
  const calculateDistance = (city: string): number => {
    const current = airQualityData[currentLocation];
    const target = airQualityData[city];

    // Check if both locations exist in airQualityData
    if (!current || !target) {
      return 0;
    }

    const latDiff = Math.abs(current.lat - target.lat);
    const lngDiff = Math.abs(current.lng - target.lng);
    return Math.round(
      Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111,
    ); // rough km conversion
  };

  // Get safe zones (areas with better air quality than current location)
  const safeZones = cities
    .filter((city) => {
      // Only include cities that exist in airQualityData and have better AQI
      if (city === currentLocation) return false;
      if (!airQualityData[city]) return false;
      if (typeof currentData.aqi !== "number") return false;
      return airQualityData[city].aqi < currentData.aqi;
    })
    .map((city) => ({
      name: city,
      distance: calculateDistance(city),
      aqi: airQualityData[city].aqi,
      level: airQualityData[city].level,
      pollutant: airQualityData[city].pollutant,
    }))
    .sort((a, b) => a.aqi - b.aqi);

  // Get color for AQI level
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

  // Get background color for level
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

  // Get text color for level
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

  // Health recommendations based on AQI level
  const getHealthRecommendation = (level: string) => {
    switch (level) {
      case "Low":
        return {
          message:
            "Air quality is good today. Perfect for outdoor activities!",
          maskAdvice: "No mask needed",
          maxOutdoorDuration: "No restrictions",
          activities: [
            "Morning walks",
            "Exercise outdoors",
            "Gardening",
            "Visit parks",
          ],
          familyAdvice:
            "Safe for children and elderly to play or exercise outdoors. Great day for family activities!",
        };
      case "Moderate":
        return {
          message:
            "Air quality is moderate today. Limit prolonged outdoor activity.",
          maskAdvice:
            "Cloth mask recommended for sensitive groups",
          maxOutdoorDuration: "1-2 hours recommended",
          activities: [
            "Light outdoor activities",
            "Short walks",
            "Indoor exercise preferred",
          ],
          familyAdvice:
            "Children and elderly can go outside for short periods. Monitor anyone with breathing problems.",
        };
      case "High":
        return {
          message:
            "Air quality is currently unhealthy for outdoor activity.",
          maskAdvice: "N95 mask required if going outside",
          maxOutdoorDuration: "15-30 minutes maximum",
          activities: [
            "Stay indoors",
            "Keep windows closed",
            "Use air purifier",
            "Avoid outdoor exercise",
          ],
          familyAdvice:
            "Keep children and elderly indoors. Close all windows. If going out, ensure N95 masks are worn properly.",
        };
      default:
        return {
          message: "Air quality data unavailable.",
          maskAdvice: "As a precaution, wear a mask",
          maxOutdoorDuration: "Check official sources",
          activities: ["Check local air quality reports"],
          familyAdvice:
            "Stay informed about air quality conditions.",
        };
    }
  };

  const healthRec = getHealthRecommendation(currentData.level);
  const selectedMonthData = selectedMonth
    ? seasonalTrends.find((t) => t.month === selectedMonth)
    : null;
  const selectedAdvice = selectedMonthData
    ? seasonalAdvice[selectedMonthData.season]
    : null;

  // Get tomorrow's forecast data
  const tomorrowData = tomorrowForecastData[currentLocation];
  const tomorrowHealthRec = tomorrowData?.available
    ? getHealthRecommendation(tomorrowData.level)
    : null;

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateString = tomorrow.toLocaleDateString(
    "en-MY",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  // Helper function to create readable text for speech
  const getCurrentAQISpeechText = (): string => {
    return `Current air quality in ${currentLocation}. Air Quality Index is ${currentData.aqi}, which is ${currentData.level} risk level. The main pollutant is ${currentData.pollutant}. ${healthRec.message}. Mask advice: ${healthRec.maskAdvice}. Maximum outdoor time: ${healthRec.maxOutdoorDuration}. Family advice: ${healthRec.familyAdvice}`;
  };

  const getAlertSpeechText = (): string => {
    return `Warning! Air Quality Alert. Air quality is currently unhealthy for outdoor activity. Current A Q I level is ${currentData.aqi}, ${currentData.level} risk. Expected to improve in 4 to 6 hours. Maximum outdoor time is ${healthRec.maxOutdoorDuration}. Main pollutant is ${currentData.pollutant}. Elderly health advisory: ${healthRec.familyAdvice}`;
  };

  const getSummarySpeechText = (): string => {
    return `Today's summary for ${currentLocation}. Air Quality Index: ${currentData.aqi}. Status: ${currentData.level} risk. Main pollutant: ${currentData.pollutant}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </Link>

        {/* 1. HEADER SECTION */}
        <header className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-4 border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <Wind className="w-16 h-16 text-indigo-600" />
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                Breathe
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mt-2">
                Air Quality Safety Dashboard
              </p>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mt-4">
            Helping you plan safer outdoor activities with
            real-time air quality insights.
          </p>

          {/* Speech Controls in Header */}
          <div className="mt-6 space-y-4">
            {/* Quick Speech Buttons */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-200">
              <p className="text-lg font-semibold text-gray-900 mb-3">
                🔊 Quick Audio Controls:
              </p>
              <div className="flex flex-wrap gap-3">
                {currentData.level === "High" && (
                  <SpeechButton
                    text={getAlertSpeechText()}
                    label="🚨 Hear Alert"
                    variant="secondary"
                    size="medium"
                  />
                )}
                <SpeechButton
                  text={getCurrentAQISpeechText()}
                  label="📊 Air Quality Info"
                  variant="secondary"
                  size="medium"
                />
                <SpeechButton
                  text={getSummarySpeechText()}
                  label="📝 Today's Summary"
                  variant="secondary"
                  size="medium"
                />
              </div>
            </div>
          </div>
        </header>

        {/* 3. REAL-TIME ALERT SYSTEM */}
        {currentData.level === "High" && showAlert && (
          <div className="bg-red-600 text-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border-4 border-red-700 animate-pulse">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  ⚠️ Air Quality Alert
                </h2>
                <p className="text-2xl md:text-3xl font-semibold mb-4">
                  Air quality is currently UNHEALTHY for outdoor
                  activity
                </p>
                <div className="bg-red-700 rounded-2xl p-6 mb-4">
                  <div className="grid md:grid-cols-2 gap-6 text-xl">
                    <div>
                      <p className="font-bold mb-2 flex items-center gap-2">
                        <ThermometerSun className="w-6 h-6" />
                        Current AQI Level:
                      </p>
                      <p className="text-2xl">
                        {currentData.aqi} - {currentData.level}{" "}
                        Risk
                      </p>
                    </div>
                    <div>
                      <p className="font-bold mb-2 flex items-center gap-2">
                        <Clock className="w-6 h-6" />
                        Expected to Improve:
                      </p>
                      <p className="text-2xl">In 4-6 hours</p>
                    </div>
                    <div>
                      <p className="font-bold mb-2 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Maximum Outdoor Time:
                      </p>
                      <p className="text-2xl">
                        {healthRec.maxOutdoorDuration}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold mb-2 flex items-center gap-2">
                        <Bell className="w-6 h-6" />
                        Main Pollutant:
                      </p>
                      <p className="text-2xl">
                        {currentData.pollutant}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white text-red-900 rounded-2xl p-6">
                  <p className="text-xl font-bold mb-3">
                    ⚕️ Elderly Health Advisory:
                  </p>
                  <p className="text-xl leading-relaxed">
                    {healthRec.familyAdvice}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-white hover:text-red-200 text-3xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* 2. CURRENT AIR QUALITY OVERVIEW */}
          <div className="lg:col-span-2">
            <div
              className={`rounded-3xl shadow-2xl p-8 md:p-10 border-4 ${getBgColorForLevel(currentData.level)}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <MapPin className="w-10 h-10" />
                  Current Air Quality
                </h2>
                <select
                  value={currentLocation}
                  onChange={handleLocationChange}
                  className="text-xl md:text-2xl p-4 border-3 border-gray-400 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-400 font-semibold"
                  style={{ maxHeight: "400px" }}
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
              </div>

              {/* AQI Display */}
              <div className="text-center mb-8">
                <div
                  className="text-9xl font-bold mb-4"
                  style={{
                    color: getColorForLevel(currentData.level),
                  }}
                >
                  {currentData.aqi}
                </div>
                <div
                  className="inline-block text-white px-10 py-5 rounded-full text-3xl font-bold shadow-lg mb-4"
                  style={{
                    backgroundColor: getColorForLevel(
                      currentData.level,
                    ),
                  }}
                >
                  {currentData.level} Risk
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Wind className="w-8 h-8 text-gray-700" />
                  <p className="text-2xl text-gray-700">
                    Main Pollutant:{" "}
                    <span className="font-bold">
                      {currentData.pollutant}
                    </span>
                  </p>
                </div>
              </div>

              {/* Health Recommendation */}
              <div className="bg-white rounded-2xl p-8 border-3 border-gray-300 mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <Info className="w-10 h-10 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Health Advisory
                    </h3>
                    <p className="text-2xl text-gray-700 leading-relaxed mb-6">
                      {healthRec.message}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                    <p className="text-xl font-bold text-indigo-900 mb-2">
                      😷 Mask Advice:
                    </p>
                    <p className="text-xl text-indigo-800">
                      {healthRec.maskAdvice}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                    <p className="text-xl font-bold text-purple-900 mb-2">
                      ⏱️ Max Outdoor Time:
                    </p>
                    <p className="text-xl text-purple-800">
                      {healthRec.maxOutdoorDuration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Activities */}
              <div className="bg-white rounded-2xl p-8 border-3 border-gray-300 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ✅ Recommended Activities:
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {healthRec.activities.map(
                    (activity, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-xl text-gray-700 bg-gray-50 p-4 rounded-xl"
                      >
                        <span className="text-2xl">•</span>
                        {activity}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Family Advice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-3 border-indigo-300">
                <h3 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-3">
                  <HomeIcon className="w-8 h-8" />
                  Family Health Advice:
                </h3>
                <p className="text-xl text-indigo-800 leading-relaxed">
                  {healthRec.familyAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Today's Summary
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-lg text-blue-700 mb-1">
                    Location
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {currentLocation}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <p className="text-lg text-green-700 mb-1">
                    Air Quality Index
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {currentData.aqi}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <p className="text-lg text-purple-700 mb-1">
                    Status
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {currentData.level} Risk
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                  <p className="text-lg text-orange-700 mb-1">
                    Main Pollutant
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {currentData.pollutant}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 border-3 border-indigo-300">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-indigo-700" />
                <p className="text-lg font-semibold text-indigo-900">
                  Last Updated
                </p>
              </div>
              <p className="text-xl text-indigo-800">
                {new Date().toLocaleString("en-MY", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white rounded-2xl p-8 text-center mt-8">
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
      </div>
    </div>
  );
}
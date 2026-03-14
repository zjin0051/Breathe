import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router";
import { TrendingUp, ArrowLeft, AlertTriangle } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

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

// AQI Breakpoints for pollutant calculations
const AQI_BREAKPOINTS = {
  pm25: [
    // µg/m³
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500, iLow: 301, iHigh: 500 },
  ],
  pm10: [
    // µg/m³
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ],
  co: [
    // ppm
    { cLow: 0, cHigh: 4.4, iLow: 0, iHigh: 50 },
    { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
    { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
    { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
    { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
    { cLow: 30.5, cHigh: 50.4, iLow: 301, iHigh: 500 },
  ],
  no2: [
    // ppb (converted from ppm)
    { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
    { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
    { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
    { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
    { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
  ],
  so2: [
    // ppb (converted from ppm)
    { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
    { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
    { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
    { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
    { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
    { cLow: 605, cHigh: 1004, iLow: 301, iHigh: 500 },
  ],
  o3: [
    // ppb (converted from ppm)
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
    { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
    { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
    { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
  ],
};

// Calculate AQI sub-index for a pollutant using linear interpolation
const calculateAQISubIndex = (
  concentration: number,
  pollutant: keyof typeof AQI_BREAKPOINTS,
): number => {
  const breakpoints = AQI_BREAKPOINTS[pollutant];

  console.log(
    `[${pollutant.toUpperCase()}] Input concentration:`,
    concentration,
  );

  // Convert units if necessary
  let convertedConcentration = concentration;

  // Convert ppm to ppb for NO₂, SO₂, and O₃
  if (pollutant === "no2" || pollutant === "so2" || pollutant === "o3") {
    convertedConcentration = concentration * 1000; // ppm to ppb
    console.log(
      `[${pollutant.toUpperCase()}] Converted from ${concentration} ppm to ${convertedConcentration} ppb`,
    );
  }

  // Find the correct breakpoint range
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (
      convertedConcentration >= bp.cLow &&
      convertedConcentration <= bp.cHigh
    ) {
      // Apply linear interpolation formula
      const aqi =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) *
          (convertedConcentration - bp.cLow) +
        bp.iLow;
      const roundedAqi = Math.round(aqi);

      console.log(
        `[${pollutant.toUpperCase()}] Breakpoint range: ${bp.cLow}-${bp.cHigh} → AQI ${bp.iLow}-${bp.iHigh}`,
      );
      console.log(
        `[${pollutant.toUpperCase()}] Formula: ((${bp.iHigh} - ${bp.iLow}) / (${bp.cHigh} - ${bp.cLow})) × (${convertedConcentration} - ${bp.cLow}) + ${bp.iLow}`,
      );
      console.log(`[${pollutant.toUpperCase()}] Calculated AQI:`, roundedAqi);

      return roundedAqi;
    }
  }

  // If concentration exceeds all breakpoints, return maximum
  console.log(
    `[${pollutant.toUpperCase()}] Concentration ${convertedConcentration} exceeds all breakpoints, returning max AQI: 500`,
  );
  return 500;
};

const seasonalAdvice: {
  [key: string]: { title: string; advice: string; precautions: string[] };
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
    advice: "Moderate air quality expected. Weather can be unpredictable.",
    precautions: [
      "Check daily forecasts",
      "Plan outdoor activities for mornings",
      "Keep mask ready as precaution",
    ],
  },
};

export default function SeasonalTrends() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [calculatedSeasonalTrends, setCalculatedSeasonalTrends] =
    useState(seasonalTrends);

  // Determine season for each month
  const getSeasonForMonth = (monthIndex: number): string => {
    if (
      (monthIndex >= 0 && monthIndex <= 1) ||
      monthIndex === 10 ||
      monthIndex === 11
    )
      return "Northeast Monsoon"; // Nov-Feb (10,11,0,1)
    if (monthIndex >= 6 && monthIndex <= 8) return "Haze Season"; // Jul-Sep (6,7,8)
    if (monthIndex === 4 || monthIndex === 5) return "Southwest Monsoon"; // May-Jun (4,5)
    if (monthIndex === 2 || monthIndex === 3 || monthIndex === 9)
      return "Inter-monsoon"; // Mar-Apr, Oct (2,3,9)
    return "Inter-monsoon";
  };

  // Get risk level from AQI value
  const getRiskLevel = (aqi: number): string => {
    if (aqi >= 0 && aqi <= 50) return "Low";
    if (aqi >= 51 && aqi <= 100) return "Moderate";
    if (aqi > 100) return "High";
    return "Low";
  };

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setApiStatus("loading");

      try {
        console.log("Fetching Malaysia air pollution historical data...");
        const response = await fetch(
          "https://api.data.gov.my/data-catalogue?id=air_pollution",
        );
        const data = await response.json();

        console.log("Historical Air Pollution API Response:", data);
        console.log("Type of data:", typeof data);
        console.log("Is array?", Array.isArray(data));

        // Log first record to see structure
        if (Array.isArray(data) && data.length > 0) {
          console.log("First record structure:", data[0]);
          console.log("First record keys:", Object.keys(data[0]));
        }

        // Process the data to calculate monthly AQI
        if (data && Array.isArray(data)) {
          // Group data by date first (daily level)
          interface DailyData {
            [key: string]: {
              co: number[];
              no2: number[];
              pm25: number[];
              pm10: number[];
              so2: number[];
              o3: number[];
            };
          }

          const dailyData: DailyData = {};

          // Normalize pollutant names to match our structure
          const normalizePollutantName = (pollutant: string): string => {
            const mapping: { [key: string]: string } = {
              CO: "co",
              NO2: "no2",
              "PM2.5": "pm25",
              PM10: "pm10",
              SO2: "so2",
              O3: "o3",
            };
            return (
              mapping[pollutant] || pollutant.toLowerCase().replace(".", "")
            );
          };

          console.log("Starting to group data by date (daily level)...");
          let recordsProcessed = 0;

          data.forEach((record: any, index: number) => {
            const dateKey = record.date; // Use full date as key (e.g., "2017-01-01")

            if (!dailyData[dateKey]) {
              dailyData[dateKey] = {
                co: [],
                no2: [],
                pm25: [],
                pm10: [],
                so2: [],
                o3: [],
              };
            }

            // Normalize the pollutant name and insert concentration
            if (
              record.pollutant &&
              record.concentration !== null &&
              record.concentration !== undefined
            ) {
              const normalizedPollutant = normalizePollutantName(
                record.pollutant,
              );

              // Only log first few records to avoid console spam
              if (index < 10 || recordsProcessed < 20) {
                console.log(
                  `Record ${index}: Date=${dateKey}, Pollutant="${record.pollutant}" → "${normalizedPollutant}", Concentration=${record.concentration}`,
                );
              }

              // Insert into the correct pollutant array
              if (
                dailyData[dateKey][
                  normalizedPollutant as keyof (typeof dailyData)[typeof dateKey]
                ]
              ) {
                dailyData[dateKey][
                  normalizedPollutant as keyof (typeof dailyData)[typeof dateKey]
                ].push(record.concentration);
                recordsProcessed++;
              } else {
                if (index < 10) {
                  console.warn(
                    `Unknown pollutant key: ${normalizedPollutant} from ${record.pollutant}`,
                  );
                }
              }
            }
          });

          console.log(
            `Total records processed and grouped by date: ${recordsProcessed}`,
          );
          console.log(`Total unique dates: ${Object.keys(dailyData).length}`);

          // Calculate daily AQI for each date
          interface DailyAQIResult {
            date: string;
            aqi: number;
            dominantPollutant: string;
            monthYear: string;
          }

          const dailyAQIResults: DailyAQIResult[] = [];

          console.log("\n=== Starting Daily AQI Calculation ===");

          Object.keys(dailyData).forEach((dateKey, index) => {
            const pollutantData = dailyData[dateKey];
            const date = new Date(dateKey);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            // Calculate average concentration for each pollutant on this day
            const avgCO =
              pollutantData.co.length > 0
                ? pollutantData.co.reduce((a, b) => a + b, 0) /
                  pollutantData.co.length
                : 0;
            const avgNO2 =
              pollutantData.no2.length > 0
                ? pollutantData.no2.reduce((a, b) => a + b, 0) /
                  pollutantData.no2.length
                : 0;
            const avgPM25 =
              pollutantData.pm25.length > 0
                ? pollutantData.pm25.reduce((a, b) => a + b, 0) /
                  pollutantData.pm25.length
                : 0;
            const avgPM10 =
              pollutantData.pm10.length > 0
                ? pollutantData.pm10.reduce((a, b) => a + b, 0) /
                  pollutantData.pm10.length
                : 0;
            const avgSO2 =
              pollutantData.so2.length > 0
                ? pollutantData.so2.reduce((a, b) => a + b, 0) /
                  pollutantData.so2.length
                : 0;
            const avgO3 =
              pollutantData.o3.length > 0
                ? pollutantData.o3.reduce((a, b) => a + b, 0) /
                  pollutantData.o3.length
                : 0;

            // Calculate AQI sub-index for each pollutant
            const aqiCO = avgCO > 0 ? calculateAQISubIndex(avgCO, "co") : 0;
            const aqiNO2 = avgNO2 > 0 ? calculateAQISubIndex(avgNO2, "no2") : 0;
            const aqiPM25 =
              avgPM25 > 0 ? calculateAQISubIndex(avgPM25, "pm25") : 0;
            const aqiPM10 =
              avgPM10 > 0 ? calculateAQISubIndex(avgPM10, "pm10") : 0;
            const aqiSO2 = avgSO2 > 0 ? calculateAQISubIndex(avgSO2, "so2") : 0;
            const aqiO3 = avgO3 > 0 ? calculateAQISubIndex(avgO3, "o3") : 0;

            // Daily AQI is the maximum of all pollutant AQIs
            const pollutantAQIs = {
              CO: aqiCO,
              NO2: aqiNO2,
              "PM2.5": aqiPM25,
              PM10: aqiPM10,
              SO2: aqiSO2,
              O3: aqiO3,
            };

            const maxAQI = Math.max(
              aqiCO,
              aqiNO2,
              aqiPM25,
              aqiPM10,
              aqiSO2,
              aqiO3,
            );
            const dominantPollutant =
              Object.keys(pollutantAQIs).find(
                (key) =>
                  pollutantAQIs[key as keyof typeof pollutantAQIs] === maxAQI,
              ) || "PM2.5";

            // Log first few days for verification
            if (index < 5) {
              console.log(
                `Date: ${dateKey}, Daily AQI: ${maxAQI}, Dominant: ${dominantPollutant}, AQIs:`,
                pollutantAQIs,
              );
            }

            dailyAQIResults.push({
              date: dateKey,
              aqi: maxAQI,
              dominantPollutant,
              monthYear,
            });
          });

          console.log(
            `Total daily AQI calculations completed: ${dailyAQIResults.length}`,
          );

          // Now calculate monthly AQI as the maximum daily AQI for each month
          interface MonthlyAQIResult {
            monthYear: string;
            month: number;
            year: number;
            aqi: number;
            dominantPollutant: string;
            riskLevel: string;
            highestDailyAQI: number;
          }

          const monthlyAQIResults: MonthlyAQIResult[] = [];

          // Group daily results by month
          const monthlyGroups: { [key: string]: DailyAQIResult[] } = {};

          dailyAQIResults.forEach((daily) => {
            if (!monthlyGroups[daily.monthYear]) {
              monthlyGroups[daily.monthYear] = [];
            }
            monthlyGroups[daily.monthYear].push(daily);
          });

          console.log("\n=== Calculating Monthly AQI (Max Daily AQI) ===");

          Object.keys(monthlyGroups).forEach((monthYear) => {
            const [year, month] = monthYear.split("-").map(Number);
            const dailyResults = monthlyGroups[monthYear];

            // Find the maximum daily AQI for this month
            const maxDailyAQI = Math.max(...dailyResults.map((d) => d.aqi));

            // Find the day with the highest AQI to get dominant pollutant
            const peakDay = dailyResults.find((d) => d.aqi === maxDailyAQI);
            const dominantPollutant = peakDay?.dominantPollutant || "PM2.5";

            const riskLevel = getRiskLevel(maxDailyAQI);

            console.log(`Month: ${monthYear}`);
            console.log(`  Highest daily AQI: ${maxDailyAQI}`);
            console.log(`  Dominant pollutant: ${dominantPollutant}`);
            console.log(`  Monthly AQI used in chart: ${maxDailyAQI}`);
            console.log(`  Risk Level: ${riskLevel}`);
            console.log(`  Total days in month: ${dailyResults.length}`);

            monthlyAQIResults.push({
              monthYear,
              month,
              year,
              aqi: maxDailyAQI,
              dominantPollutant,
              riskLevel,
              highestDailyAQI: maxDailyAQI,
            });
          });

          console.log("Monthly AQI Results:", monthlyAQIResults);

          // Generate seasonal trend by averaging AQI for same month across years
          const seasonalAverages: { [key: number]: number[] } = {};

          monthlyAQIResults.forEach((result) => {
            if (!seasonalAverages[result.month]) {
              seasonalAverages[result.month] = [];
            }
            seasonalAverages[result.month].push(result.aqi);
          });

          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          const finalSeasonalTrends = monthNames.map((monthName, index) => {
            const monthIndex = index + 1; // 1-12
            const aqiValues = seasonalAverages[monthIndex] || [];
            const avgAQI =
              aqiValues.length > 0
                ? Math.round(
                    aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length,
                  )
                : seasonalTrends[index].aqi; // Fallback to default

            return {
              month: monthName,
              aqi: avgAQI,
              season: getSeasonForMonth(index),
            };
          });

          console.log("Final Seasonal Trends:", finalSeasonalTrends);

          setCalculatedSeasonalTrends(finalSeasonalTrends);
          setApiStatus("success");
        } else {
          console.log("No valid data returned from API, using default trends");
          setApiStatus("error");
        }
      } catch (error) {
        console.error("Failed to fetch or process air pollution data:", error);
        setApiStatus("error");
      }
    };

    fetchAndProcessData();
  }, []);

  const selectedMonthData = selectedMonth
    ? calculatedSeasonalTrends.find((t) => t.month === selectedMonth)
    : null;
  const selectedAdvice = selectedMonthData
    ? seasonalAdvice[selectedMonthData.season]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </Link>

        <header className="bg-white rounded-3xl shadow-2xl p-10 mb-8 border-4 border-orange-200">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="w-16 h-16 text-orange-600" />
            <div>
              <h1 className="text-5xl font-bold text-gray-900">
                Seasonal Patterns
              </h1>
              <p className="text-2xl text-gray-700 mt-2">
                Learn about air quality throughout the year
              </p>
            </div>
          </div>
        </header>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-3 border-orange-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Air Quality Throughout the Year
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={seasonalTrends}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    key="start"
                    offset="5%"
                    stopColor="#f97316"
                    stopOpacity={0.8}
                  />
                  <stop
                    key="end"
                    offset="95%"
                    stopColor="#f97316"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 18, fill: "#374151", fontWeight: 600 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 18, fill: "#374151", fontWeight: 600 }}
                stroke="#9ca3af"
                label={{
                  value: "AQI Level",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 20, fill: "#374151", fontWeight: 700 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "3px solid #f97316",
                  borderRadius: "16px",
                  fontSize: "18px",
                  padding: "16px",
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#f97316"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorAqi)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500"></div>
              <span className="text-xl font-semibold">Low (0-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500"></div>
              <span className="text-xl font-semibold">Moderate (51-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500"></div>
              <span className="text-xl font-semibold">High (101+)</span>
            </div>
          </div>
        </div>

        {/* Month Selection */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-3 border-orange-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Click on any month to learn more:
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {seasonalTrends.map((trend) => {
              const isHighRisk = trend.aqi > 100;
              const bgColor =
                trend.aqi > 100
                  ? "bg-red-100 border-red-400"
                  : trend.aqi > 50
                    ? "bg-yellow-100 border-yellow-400"
                    : "bg-green-100 border-green-400";
              const isSelected = selectedMonth === trend.month;

              return (
                <button
                  key={trend.month}
                  onClick={() => setSelectedMonth(trend.month)}
                  className={`p-5 border-3 rounded-xl transition-all text-center ${bgColor} ${
                    isSelected
                      ? "ring-4 ring-orange-400 shadow-2xl scale-110"
                      : "hover:shadow-lg hover:scale-105"
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    {trend.month}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {trend.aqi}
                  </div>
                  {isHighRisk && (
                    <div className="bg-red-500 text-white text-sm px-2 py-1 rounded-full font-semibold">
                      High Risk
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seasonal Advice Display */}
        {selectedMonthData && selectedAdvice ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-400 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-12 h-12 flex-shrink-0 text-blue-700" />
              <div>
                <h2 className="text-4xl font-bold text-blue-900 mb-2">
                  {selectedMonthData.month} - {selectedMonthData.season}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl text-blue-800">Expected AQI:</span>
                  <div
                    className="inline-block text-white px-6 py-3 rounded-full text-2xl font-bold"
                    style={{
                      backgroundColor:
                        selectedMonthData.aqi > 100
                          ? "#ef4444"
                          : selectedMonthData.aqi > 50
                            ? "#f59e0b"
                            : "#10b981",
                    }}
                  >
                    {selectedMonthData.aqi}
                  </div>
                </div>
                <h3 className="text-3xl text-blue-900 font-bold mb-3">
                  {selectedAdvice.title}
                </h3>
                <p className="text-2xl text-blue-800 leading-relaxed mb-6">
                  {selectedAdvice.advice}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border-3 border-blue-300 mb-6">
              <p className="text-3xl font-bold text-blue-900 mb-4">
                🛡️ Health Precautions:
              </p>
              <ul className="space-y-3">
                {selectedAdvice.precautions.map((precaution, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-2xl text-blue-800"
                  >
                    <span className="text-2xl font-bold">•</span>
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedMonthData.season === "Haze Season" && (
              <div className="bg-red-50 rounded-xl p-8 border-3 border-red-400">
                <p className="text-3xl font-bold text-red-900 mb-3">
                  ⚠️ Special Alert for Elderly:
                </p>
                <p className="text-2xl text-red-800 leading-relaxed">
                  During haze season, elderly persons and those with respiratory
                  conditions should stay indoors as much as possible. Keep N95
                  masks ready and use air purifiers. Consult your doctor if you
                  experience breathing difficulties.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-3 border-orange-300 rounded-2xl p-10 text-center">
            <TrendingUp className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <p className="text-3xl text-orange-900 font-bold mb-3">
              Plan Ahead for Better Health
            </p>
            <p className="text-2xl text-orange-800 leading-relaxed">
              Click on any month above to see specific health advice and
              precautions for that seasonal period. This helps you prepare for
              high-risk pollution seasons like the haze period.
            </p>
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

        {/* API Status Indicator */}
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-300">
          <p className="text-sm font-semibold">
            API:{" "}
            {apiStatus === "loading"
              ? "⏳ Processing historical data..."
              : apiStatus === "success"
                ? "✓ Data calculated"
                : "✗ Using default trends"}
          </p>
        </div>
      </div>
    </div>
  );
}

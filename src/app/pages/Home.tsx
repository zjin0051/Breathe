import { Link } from "react-router";
import { useState } from "react";
import {
  Wind,
  MapPin,
  TrendingUp,
  Calendar,
  GitCompare,
  HelpCircle,
  TestTube,
} from "lucide-react";
import logoImage from "../../assets/breathe_logo.png";

export default function Home() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api.data.gov.my/data-catalogue?id=air_pollution",
      );
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError("Failed to fetch data from API");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16 pt-12">
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src={logoImage}
              alt="Breathe Logo"
              className="w-40 h-40 mb-8 drop-shadow-2xl"
            />
            <h1
              className="text-8xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-green-500 bg-clip-text text-transparent drop-shadow-lg"
              style={{
                fontFamily: "Georgia, serif",
                letterSpacing: "0.02em",
              }}
            >
              Breathe.
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
              <div className="text-2xl text-gray-500 font-light tracking-wider">
                Malaysia
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
            </div>
          </div>
          <p className="text-3xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Air Quality Information for Healthier Living
          </p>
        </header>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Check Air Quality Now */}
          <Link
            to="/dashboard"
            className="bg-white rounded-2xl p-12 border-4 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-blue-100 p-6 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Wind className="w-16 h-16 text-blue-600" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Check Air Quality Now
                </h2>
                <p className="text-2xl text-gray-600 leading-relaxed">
                  See current air quality in your area and get
                  health advice
                </p>
              </div>
            </div>
            <div className="text-2xl text-blue-600 font-semibold flex items-center gap-2">
              View Dashboard →
            </div>
          </Link>

          {/* Tomorrow's Forecast */}
          <Link
            to="/forecast"
            className="bg-white rounded-2xl p-12 border-4 border-cyan-200 hover:border-cyan-400 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-cyan-100 p-6 rounded-xl group-hover:bg-cyan-200 transition-colors">
                <Calendar className="w-16 h-16 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Tomorrow's Forecast
                </h2>
                <p className="text-2xl text-gray-600 leading-relaxed">
                  Plan your outdoor activities for tomorrow
                </p>
              </div>
            </div>
            <div className="text-2xl text-cyan-600 font-semibold flex items-center gap-2">
              View Forecast →
            </div>
          </Link>

          {/* Compare Locations */}
          <Link
            to="/compare-locations"
            className="bg-white rounded-2xl p-12 border-4 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-purple-100 p-6 rounded-xl group-hover:bg-purple-200 transition-colors">
                <GitCompare className="w-16 h-16 text-purple-600" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Compare Locations
                </h2>
                <p className="text-2xl text-gray-600 leading-relaxed">
                  Compare air quality between two cities
                </p>
              </div>
            </div>
            <div className="text-2xl text-purple-600 font-semibold flex items-center gap-2">
              Compare Now →
            </div>
          </Link>

          {/* Find Safe Areas */}
          <Link
            to="/safe-areas"
            className="bg-white rounded-2xl p-12 border-4 border-green-200 hover:border-green-400 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-green-100 p-6 rounded-xl group-hover:bg-green-200 transition-colors">
                <MapPin className="w-16 h-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Find Safe Areas
                </h2>
                <p className="text-2xl text-gray-600 leading-relaxed">
                  Discover nearby locations with better air
                  quality
                </p>
              </div>
            </div>
            <div className="text-2xl text-green-600 font-semibold flex items-center gap-2">
              Find Areas →
            </div>
          </Link>

          {/* Seasonal Patterns */}
          <Link
            to="/seasonal-trends"
            className="bg-white rounded-2xl p-12 border-4 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-orange-100 p-6 rounded-xl group-hover:bg-orange-200 transition-colors">
                <TrendingUp className="w-16 h-16 text-orange-600" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Seasonal Patterns
                </h2>
                <p className="text-2xl text-gray-600 leading-relaxed">
                  Learn about air quality throughout the year
                </p>
              </div>
            </div>
            <div className="text-2xl text-orange-600 font-semibold flex items-center gap-2">
              View Trends →
            </div>
          </Link>
        </div>

        {/* API Testing Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-8 border-4 border-indigo-200 shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <TestTube className="w-10 h-10 text-indigo-600" />
              Test Air Quality API
            </h3>
            <p className="text-2xl text-gray-600 mb-6">
              Click the button below to test the API connection
              and see real-time air quality data
            </p>

            <button
              onClick={testAPI}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-2xl font-semibold px-8 py-4 rounded-xl transition-colors flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <TestTube className="w-6 h-6" />
                  Test API Connection
                </>
              )}
            </button>

            {error && (
              <div className="mt-6 p-6 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="text-2xl text-red-700 font-semibold">
                  {error}
                </p>
              </div>
            )}

            {apiData && (
              <div className="mt-6 p-6 bg-gray-50 border-2 border-gray-300 rounded-xl">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  API Response:
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-auto max-h-96">
                  <pre className="text-lg text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Link */}
        <div className="text-center mb-12">
          <Link
            to="/help"
            className="inline-flex items-center gap-3 text-2xl text-gray-600 hover:text-blue-600 transition-colors"
          >
            <HelpCircle className="w-8 h-8" />
            Help / What does this mean?
          </Link>
        </div>

        {/* Footer Info */}
        <footer className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
          <p className="text-2xl text-gray-700 mb-4">
            We provide easy-to-understand air quality
            information
          </p>
          <p className="text-xl text-gray-500">
            Updated every hour • Data for major cities in
            Malaysia
          </p>
        </footer>
      </div>
    </div>
  );
}
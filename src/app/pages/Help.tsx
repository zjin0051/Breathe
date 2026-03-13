import { Link } from 'react-router';
import { ArrowLeft, Wind, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-2xl text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-8 h-8" />
          Back to Home
        </Link>

        {/* Header */}
        <header className="bg-white rounded-2xl p-10 mb-8 border-4 border-blue-200">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Help Guide</h1>
          <p className="text-2xl text-gray-700">
            Understanding air quality information
          </p>
        </header>

        {/* Air Quality Index Explanation */}
        <div className="bg-white rounded-2xl p-10 mb-6 border-3 border-gray-300">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Wind className="w-10 h-10 text-blue-600" />
            What is Air Quality Index (AQI)?
          </h2>
          <p className="text-2xl text-gray-700 leading-relaxed mb-6">
            The Air Quality Index (AQI) is a number that tells you how clean or polluted the air is. 
            The higher the number, the more polluted the air and the greater the health concern.
          </p>
        </div>

        {/* Risk Levels */}
        <div className="bg-white rounded-2xl p-10 mb-6 border-3 border-gray-300">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Understanding Risk Levels</h2>
          
          {/* Low Risk */}
          <div className="bg-green-50 border-4 border-green-400 rounded-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <h3 className="text-3xl font-bold text-green-900">Low Risk (0-50)</h3>
            </div>
            <p className="text-2xl text-green-800 leading-relaxed mb-4">
              Air quality is good. Perfect for outdoor activities.
            </p>
            <p className="text-xl text-green-700">
              ✓ Safe for everyone to go outside<br />
              ✓ No mask needed<br />
              ✓ Great day for walks and exercise
            </p>
          </div>

          {/* Moderate Risk */}
          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="w-12 h-12 text-yellow-600" />
              <h3 className="text-3xl font-bold text-yellow-900">Moderate Risk (51-100)</h3>
            </div>
            <p className="text-2xl text-yellow-800 leading-relaxed mb-4">
              Air quality is acceptable. Sensitive people should limit prolonged outdoor activity.
            </p>
            <p className="text-xl text-yellow-700">
              ⚠ Limit outdoor time to 1-2 hours<br />
              ⚠ Cloth mask recommended if sensitive<br />
              ⚠ Monitor how you feel
            </p>
          </div>

          {/* High Risk */}
          <div className="bg-red-50 border-4 border-red-400 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="w-12 h-12 text-red-600" />
              <h3 className="text-3xl font-bold text-red-900">High Risk (101+)</h3>
            </div>
            <p className="text-2xl text-red-800 leading-relaxed mb-4">
              Air quality is unhealthy. Everyone should reduce outdoor activity.
            </p>
            <p className="text-xl text-red-700">
              🚨 Stay indoors as much as possible<br />
              🚨 Wear N95 mask if you must go out<br />
              🚨 Close windows and use air purifier<br />
              🚨 Maximum outdoor time: 15-30 minutes
            </p>
          </div>
        </div>

        {/* Common Terms */}
        <div className="bg-white rounded-2xl p-10 mb-6 border-3 border-gray-300">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Common Terms</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">PM2.5</h3>
              <p className="text-2xl text-gray-700 leading-relaxed">
                Tiny particles in the air that can enter your lungs. Common from vehicle exhaust and smoke.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">PM10</h3>
              <p className="text-2xl text-gray-700 leading-relaxed">
                Larger particles from dust and pollen. Can irritate eyes and throat.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Haze Season</h3>
              <p className="text-2xl text-gray-700 leading-relaxed">
                Usually July to September in Malaysia. Smoke from forest fires can make air quality very poor.
              </p>
            </div>
          </div>
        </div>

        {/* When to Seek Help */}
        <div className="bg-red-50 rounded-2xl p-10 border-4 border-red-300 mb-8">
          <h2 className="text-4xl font-bold text-red-900 mb-6">When to Seek Medical Help</h2>
          <p className="text-2xl text-red-800 leading-relaxed mb-6">
            Contact your doctor or visit a clinic if you experience:
          </p>
          <ul className="space-y-3 text-2xl text-red-800">
            <li className="flex items-start gap-3">
              <span>•</span>
              <span>Difficulty breathing</span>
            </li>
            <li className="flex items-start gap-3">
              <span>•</span>
              <span>Chest tightness or pain</span>
            </li>
            <li className="flex items-start gap-3">
              <span>•</span>
              <span>Persistent cough</span>
            </li>
            <li className="flex items-start gap-3">
              <span>•</span>
              <span>Dizziness or unusual fatigue</span>
            </li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold px-12 py-6 rounded-xl transition-colors"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

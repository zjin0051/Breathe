import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import SafeAreas from "./pages/SafeAreas";
import SeasonalTrends from "./pages/SeasonalTrends";
import CompareLocations from "./pages/CompareLocations";
import Help from "./pages/Help";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/forecast",
    Component: Forecast,
  },
  {
    path: "/safe-areas",
    Component: SafeAreas,
  },
  {
    path: "/seasonal-trends",
    Component: SeasonalTrends,
  },
  {
    path: "/compare-locations",
    Component: CompareLocations,
  },
  {
    path: "/help",
    Component: Help,
  },
]);
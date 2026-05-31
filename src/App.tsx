import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import PublicProfile from "./pages/PublicProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/u/:slug" element={<PublicProfile />} />
    </Routes>
  );
}

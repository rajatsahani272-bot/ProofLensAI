
import { useState } from "react";

import AppLayout from "./components/layout/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AnalyzePage from "./pages/AnalyzePage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HelpSupport from "./pages/HelpSupport.jsx";
import NotFound from "./pages/NotFound.jsx";

import "./App.css";

const validPages = [
  "dashboard",
  "analyze",
  "history",
  "help"
];

const App = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const handleNavigate = (page) => {
    if (!validPages.includes(page)) return;

    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;

      case "analyze":
        return <AnalyzePage />;

      case "history":
        return <HistoryPage onNavigate={handleNavigate} />;

      case "help":
        return <HelpSupport onNavigate={handleNavigate} />;

      default:
        return <NotFound onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
    >
      {renderPage()}
    </AppLayout>
  );
};

export default App;

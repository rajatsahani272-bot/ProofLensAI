
import { useState } from "react";
import { Clock3, FileSearch, Search, ShieldCheck } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import "./HistoryPage.css";

const HistoryPage = ({ onNavigate }) => {
  const [search, setSearch] = useState("");

  const handleAnalyze = () => {
    onNavigate?.("analyze");
  };

  const query = search.trim();

  return (
    <main className="history-page">
      <header className="history-page-header">
        <div>
          <span className="history-eyebrow">
            <Clock3 size={15} />
            VERIFICATION RECORDS
          </span>
          <h1>Analysis history</h1>
          <p>
            Review previous image verifications and their associated reports.
          </p>
        </div>

        <Button onClick={handleAnalyze}>
          <FileSearch size={17} />
          New analysis
        </Button>
      </header>

      <Card>
        <label className="history-search">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by verification ID or file name..."
          />
        </label>

        <div className="history-empty">
          <div className="history-empty-icon">
            {query ? <Search size={27} /> : <Clock3 size={27} />}
          </div>

          <h2>
            {query ? "No matching records" : "No history available"}
          </h2>

          <p>
            {query
              ? "No records are currently loaded to match your search."
              : "Previous verification records will appear here once the backend history endpoint is connected."}
          </p>

          <Button onClick={handleAnalyze}>
            <FileSearch size={16} />
            Start a verification
          </Button>
        </div>
      </Card>

      <div className="history-info">
        <ShieldCheck size={18} />
        <p>
          Verification history should be loaded from the backend. This page
          does not create sample records or claim that results have been saved
          unless the API confirms it.
        </p>
      </div>
    </main>
  );
};

export default HistoryPage;

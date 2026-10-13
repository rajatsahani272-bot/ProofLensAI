
import { ArrowLeft, ScanSearch } from "lucide-react";
import Button from "../components/common/Button.jsx";
import "./NotFound.css";

const NotFound = ({ onNavigate }) => {
  return (
    <main className="not-found-page">
      <div className="not-found-icon">
        <ScanSearch size={34} />
      </div>

      <span className="not-found-code">404 · PAGE NOT FOUND</span>

      <h1>This page doesn't exist.</h1>

      <p>
        The page may have moved or the requested destination may be incorrect.
      </p>

      <Button onClick={() => onNavigate?.("dashboard")}>
        <ArrowLeft size={17} />
        Back to dashboard
      </Button>
    </main>
  );
};

export default NotFound;

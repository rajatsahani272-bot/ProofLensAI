
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  FileSearch,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap
} from "lucide-react";

import FAQSection from "../components/support/FAQSection.jsx";
import ContactSupport from "../components/support/ContactSupport.jsx";

import "./HelpSupport.css";

const categories = [
  {
    title: "Getting Started",
    description: "Learn how to verify an image.",
    icon: BookOpen,
    target: "getting-started"
  },
  {
    title: "Image Verification",
    description: "Understand reports and AI detection.",
    icon: FileSearch,
    target: "verification-faq"
  },
  {
    title: "Troubleshooting",
    description: "Fix common upload and analysis issues.",
    icon: Zap,
    target: "troubleshooting"
  },
  {
    title: "Privacy & Safety",
    description: "Understand responsible verification.",
    icon: ShieldCheck,
    target: "privacy-safety"
  }
];

const HelpSupport = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      scrollToSection("faq-section");
      return;
    }

    scrollToSection("faq-section");

    window.dispatchEvent(
      new CustomEvent("prooflens-faq-search", {
        detail: query
      })
    );
  };

  return (
    <main className="help-page">
      <section className="help-hero">
        <div className="help-hero-glow" />

        <div className="help-hero-content">
          <span className="help-eyebrow">
            <CircleHelp size={15} />
            SUPPORT CENTER
          </span>

          <h1>
            How can we <span>help you?</span>
          </h1>

          <p>
            Find answers, understand your verification report,
            and learn how to get the most out of ProofLens AI.
          </p>

          <form className="help-search" onSubmit={handleSearch}>
            <Search size={19} />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search FAQs, upload issues, AI detection..."
              aria-label="Search help articles"
            />

            <button type="submit">
              Search
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="help-hero-note">
            <Sparkles size={15} />
            Clear answers for more informed verification.
          </div>
        </div>

        <div className="help-hero-decoration" aria-hidden="true">
          <div className="help-orbit help-orbit-one" />
          <div className="help-orbit help-orbit-two" />

          <div className="help-shield">
            <ShieldCheck size={70} strokeWidth={1.3} />
          </div>

          <div className="help-floating help-floating-one">
            <FileSearch size={19} />
            <span>Evidence</span>
          </div>

          <div className="help-floating help-floating-two">
            <MessageCircle size={19} />
            <span>Answers</span>
          </div>
        </div>
      </section>

      <section className="help-category-section">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">EXPLORE SUPPORT</span>
            <h2>What do you need help with?</h2>
          </div>

          <p>Choose a topic to find the right information.</p>
        </div>

        <div className="help-category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                className="help-category-card"
                key={category.target}
                type="button"
                onClick={() => scrollToSection(category.target)}
              >
                <span className="help-category-icon">
                  <Icon size={22} />
                </span>

                <span className="help-category-copy">
                  <strong>{category.title}</strong>
                  <span>{category.description}</span>
                </span>

                <ArrowRight
                  className="help-category-arrow"
                  size={18}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="help-guide-section"
        id="getting-started"
      >
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">QUICK GUIDE</span>
            <h2>Verify an image in 3 steps</h2>
          </div>
        </div>

        <div className="help-guide-grid">
          <article className="help-guide-card">
            <span className="help-step-number">01</span>
            <div className="help-guide-icon">
              <Upload size={24} />
            </div>
            <h3>Upload your image</h3>
            <p>
              Select a JPG, PNG or WebP image within the
              10 MB upload limit.
            </p>
          </article>

          <article className="help-guide-card">
            <span className="help-step-number">02</span>
            <div className="help-guide-icon">
              <FileSearch size={24} />
            </div>
            <h3>Provide a claim</h3>
            <p>
              Optionally enter a statement you want to
              investigate, such as a certificate claim.
            </p>
          </article>

          <article className="help-guide-card">
            <span className="help-step-number">03</span>
            <div className="help-guide-icon">
              <ShieldCheck size={24} />
            </div>
            <h3>Review the report</h3>
            <p>
              Examine extracted text, model predictions,
              evidence sources and reported limitations.
            </p>
          </article>
        </div>
      </section>

      <FAQSection />

      <section
        className="help-troubleshooting-section"
        id="troubleshooting"
      >
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">QUICK FIXES</span>
            <h2>Having trouble?</h2>
          </div>

          <p>Try these checks before running the analysis again.</p>
        </div>

        <div className="help-troubleshooting-list">
          <article className="help-troubleshooting-item">
            <div className="help-trouble-icon">
              <Upload size={21} />
            </div>

            <div>
              <h3>Image upload failed</h3>
              <p>
                Check that the file is JPG, PNG or WebP and
                does not exceed 10 MB. Try selecting the
                image again.
              </p>
            </div>
          </article>

          <article className="help-troubleshooting-item">
            <div className="help-trouble-icon">
              <Zap size={21} />
            </div>

            <div>
              <h3>Analysis is taking too long</h3>
              <p>
                Image processing can take time. Keep the page
                open and wait for a response. If it times out,
                check the service connection and retry.
              </p>
            </div>
          </article>

          <article className="help-troubleshooting-item">
            <div className="help-trouble-icon">
              <FileSearch size={21} />
            </div>

            <div>
              <h3>No text or evidence found</h3>
              <p>
                Use a clear, high-resolution image. Some
                images contain no readable text, and some
                claims may have insufficient public evidence.
              </p>
            </div>
          </article>

          <article className="help-troubleshooting-item">
            <div className="help-trouble-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h3>Conflicting verification results</h3>
              <p>
                Different analysis stages examine different
                signals. Review the source links and confirm
                important claims with the issuing institution.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section
        className="help-privacy-section"
        id="privacy-safety"
      >
        <div className="help-privacy-icon">
          <ShieldCheck size={27} />
        </div>

        <div>
          <span className="help-section-label">
            RESPONSIBLE AI
          </span>
          <h2>Evidence matters more than a score.</h2>
          <p>
            AI-generated image detection is probabilistic and
            can be wrong. OCR extracts text but does not prove
            that a document is genuine. A supported claim is
            not proof of the entire image's authenticity.
            Check primary sources whenever possible.
          </p>
        </div>
      </section>

      <ContactSupport onNavigate={onNavigate} />

      <footer className="help-footer">
        <div className="help-footer-brand">
          <ShieldCheck size={19} />
          <strong>ProofLens AI</strong>
        </div>

        <span>
          Verify images. Investigate claims. Follow the evidence.
        </span>

        <button
          type="button"
          onClick={() => window.scrollTo({
            top: 0,
            behavior: "smooth"
          })}
        >
          Back to top ↑
        </button>
      </footer>
    </main>
  );
};

export default HelpSupport;

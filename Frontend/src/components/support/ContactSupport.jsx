
import { useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Mail,
  MessageCircle,
  Send,
  ShieldQuestion
} from "lucide-react";

import "./ContactSupport.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  topic: "Analysis issue",
  message: ""
};

const ContactSupport = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setError("");
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(
      "The support form is not connected to a ticket or email service yet. Your message has not been sent."
    );
  };

  return (
    <section
      className="contact-support-section"
      id="contact-support"
    >
      <div className="contact-support-info">
        <span className="help-section-label">
          <MessageCircle size={14} />
          CONTACT SUPPORT
        </span>

        <h2>Still need a hand?</h2>

        <p>
          Tell us what went wrong or what you would like to
          understand. This form is ready for future support
          integration.
        </p>

        <div className="contact-support-points">
          <div>
            <span className="contact-point-icon">
              <ShieldQuestion size={19} />
            </span>

            <div>
              <strong>Verification guidance</strong>
              <p>Understand results and evidence.</p>
            </div>
          </div>

          <div>
            <span className="contact-point-icon">
              <CircleAlert size={19} />
            </span>

            <div>
              <strong>Technical issues</strong>
              <p>Describe upload or analysis errors.</p>
            </div>
          </div>

          <div>
            <span className="contact-point-icon">
              <Mail size={19} />
            </span>

            <div>
              <strong>Support request</strong>
              <p>Prepare a request for the support team.</p>
            </div>
          </div>
        </div>
      </div>

      <form
        className="contact-support-form"
        onSubmit={handleSubmit}
      >
        <div className="contact-form-heading">
          <h3>Send us a message</h3>
          <p>Fields marked with * are required.</p>
        </div>

        <div className="contact-form-row">
          <label>
            Your name *
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Enter your name"
              maxLength={100}
              required
            />
          </label>

          <label>
            Email address *
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              maxLength={254}
              required
            />
          </label>
        </div>

        <label className="contact-form-label">
          What do you need help with?
          <select
            name="topic"
            value={form.topic}
            onChange={updateField}
          >
            <option>Analysis issue</option>
            <option>Image upload</option>
            <option>Verification results</option>
            <option>AI detection</option>
            <option>OCR and extracted text</option>
            <option>Privacy question</option>
            <option>Other</option>
          </select>
        </label>

        <label className="contact-form-label">
          Describe your issue *
          <textarea
            name="message"
            value={form.message}
            onChange={updateField}
            placeholder="Explain what happened and what you expected..."
            rows={5}
            maxLength={2000}
            required
          />
          <span className="contact-character-count">
            {form.message.length}/2000
          </span>
        </label>

        {error && (
          <div
            className="contact-form-feedback"
            role="alert"
          >
            <CircleAlert size={17} />
            <span>{error}</span>
          </div>
        )}

        {submitted && (
          <div className="contact-form-success" role="status">
            <CheckCircle2 size={18} />
            <span>Your message has been prepared.</span>
          </div>
        )}

        <button
          className="contact-submit-button"
          type="submit"
        >
          <Send size={16} />
          Validate support request
        </button>

        <p className="contact-form-disclaimer">
          Do not include passwords, bank details, identity
          numbers or other sensitive information.
        </p>
      </form>
    </section>
  );
};

export default ContactSupport;

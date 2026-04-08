import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { api } from "../api/axios.js";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

// --- Data Definitions ---

const CONTACT_INFO = {
  location: "Student Center, Room 304, University Campus",
  email: "info@nextedgesociety.org",
  phone: "(123) 456-7890",
};

const OFFICE_HOURS = [
  { day: "Monday - Friday", hours: "9:00 AM - 5:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
  { day: "Sunday", hours: "Closed", closed: true },
];

const CLUB_INTERESTS = [
  "CodeForge Tech",
  "LaunchLab Entrepreneurship",
  "ReadApp Communication",
  "ImpactStore Social Welfare",
  "SkillQuest Life Skills",
  "Craftory Art & Craft",
];

const YEAR_OPTIONS = [
  "Select your year",
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Graduate",
];
const INTEREST_AREAS = [
  "Select Area of Interest",
  "Event Management",
  "Marketing & Outreach",
  "Technical Support",
  "Content Creation",
];

// --- Reusable Form Components ---

/**
 * Renders a standard text input field.
 */
const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
}) => (
  <div className="flex-1 min-w-[45%]">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-border shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground placeholder-gray-400 rounded-lg outline-none transition-all"
    />
  </div>
);

/**
 * Renders a dropdown select field.
 */
const SelectField = ({
  label,
  name,
  required = false,
  options,
  value,
  onChange,
}) => (
  <div className="flex-1 min-w-[45%]">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-border shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground appearance-none pr-8 rounded-lg outline-none transition-all"
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// --- Membership Form Component ---

/**
 * Renders the Membership Application Form.
 */
const MembershipForm = ({
  formData,
  handleInputChange,
  handleCheckboxChange,
  handleSubmit,
  formMessage,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Join NextEdge Society
      </h3>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange}
        />
        <InputField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
        <SelectField
          label="Year of Study"
          name="year"
          required
          options={YEAR_OPTIONS}
          value={formData.year}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Club Interests (select all that apply)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CLUB_INTERESTS.map((interest) => (
            <div key={interest} className="flex items-center">
              <input
                id={interest}
                name="interests"
                type="checkbox"
                value={interest}
                checked={formData.interests.includes(interest)}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-border rounded focus:ring-blue-500 bg-background"
              />
              <label
                htmlFor={interest}
                className="ml-2 text-sm text-foreground"
              >
                {interest}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us a bit about yourself and why you want to join..."
          className="w-full px-4 py-2 border border-border shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground placeholder-gray-400 rounded-lg outline-none transition-all"
        ></textarea>
      </div>

      {formMessage && (
        <p
          className={`mt-2 text-sm ${formMessage.includes("submitted") ? "text-green-600" : "text-red-500"}`}
        >
          {formMessage}
        </p>
      )}

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
      >
        Submit Application
        <Mail className="ml-2 h-4 w-4" />
      </button>
    </form>
  );
};

// --- Volunteer Form Component ---

/**
 * Renders the Volunteer Form.
 */
const VolunteerForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  formMessage,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Volunteer With Us
      </h3>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange}
        />
        <InputField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
        <SelectField
          label="Year of Study"
          name="year"
          required
          options={YEAR_OPTIONS}
          value={formData.year}
          onChange={handleInputChange}
        />
      </div>

      <SelectField
        label="Area of Interest"
        name="interestArea"
        required
        options={INTEREST_AREAS}
        value={formData.interestArea}
        onChange={handleInputChange}
      />

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your availability and any special skills you have..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        ></textarea>
      </div>

      {formMessage && (
        <p
          className={`mt-2 text-sm ${formMessage.includes("submitted") ? "text-green-600" : "text-red-500"}`}
        >
          {formMessage}
        </p>
      )}

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
      >
        Submit Interest
        <Mail className="ml-2 h-4 w-4" />
      </button>
    </form>
  );
};

// --- Main Contact Page Component ---

/**
 * Main Contact Page Component
 */
const Contact = () => {
  const [activeTab, setActiveTab] = useState("membership");
  const [formMessage, setFormMessage] = useState("");

  // Common initial state for both forms
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    year: YEAR_OPTIONS[0],
    message: "",
  };

  const [membershipForm, setMembershipForm] = useState({
    ...initialFormState,
    interests: [], // Specific to membership
  });

  const [volunteerForm, setVolunteerForm] = useState({
    ...initialFormState,
    interestArea: INTEREST_AREAS[0], // Specific to volunteer
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === "membership") {
      setMembershipForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setVolunteerForm((prev) => ({ ...prev, [name]: value }));
    }
    setFormMessage(""); // Clear message on input
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setMembershipForm((prev) => {
      const interests = checked
        ? [...prev.interests, value]
        : prev.interests.filter((i) => i !== value);
      return { ...prev, interests };
    });
    setFormMessage(""); // Clear message on input
  };

  const resetFormState = () => {
    if (activeTab === "membership") {
      setMembershipForm({ ...initialFormState, interests: [] });
    } else {
      setVolunteerForm({
        ...initialFormState,
        interestArea: INTEREST_AREAS[0],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData =
      activeTab === "membership" ? membershipForm : volunteerForm;

    // Simple client-side validation check
    if (
      !formData.name ||
      !formData.email ||
      formData.year === YEAR_OPTIONS[0]
    ) {
      setFormMessage("Please fill in all required fields.");
      return;
    }

    // Additional validation for membership form
    if (activeTab === "membership" && formData.interests.length === 0) {
      setFormMessage("Please select at least one club interest.");
      return;
    }

    // Additional validation for volunteer form
    if (
      activeTab === "volunteer" &&
      formData.interestArea === INTEREST_AREAS[0]
    ) {
      setFormMessage("Please select an area of interest.");
      return;
    }

    try {
      const endpoint =
        activeTab === "membership"
          ? "/contacts/membership"
          : "/contacts/volunteer";

      const response = await api.post(endpoint, formData);

      if (response.data.success) {
        setFormMessage("Request submitted successfully!");
        resetFormState();
        setTimeout(() => setFormMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormMessage(
        error.response?.data?.message ||
          "Failed to submit request. Please try again later.",
      );
      setTimeout(() => setFormMessage(""), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Header/Banner Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-20 lg:pt-30 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl lg:text-6xl  mb-3 tracking-tight font-semibold"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:text-xl font-light"
          >
            Get in touch with the NextEdge Society team. We'd love to hear from
            you!
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content: Contact Info and Forms */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN: Contact Information & Office Hours */}
          <div className="space-y-8 lg:col-span-1">
            {/* Contact Information Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card p-6 rounded-xl shadow-2xl border border-border"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
                Contact Information
              </h2>
              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Location
                    </p>
                    <p className="text-sm">{CONTACT_INFO.location}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start text-gray-600 dark:text-gray-300">
                  <Mail className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Email
                    </p>
                    <a
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="text-sm hover:text-blue-500 transition-colors"
                    >
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start text-gray-600 dark:text-gray-300">
                  <Phone className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Phone
                    </p>
                    <p className="text-sm">{CONTACT_INFO.phone}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Office Hours Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card p-6 rounded-xl shadow-2xl border border-border"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
                Office Hours
              </h2>
              <div className="space-y-3">
                {OFFICE_HOURS.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-muted-foreground"
                  >
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-500 mr-2" />
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.day}
                      </p>
                    </div>
                    <span
                      className={
                        item.closed
                          ? "text-red-500 font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    >
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Tabbed Forms */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 bg-card rounded-xl shadow-2xl border border-border"
          >
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("membership")}
                className={`py-3 px-6 text-lg font-medium rounded-tl-xl transition-colors duration-150 ${
                  activeTab === "membership"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-muted"
                    : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Membership
              </button>
              <button
                onClick={() => setActiveTab("volunteer")}
                className={`py-3 px-6 text-lg font-medium transition-colors duration-150 ${
                  activeTab === "volunteer"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-gray-50 dark:bg-gray-700"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Volunteer
              </button>
            </div>

            {/* Form Content */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "membership" ? (
                  <motion.div
                    key="membership"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MembershipForm
                      formData={membershipForm}
                      handleInputChange={handleInputChange}
                      handleCheckboxChange={handleCheckboxChange}
                      handleSubmit={handleSubmit}
                      formMessage={formMessage}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="volunteer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VolunteerForm
                      formData={volunteerForm}
                      handleInputChange={handleInputChange}
                      handleSubmit={handleSubmit}
                      formMessage={formMessage}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Simple Footer */}
      <Footer />
    </div>
  );
};

export default Contact;

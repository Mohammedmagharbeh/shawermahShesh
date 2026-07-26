"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function JobsPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    phone: "",
    nationality: "",
    education: "",
    age: "",
    startDate: "",
    resume: null,
    experienceCertificate: null,
    photo: null,
    workedBefore: "no",
    previousJobs: "",
    previousTitle: "",
    jobId: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/jobs`);
      setJobs(res.data);
    } catch (err) {
      toast.error(t("failed_load_jobs"));
      console.log(err);
    }
  };

  const handleFileChange = (e, field) => {
    setForm({ ...form, [field]: e.target.files[0] });
  };

  const validateForm = () => {
    const phoneRegex = /^\d{10}$/;

    if (
      !form.jobId ||
      !form.applicantName ||
      !form.applicantEmail ||
      !form.phone ||
      !form.nationality ||
      !form.education
    ) {
      toast.error(t("fill_required_fields"));
      return false;
    }

    if (!phoneRegex.test(form.phone)) {
      toast.error(t("invalid_phone_10_digits"));
      return false;
    }

    return true;
  };

  const applyJob = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    for (const key in form) {
      if (form[key] !== null) {
        formData.append(key, form[key]);
      }
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/jobs/apply`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success(t("application_success"));

      setForm({
        applicantName: "",
        applicantEmail: "",
        phone: "",
        nationality: "",
        education: "",
        age: "",
        startDate: "",
        resume: null,
        experienceCertificate: null,
        photo: null,
        workedBefore: "no",
        previousJobs: "",
        previousTitle: "",
        jobId: "",
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        toast.error(t("blacklisted_error_msg") || "This email is blacklisted.");
      } else {
        toast.error(t("application_error"));
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header */}
      <div className="bg-[#DA0103] border-b-4 border-[#FFC400] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#FFC400]">
            {t("available_jobs")}
          </h1>
          <p className="text-white mt-2 text-sm sm:text-base">
            {t("join_team")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Jobs List Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#DA0103] pb-3 border-b-4 border-[#FFC400] mb-6">
            {t("available_jobs")}
          </h2>

          {jobs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#FFC400] p-6 rounded-lg text-center">
              <p className="text-gray-600">{t("no_jobs")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border-2 border-[#DA0103] border-r-4 border-r-[#FFC400] rounded-lg p-5 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#DA0103] mb-2">
                        {currentLang === "ar" ? job.title.ar : job.title.en}
                      </h3>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base text-gray-600">
                        <p>
                          <span className="font-bold text-gray-900">
                            {t("type")}:
                          </span>{" "}
                          {currentLang === "ar" ? job.type.ar : job.type.en}
                        </p>

                        {/* عرض الجنس المطلوب بشكل بارز للمستخدم */}
                        {/* <p className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{t("required_gender")}:</span>{" "}
                          <span className="px-3 py-0.5 bg-red-100 text-[#DA0103] rounded-full font-bold text-xs sm:text-sm border border-[#DA0103]/20">
                             {job.gender ? (currentLang === "ar" ? job.gender.ar : job.gender.en) : "---"}
                          </span>
                        </p> */}
                        {/* عرض الجنس المطلوب للمستخدم */}
                        {/* عرض الجنس المطلوب للمستخدم - التعديل الصحيح */}
                        <p className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">
                            {t("required_gender")}:
                          </span>{" "}
                          <span className="px-3 py-0.5 bg-red-100 text-[#DA0103] rounded-full font-bold text-xs sm:text-sm border border-[#DA0103]/20">
                            {job.gender
                              ? currentLang === "ar"
                                ? job.gender.ar
                                : job.gender.en
                              : "---"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setForm({ ...form, jobId: job._id });
                        // Scroll to form smoothly
                        setTimeout(() => {
                          window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth",
                          });
                        }, 100);
                      }}
                      className="w-full sm:w-auto bg-[#FFC400] text-[#DA0103] font-bold py-3 px-8 rounded-lg hover:bg-[#DA0103] hover:text-[#FFC400] transition-all active:scale-95 shadow-sm"
                    >
                      {t("apply_job")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Form Section */}
        {form.jobId && (
          <div className="bg-white border-2 border-[#DA0103] rounded-lg p-6 sm:p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center pb-4 border-b-2 border-[#FFC400] mb-6">
              <h3 className="text-2xl font-bold text-[#DA0103]">
                {t("apply_for_job")}
              </h3>
              <button
                onClick={() => setForm({ ...form, jobId: "" })}
                className="text-gray-400 hover:text-[#DA0103] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <input
                placeholder={t("your_name")}
                value={form.applicantName}
                onChange={(e) =>
                  setForm({ ...form, applicantName: e.target.value })
                }
                className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
              />
              <input
                placeholder={t("your_email")}
                type="email"
                value={form.applicantEmail}
                onChange={(e) =>
                  setForm({ ...form, applicantEmail: e.target.value })
                }
                className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
              />
              <input
                placeholder={t("phone")}
                type="number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
              />
              <input
                placeholder={t("nationality")}
                value={form.nationality}
                onChange={(e) =>
                  setForm({ ...form, nationality: e.target.value })
                }
                className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
              />
              <input
                placeholder={t("education")}
                value={form.education}
                onChange={(e) =>
                  setForm({ ...form, education: e.target.value })
                }
                className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
              />
              <input
                placeholder={t("age")}
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
              />

              <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
                <label className="font-bold text-[#DA0103]">
                  {t("start_date")}
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-[#FFC400] rounded-lg focus:outline-none focus:border-[#DA0103] transition-colors"
                />
              </div>
            </div>

            {/* ملفات الرفع */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="p-4 bg-red-50 border-l-4 border-[#DA0103] rounded-lg">
                <label className="block text-[#DA0103] font-bold mb-2">
                  {t("resume")}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, "resume")}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FFC400] file:text-[#DA0103] file:font-bold hover:file:bg-[#DA0103] hover:file:text-[#FFC400] cursor-pointer"
                />
              </div>
              <div className="p-4 bg-red-50 border-l-4 border-[#DA0103] rounded-lg">
                <label className="block text-[#DA0103] font-bold mb-2">
                  {t("experience_certificate")}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, "experienceCertificate")}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FFC400] file:text-[#DA0103] file:font-bold hover:file:bg-[#DA0103] hover:file:text-[#FFC400] cursor-pointer"
                />
              </div>
            </div>

            {/* الخبرة العملية */}
            <div className="mt-6 p-4 bg-red-50 border-2 border-dashed border-[#FFC400] rounded-lg">
              <label className="block text-[#DA0103] font-bold mb-4">
                {t("worked_before")}
              </label>
              <div className="flex gap-8 mb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    checked={form.workedBefore === "yes"}
                    onChange={() => setForm({ ...form, workedBefore: "yes" })}
                    className="accent-[#DA0103] w-4 h-4"
                  />
                  <span className="font-semibold group-hover:text-[#DA0103] transition-colors">
                    {t("yes")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    checked={form.workedBefore === "no"}
                    onChange={() => setForm({ ...form, workedBefore: "no" })}
                    className="accent-[#DA0103] w-4 h-4"
                  />
                  <span className="font-semibold group-hover:text-[#DA0103] transition-colors">
                    {t("no")}
                  </span>
                </label>
              </div>

              {form.workedBefore === "yes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <input
                    placeholder={t("previous_workplace")}
                    value={form.previousJobs}
                    onChange={(e) =>
                      setForm({ ...form, previousJobs: e.target.value })
                    }
                    className="px-4 py-3 border-2 border-[#FFC400] rounded-lg bg-white focus:outline-none focus:border-[#DA0103]"
                  />
                  <input
                    placeholder={t("previous_title")}
                    value={form.previousTitle}
                    onChange={(e) =>
                      setForm({ ...form, previousTitle: e.target.value })
                    }
                    className="px-4 py-3 border-2 border-[#FFC400] rounded-lg bg-white focus:outline-none focus:border-[#DA0103]"
                  />
                </div>
              )}
            </div>

            <button
              onClick={applyJob}
              className="w-full mt-8 bg-[#DA0103] text-[#FFC400] font-bold py-4 rounded-lg text-lg hover:bg-[#FFC400] hover:text-[#DA0103] transition-all shadow-lg active:scale-95"
            >
              {t("submit_application")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

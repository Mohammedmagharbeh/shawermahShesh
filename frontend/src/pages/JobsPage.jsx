"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

export default function JobsPage() {
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
    photo: null, // ✅ أضفنا الصورة الشخصية

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
      const res = await axios.get("http://localhost:5000/jobs");
      setJobs(res.data);
    } catch (err) {
      toast.error("فشل تحميل الوظائف");
      console.log(err);
    }
  };

  const handleFileChange = (e, field) => {
    setForm({ ...form, [field]: e.target.files[0] });
  };

  const applyJob = async () => {
    if (
      !form.jobId ||
      !form.applicantName ||
      !form.applicantEmail ||
      !form.phone ||
      !form.nationality ||
      !form.education
    ) {
      toast.error("يرجى ملء الحقول الأساسية!");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }

    try {
      await axios.post("http://localhost:5000/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("تم تقديم الطلب بنجاح!");
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
        workedBefore: "no",
        previousJobs: "",
        previousTitle: "",
        jobId: "",
      });
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء التقديم");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Toaster position="center-top" reverseOrder={false} />

      <div className="bg-[#DA0103] border-b-4 border-[#FFC400] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center">
          <div className="mb-4">
            <img className="h-16 sm:h-20 mx-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFC400]">
            الوظائف المتاحة
          </h1>
          <p className="text-white mt-2 text-sm sm:text-base">
            انضم لفريق يلا شيش
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Jobs List Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#DA0103] pb-3 border-b-4 border-[#FFC400] mb-6">
            الوظائف المتاحة
          </h2>

          {jobs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#FFC400] p-6 sm:p-8 rounded-lg text-center">
              <p className="text-gray-600 text-base sm:text-lg">
                لا توجد وظائف متاحة حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border-2 border-[#DA0103] border-r-4 border-r-[#FFC400] rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-[#DA0103] mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-semibold text-gray-900">
                          النوع:
                        </span>{" "}
                        {job.type}
                      </p>
                    </div>
                    <button
                      onClick={() => setForm({ ...form, jobId: job._id })}
                      className="w-full sm:w-auto bg-[#FFC400] text-[#DA0103] font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-[#DA0103] hover:text-[#FFC400] transition-all active:scale-95"
                    >
                      أقدم على هذه الوظيفة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Form Section */}
        {form.jobId && (
          <div className="bg-white border-2 border-[#DA0103] rounded-lg p-6 sm:p-8 shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#DA0103] mt-0 pb-4 border-b-2 border-[#FFC400] mb-6">
              تقديم على الوظيفة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name and Email */}
              <input
                placeholder="اسمك"
                value={form.applicantName}
                onChange={(e) =>
                  setForm({ ...form, applicantName: e.target.value })
                }
                className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lg bg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
              />
              <input
                placeholder="إيميلك"
                type="email"
                value={form.applicantEmail}
                onChange={(e) =>
                  setForm({ ...form, applicantEmail: e.target.value })
                }
                className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lgbg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
              />

              {/* Phone and Nationality */}
              <input
                placeholder="رقم الهاتف"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lgbg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
              />
              <input
                placeholder="الجنسية"
                value={form.nationality}
                onChange={(e) =>
                  setForm({ ...form, nationality: e.target.value })
                }
                className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lgbg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
              />

              {/* Education and Age */}
              <input
                placeholder="المؤهل الدراسي"
                value={form.education}
                onChange={(e) =>
                  setForm({ ...form, education: e.target.value })
                }
                className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lgbg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
              />
              <input
                placeholder="عمرك"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lgbg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
              />

              {/* Start Date - Full Width */}
              <div className="flex items-center gap-2">
                <label htmlFor="start-date">تاريخ الالتحاق بالعمل</label>
                <input
                  type="date"
                  name="start-date"
                  id="start-date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="col-span-1 sm:col-span-2 px-4 py-3 border-2 border-[#FFC400] rounded-lgbg-white-50 focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
              <div className="p-4 bg-red-50 border-l-4 border-[#DA0103] rounded-lg">
                <label className="block text-[#DA0103] font-bold mb-3 text-sm sm:text-base">
                  السيرة الذاتية (PDF أو Word):
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, "resume")}
                  className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFC400] file:text-[#DA0103] hover:file:bg-[#DA0103] hover:file:text-[#FFC400] cursor-pointer"
                />
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-[#DA0103] rounded-lg">
                <label className="block text-[#DA0103] font-bold mb-3 text-sm sm:text-base">
                  شهادة الخبرة (PDF أو Word):
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, "experienceCertificate")}
                  className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFC400] file:text-[#DA0103] hover:file:bg-[#DA0103] hover:file:text-[#FFC400] cursor-pointer"
                />
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="mt-6 p-4 sm:p-6 bg-red-50 border-2 border-dashed border-[#FFC400] rounded-lg">
              <label className="block text-[#DA0103] font-bold mb-4 text-sm sm:text-base">
                هل سبق لك العمل في مكان قبل؟
              </label>
              <div className="flex gap-6 sm:gap-8 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="workedBefore"
                    value="yes"
                    checked={form.workedBefore === "yes"}
                    onChange={(e) => setForm({ ...form, workedBefore: "yes" })}
                    className="w-4 h-4 accent-[#DA0103]"
                  />
                  <span className="text-gray-900 font-medium">نعم</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="workedBefore"
                    value="no"
                    checked={form.workedBefore === "no"}
                    onChange={(e) => setForm({ ...form, workedBefore: "no" })}
                    className="w-4 h-4 accent-[#DA0103]"
                  />
                  <span className="text-gray-900 font-medium">لا</span>
                </label>
              </div>

              {/* Previous Work Details */}
              {form.workedBefore === "yes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    placeholder="مكان العمل السابق"
                    value={form.previousJobs}
                    onChange={(e) =>
                      setForm({ ...form, previousJobs: e.target.value })
                    }
                    className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lg bg-white focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
                  />
                  <input
                    placeholder="المسمى الوظيفي السابق"
                    value={form.previousTitle}
                    onChange={(e) =>
                      setForm({ ...form, previousTitle: e.target.value })
                    }
                    className="col-span-1 px-4 py-3 border-2 border-[#FFC400] rounded-lg bg-white focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={applyJob}
              className="w-full mt-8 bg-[#DA0103] text-[#FFC400] font-bold py-3 sm:py-4 px-6 rounded-lg text-base sm:text-lg hover:bg-[#FFC400] hover:text-[#DA0103] transition-all active:scale-95 shadow-lg hover:shadow-xl"
            >
              تقديم الطلب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

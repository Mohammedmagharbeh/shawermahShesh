"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: "", type: "" });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/jobs`);
      setJobs(res.data);
    } catch (err) {
      toast.error("فشل تحميل الوظائف");
      console.log(err);
    }
  };

  const addJob = async () => {
    if (!form.title || !form.type) {
      toast.error("يرجى تعبئة جميع الحقول");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/jobs`, form);
      toast.success("تم إضافة الوظيفة بنجاح");
      setForm({ title: "", type: "" });
      fetchJobs();
    } catch (err) {
      toast.error("حدث خطأ أثناء إضافة الوظيفة");
      console.log(err);
    }
  };

  const confirmDeleteJob = (jobId) => {
    toast((t) => (
      <span className="text-right">
        هل أنت متأكد من حذف هذه الوظيفة؟
        <div className="mt-3 flex gap-2 flex-row-reverse">
          <button
            onClick={async () => {
              await deleteJob(jobId);
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-[#DA0103] text-white rounded hover:bg-red-700 transition-colors text-sm font-bold"
          >
            نعم
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-[#FFC400] text-gray-900 rounded hover:bg-yellow-400 transition-colors text-sm font-bold"
          >
            لا
          </button>
        </div>
      </span>
    ));
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/jobs/${jobId}`);
      toast.success("تم حذف الوظيفة بنجاح");
      fetchJobs();
      if (selectedJob === jobId) setSelectedJob(null);
    } catch (err) {
      toast.error("حدث خطأ أثناء حذف الوظيفة");
      console.log(err);
    }
  };

  const viewApplications = async (jobId) => {
    setSelectedJob(jobId);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/jobs/applications/${jobId}`
      );
      setApplications(res.data);
    } catch (err) {
      toast.error("فشل تحميل المتقدمين");
      console.log(err);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 font-sans"
      dir="rtl"
    >
      {/* Toast */}
      <Toaster
        position="center-top"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "16px",
            direction: "rtl",
            textAlign: "right",
          },
        }}
      />

      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-4 border-[#DA0103]">
        <h1 className="text-3xl md:text-4xl font-bold text-[#DA0103] m-0">
          لوحة إدارة الوظائف
        </h1>
      </div>

      {/* Add Job Section */}
      <div className="bg-white border-2 border-[#DA0103] rounded-lg p-6 md:p-8 mb-8 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-[#DA0103] mt-0 pb-4 border-b-2 border-[#FFC400]">
          إضافة وظيفة جديدة
        </h2>

        <div className="flex flex-col gap-4 mt-6">
          {["title", "type"].map((field) => (
            <div key={field}>
              <label className="text-gray-900 font-bold block mb-2 text-sm md:text-base">
                {field === "title" ? "اسم الوظيفة" : "وصف الوظيفة"}
              </label>
              <input
                placeholder={
                  field === "title" ? "أدخل اسم الوظيفة" : "أدخل وصف الوظيفة"
                }
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-4 py-3 md:py-4 border-2 border-[#FFC400] rounded-lg text-base md:text-lg focus:outline-none focus:border-[#DA0103] focus:ring-2 focus:ring-[#DA0103]/20 transition-all bg-white"
              />
            </div>
          ))}

          <button
            onClick={addJob}
            className="bg-[#DA0103] text-white border-none px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-lg font-bold mt-2 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            ✓ إضافة وظيفة
          </button>
        </div>
      </div>

      {/* Jobs List Section */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-[#DA0103] pb-4 border-b-4 border-[#FFC400] mb-6">
          الوظائف الحالية
        </h2>

        {jobs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#FFC400] p-8 md:p-12 text-center rounded-lg">
            <p className="text-gray-600 text-lg md:text-xl">
              لا توجد وظائف حالياً
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border-2 border-[#FFC400] border-l-8 border-l-[#DA0103] p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-[#DA0103] font-bold text-lg md:text-xl mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-700 mb-3">{job.type}</p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => viewApplications(job._id)}
                    className="flex-1 bg-[#FFC400] text-gray-900 border-none px-4 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-yellow-300 transition-colors"
                  >
                    👥 عرض المتقدمين
                  </button>

                  <button
                    onClick={() => confirmDeleteJob(job._id)}
                    className="flex-1 bg-[#DA0103] text-white border-none px-4 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-red-700 transition-colors"
                  >
                    🗑️ حذف الوظيفة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Section */}
      {selectedJob && (
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-[#DA0103] pb-4 border-b-4 border-[#FFC400] mb-6">
            المتقدمين للوظيفة
          </h3>

          {applications.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#FFC400] p-8 md:p-12 text-center rounded-lg">
              <p className="text-gray-600 text-lg md:text-xl">
                لا يوجد متقدمين بعد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white border-2 border-[#FFC400] border-l-8 border-l-[#DA0103] p-4 md:p-6 rounded-lg shadow-md"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">الاسم:</b>{" "}
                      {app.applicantName}
                    </p>
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">الإيميل:</b>{" "}
                      {app.applicantEmail}
                    </p>
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">رقم الهاتف:</b> {app.phone}
                    </p>
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">الجنسية:</b>{" "}
                      {app.nationality}
                    </p>
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">المؤهل الدراسي:</b>{" "}
                      {app.education}
                    </p>
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">العمر:</b> {app.age}
                    </p>
                    <p className="text-sm md:text-base">
                      <b className="text-[#DA0103]">تاريخ البدء:</b>{" "}
                      {new Date(app.startDate).toLocaleDateString("ar-EG")}
                    </p>
                  </div>

                  <p className="text-sm md:text-base mb-3">
                    <b className="text-[#DA0103]">سبق العمل بمكان آخر:</b>{" "}
                    <span
                      className={`ms-2 px-3 py-1 rounded-full text-sm font-bold text-white inline-block ${
                        app.workedBefore === "yes"
                          ? "bg-[#DA0103]"
                          : "bg-gray-600"
                      }`}
                    >
                      {app.workedBefore === "yes" ? "نعم" : "لا"}
                    </span>
                  </p>

                  {app.workedBefore === "yes" && (
                    <div className="bg-red-50 p-3 md:p-4 rounded-lg mb-4">
                      <p className="text-sm md:text-base mb-2">
                        <b className="text-[#DA0103]">العمل السابق:</b>{" "}
                        {app.previousJobs}
                      </p>
                      <p className="text-sm md:text-base">
                        <b className="text-[#DA0103]">المسمى الوظيفي السابق:</b>{" "}
                        {app.previousTitle}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <div className="flex-1">
                      <b className="text-[#DA0103] block mb-2">
                        السيرة الذاتية:
                      </b>
                      {app.resume ? (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-[#DA0103] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-bold hover:bg-red-700 transition-colors"
                        >
                          📄 عرض الملف
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">لم يُرفق</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <b className="text-[#DA0103] block mb-2">شهادة الخبرة:</b>
                      {app.experienceCertificate ? (
                        <a
                          href={app.experienceCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-[#FFC400] text-gray-900 px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-bold hover:bg-yellow-300 transition-colors"
                        >
                          📜 عرض الملف
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">لم يُرفق</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

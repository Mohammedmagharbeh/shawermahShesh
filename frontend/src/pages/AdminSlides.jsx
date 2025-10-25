"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { PlusCircle, Edit2, Trash2, ImageIcon, X } from "lucide-react"

const SERVER_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000"

export default function AdminSlides() {
  // State management
  const [slides, setSlides] = useState([])
  const [form, setForm] = useState({
    title: { ar: "", en: "" },
    subtitle: { ar: "", en: "" },
    image: "",
    relatedTo: "",
  })
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchSlides()
  }, [])

  // API Functions
  const fetchSlides = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/slides`)
      setSlides(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching slides:", error)
      setSlides([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await axios.put(`${SERVER_URL}/slides/${editId}`, form)
      } else {
        await axios.post(`${SERVER_URL}/slides`, form)
      }
      resetForm()
      fetchSlides()
    } catch (error) {
      console.error("Error saving slide:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/slides/${id}`)
      fetchSlides()
    } catch (error) {
      console.error("Error deleting slide:", error)
    }
  }

  const resetForm = () => {
    setForm({
      title: { ar: "", en: "" },
      subtitle: { ar: "", en: "" },
      image: "",
      relatedTo: "",
    })
    setEditId(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, image: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleEdit = (slide) => {
    setForm(slide)
    setEditId(slide._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="mb-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">إدارة الصور</h1>
          <p className="text-base text-gray-600 sm:text-lg">إضافة وتعديل وحذف صور العرض الرئيسية بسهولة</p>
        </header>

        <section className="mb-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-3">
              {editId ? (
                <Edit2 className="h-5 w-5 text-amber-600" />
              ) : (
                <PlusCircle className="h-5 w-5 text-amber-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">{editId ? "تعديل السلايد" : "إضافة سلايد جديد"}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">العنوان (عربي)</label>
                <input
                  type="text"
                  placeholder="أدخل العنوان بالعربية"
                  value={form.title.ar}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: { ...form.title, ar: e.target.value },
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Title (English)</label>
                <input
                  type="text"
                  placeholder="Enter title in English"
                  value={form.title.en}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: { ...form.title, en: e.target.value },
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">الوصف (عربي)</label>
                <input
                  type="text"
                  placeholder="أدخل الوصف بالعربية"
                  value={form.subtitle.ar}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subtitle: { ...form.subtitle, ar: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Subtitle (English)</label>
                <input
                  type="text"
                  placeholder="Enter subtitle in English"
                  value={form.subtitle.en}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subtitle: { ...form.subtitle, en: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-900">تابعة ل</label>
                <select
                  value={form.relatedTo}
                  onChange={(e) => setForm({ ...form, relatedTo: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">اختر القسم</option>
                  <option value="home-section1">Home Section 1</option>
                  <option value="home-section2">Home Section 2</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-900">الصورة</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-600 transition-colors file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-amber-600 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-amber-700"
                  />
                </div>
              </div>

              {form.image && (
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">معاينة الصورة</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="flex h-8 items-center gap-2 rounded-md px-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                      إزالة
                    </button>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img src={form.image || "/placeholder.svg"} alt="Preview" className="h-64 w-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {editId ? (
                  <>
                    <Edit2 className="h-4 w-4" />
                    تحديث السلايد
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    إضافة سلايد
                  </>
                )}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">الصور الحالية</h2>
            <div className="flex h-10 items-center rounded-full bg-amber-100 px-4 text-sm font-medium text-amber-700">
              {slides.length} صورة
            </div>
          </div>

          {slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">لا توجد صور حالياً</h3>
              <p className="text-sm text-gray-600">قم بإضافة صورة جديدة للبدء</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {slides.map((slide) => (
                <article
                  key={slide._id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={slide.image || "/placeholder.svg"}
                      alt={slide.title?.ar || slide.title?.en}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-1 text-lg font-bold leading-tight text-gray-900">
                      {slide.title?.ar}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">{slide.subtitle?.ar}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(slide)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(slide._id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

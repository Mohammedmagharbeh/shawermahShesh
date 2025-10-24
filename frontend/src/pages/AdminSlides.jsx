import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SERVER_URL = import.meta.env.VITE_BASE_URL;

export default function AdminSlides() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    relatedTo: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchSlides = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/slides`);
      setSlides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching slides:", error);
      setSlides([]);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${SERVER_URL}/slides/${editId}`, form);
      } else {
        await axios.post(`${SERVER_URL}/slides`, form);
      }
      setForm({ title: "", subtitle: "", image: "", relatedTo: "" });
      setEditId(null);
      fetchSlides();
    } catch (error) {
      console.error("Error saving slide:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/slides/${id}`);
      fetchSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  const handleImageChange = (e) => {
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(e.target.files[0]);
  };

  console.log(form);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            إدارة الصور
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            إضافة وتعديل وحذف صور العرض الرئيسية
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {editId ? "تعديل السلايد" : "إضافة سلايد جديد"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <Input
                placeholder="أدخل عنوان السلايد"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <Input
                placeholder="أدخل وصف السلايد"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تابعة ل
              </label>
              <Select
                value={form.relatedTo}
                onValueChange={(value) =>
                  setForm({ ...form, relatedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home-section1">Home Section 1</SelectItem>
                  <SelectItem value="home-section2">Home Section 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصورة
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>

            {form.image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  معاينة الصورة:
                </p>
                <img
                  src={form.image || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                />{" "}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              >
                {editId ? "تحديث السلايد" : "إضافة سلايد"}
              </Button>
              {editId && (
                <Button
                  type="button"
                  onClick={() => {
                    setForm({ title: "", subtitle: "", image: "" });
                    setEditId(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            الصور الحالية ({slides.length})
          </h2>
          {slides.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                لا توجد صور حالياً. قم بإضافة صورة جديدة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {slides.map((slide) => (
                <div
                  key={slide._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 sm:h-56 bg-gray-100">
                    <img
                      src={slide.image || "/placeholder.svg"}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {slide.subtitle}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setForm(slide);
                          setEditId(slide._id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                      >
                        تعديل
                      </Button>
                      <Button
                        onClick={() => handleDelete(slide._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm"
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

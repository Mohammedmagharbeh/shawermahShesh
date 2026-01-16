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
import { useUser } from "@/contexts/UserContext";
import Loading from "@/componenet/common/Loading";
import { useTranslation } from "react-i18next";

const SERVER_URL = import.meta.env.VITE_BASE_URL;

export default function AdminSlides() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState({
    title: { ar: "", en: "" },
    subtitle: { ar: "", en: "" },
    image: "",
    relatedTo: "",
  });
  const [editId, setEditId] = useState(null);
  const { user } = useUser();
  const { t } = useTranslation();

  const fetchSlides = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/slides`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user?.token}`,
        },
      });
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
        await axios.put(`${SERVER_URL}/slides/${editId}`, form, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        });
      } else {
        await axios.post(`${SERVER_URL}/slides`, form, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        });
      }
      setForm({
        title: { ar: "", en: "" },
        subtitle: { ar: "", en: "" },
        image: "",
        relatedTo: "",
      });
      setEditId(null);
      fetchSlides();
    } catch (error) {
      console.error("Error saving slide:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/slides/${id}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
      });
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

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pt-20!">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t("images_upload")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t("manage_slides_description")}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {editId ? t("edit_slide") : t("add_new_slide")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Arabic Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("arabic_name")}
              </label>
              <Input
                placeholder={t("enter_arabic_title")}
                value={form.title.ar}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: { ...form.title, ar: e.target.value },
                  })
                }
              />
            </div>

            {/* English Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("english_name")}
              </label>
              <Input
                placeholder={t("enter_english_title")}
                value={form.title.en}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: { ...form.title, en: e.target.value },
                  })
                }
              />
            </div>

            {/* Arabic Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("arabic_description")}
              </label>
              <Input
                placeholder={t("enter_arabic_subtitle")}
                value={form.subtitle.ar}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subtitle: { ...form.subtitle, ar: e.target.value },
                  })
                }
              />
            </div>

            {/* English Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("english_description")}
              </label>
              <Input
                placeholder={t("enter_english_subtitle")}
                value={form.subtitle.en}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subtitle: { ...form.subtitle, en: e.target.value },
                  })
                }
              />
            </div>

            {/* Related To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("related_to")}
              </label>
              <Select
                value={form.relatedTo}
                onValueChange={(value) =>
                  setForm({ ...form, relatedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_section")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home-section1">{t("home_section_1")}</SelectItem>
                  <SelectItem value="home-section2">{t("home_section_2")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("image")}
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>

            {/* Image Preview */}
            {form.image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("image_preview")}:
                </p>
                <img
                  src={form.image || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              >
                {editId ? t("update_slide") : t("add_slide")}
              </Button>
              {editId && (
                <Button
                  type="button"
                  onClick={() => {
                    setForm({
                      title: { ar: "", en: "" },
                      subtitle: { ar: "", en: "" },
                      image: "",
                      relatedTo: "",
                    });
                    setEditId(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  {t("cancel")}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Slides List */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {t("current_images")} ({slides.length})
          </h2>
          {slides.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                {t("no_images_yet")}
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
                      alt={slide.title?.ar || slide.title?.en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1">
                      {slide.title?.ar}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {slide.subtitle?.ar}
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
                        {t("edit")}
                      </Button>
                      <Button
                        onClick={() => handleDelete(slide._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm"
                      >
                        {t("delete")}
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

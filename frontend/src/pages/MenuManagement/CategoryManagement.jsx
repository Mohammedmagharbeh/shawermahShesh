import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function CategoryManagement() {
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const {
    categories,
    getCategory,
    updateCategory,
    deleteCategory,
    addCategory,
  } = useCategoryContext();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: { ar: "", en: "" } });

  const handleEdit = async (id) => {
    setEditingId(id);
    const category = await getCategory(id);

    setForm({ name: { ar: category.name.ar, en: category.name.en } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      updateCategory(form.name, editingId);
    } else {
      addCategory(form.name);
    }

    setForm({ name: { ar: "", en: "" } });
    setEditingId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">
          {t("manage_additions")}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t("add_addition_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4"
        >
          <Input
            placeholder="اسم الفئة عربي"
            value={form.name?.ar || ""}
            onChange={(e) =>
              setForm({
                name: { ar: e.target.value, en: form.name?.en },
              })
            }
            required
            className="w-full sm:flex-1"
            dir="rtl"
          />
          <Input
            placeholder="اسم الفئة انجليزي"
            value={form.name?.en || ""}
            onChange={(e) =>
              setForm({
                name: {
                  ar: form.name?.ar,
                  en: e.target.value,
                },
              })
            }
            required
            className="w-full sm:flex-1"
            dir="ltr"
          />

          <div className="flex gap-2 sm:flex-shrink-0">
            <Button type="submit" className="flex-1 sm:flex-initial">
              {editingId ? t("save_changes") : t("add_addition")}
            </Button>
            {editingId && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  deleteCategory(editingId);
                  setEditingId(null);
                  setForm({ name: { ar: "", en: "" } });
                }}
                variant="destructive"
                className="flex-1 sm:flex-initial"
              >
                Delete Category
              </Button>
            )}
          </div>
        </form>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
          {categories.map((cat, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={() => handleEdit(cat._id)}
              size="sm"
              className="whitespace-nowrap flex-shrink-0"
            >
              {cat.name?.[selectedLanguage] || cat.name.ar}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CategoryManagement;

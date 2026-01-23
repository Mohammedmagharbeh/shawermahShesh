import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { Trash2, Save, X } from "lucide-react";
import { useState } from "react";
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
    if (category) {
      setForm({ name: { ar: category.name.ar, en: category.name.en } });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: { ar: "", en: "" } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      updateCategory(form.name, editingId);
    } else {
      addCategory(form.name);
    }
    resetForm();
  };

  return (
    <Card className="w-full shadow-sm border border-border/50">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <CardTitle className="text-lg font-semibold">{t("manage_additions")}</CardTitle>
        <CardDescription>{t("add_addition_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-2">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Inputs: Stack on mobile, Side-by-side on 30rem+ */}
          <div className="grid grid-cols-1 min-[30rem]:grid-cols-2 gap-3">
            <Input
              placeholder="اسم الفئة عربي"
              value={form.name?.ar || ""}
              onChange={(e) => setForm({ name: { ...form.name, ar: e.target.value } })}
              required
              dir="rtl"
            />
            <Input
              placeholder="Category Name (EN)"
              value={form.name?.en || ""}
              onChange={(e) => setForm({ name: { ...form.name, en: e.target.value } })}
              required
              dir="ltr"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse min-[30rem]:flex-row gap-2">
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm} className="min-[30rem]:w-auto w-full">
                <X className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t("Cancel") || "Cancel"}
              </Button>
            )}

            <Button type="submit" className="min-[30rem]:w-auto w-full flex-1 min-[30rem]:flex-none">
              <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {editingId ? t("save_changes") : t("add_addition")}
            </Button>

            {editingId && (
              <Button
                type="button"
                onClick={(e) => { e.preventDefault(); deleteCategory(editingId); resetForm(); }}
                className="min-[30rem]:w-auto w-full text-white min-[30rem]:ml-auto"
                style={{ backgroundColor: "var(--color-button2)" }}
              >
                <Trash2 className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t("Delete") || "Delete"}
              </Button>
            )}
          </div>
        </form>

        <div className="h-px bg-button2 w-full my-4" />

        {/* Categories List */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <Button
              key={i}
              type="button"
              variant={editingId === cat._id ? "default" : "white"}
              onClick={() => handleEdit(cat._id)}
              size="sm"
              className={`transition-all ${editingId !== cat._id ? "border hover:opacity-80" : ""}`}
            >
              {cat.name?.[selectedLanguage] || cat.name.ar}
            </Button>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">{t("no_categories")}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default CategoryManagement;
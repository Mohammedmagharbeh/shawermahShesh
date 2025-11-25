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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function AdditionsManagement() {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { categories, fetchCategories, getCategory, updateCategory } =
    useCategoryContext();
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
    <Card>
      <CardHeader>
        <CardTitle>{t("manage_additions")}</CardTitle>
        <CardDescription>{t("add_addition_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-4"
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
          />

          {/* <Select className="mt-1.5">
            <SelectTrigger>
              <SelectValue placeholder={t("choose_category")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat, index) => (
                <SelectItem
                  key={index}
                  value={i18n.language === "ar" ? cat.name.ar : cat.name.en}
                >
                  {i18n.language === "ar" ? cat.name.ar : cat.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <Button type="submit">
            {editingId ? t("save_changes") : t("add_addition")}
          </Button>
        </form>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
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

        {/* قائمة الإضافات */}
        {/* {additions.length === 0 ? (
          <p className="text-muted-foreground text-center">
            {t("no_additions")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {additions.map((addition) => (
              <Card
                key={addition._id}
                className="p-3 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {addition.name[selectedLanguage]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {addition.price} {t("jod")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {addition.category}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={() => handleAdditionEdit(addition)}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    // onClick={() => handleAdditionDelete(addition._id)}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}

export default AdditionsManagement;

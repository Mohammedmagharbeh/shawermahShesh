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
import { CATEGORIES } from "@/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function AdditionsManagement() {
  const [editingAdditionId, setEditingAdditionId] = useState(null);
  const { i18n } = useTranslation();
  const [additions, setAdditions] = useState([]);
  const [additionForm, setAdditionForm] = useState({
    name: { ar: "", en: "" },
    price: "",
    category: "",
  });
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  // جلب الإضافات
  useEffect(() => {
    const fetchAdditions = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/additions`
        );
        setAdditions(res.data.additions);
      } catch (error) {
        console.error("Error fetching additions:", error);
      }
    };
    fetchAdditions();
  }, []);

  // دوال الإضافات
  const handleAdditionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdditionId) {
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/additions/${editingAdditionId}`,
          additionForm
        );
        setAdditions(
          additions.map((a) => (a._id === editingAdditionId ? res.data : a))
        );
        setEditingAdditionId(null);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/additions`,
          additionForm
        );
        setAdditions([res.data, ...additions]);
      }
      setAdditionForm({ arName: "", enName: "", price: "", category: "" });
      toast.success(editingAdditionId ? t("edit_addition") : t("Add Addition"));
    } catch (error) {
      console.error("Error submitting addition:", error);
      toast.error(t("submit_error"));
    }
  };

  const handleAdditionDelete = async (id) => {
    toast((toastInstance) => (
      <div className="flex flex-col gap-2">
        <span>{t("confirm_delete")}</span>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(toastInstance.id)}
          >
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              try {
                await axios.delete(
                  `${import.meta.env.VITE_BASE_URL}/additions/${id}`
                );
                setAdditions(additions.filter((a) => a._id !== id));
                toast.success(t("addition_deleted"));
                toast.dismiss(toastInstance.id);
              } catch (error) {
                console.error("خطأ في الحذف:", error);
                toast.error(t("delete_error"));
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    ));
  };

  const handleAdditionEdit = (addition) => {
    setAdditionForm({
      arName: addition.name.ar || "",
      enName: addition.name.en || "",
      price: addition.price,
      category: addition.category,
    });
    setEditingAdditionId(addition._id);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("manage_additions")}</CardTitle>
        <CardDescription>{t("add_addition_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* نموذج إضافة أو تعديل الإضافة */}
        <form
          onSubmit={handleAdditionSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-4"
        >
          <Input
            placeholder="اسم الاضافة عربي"
            value={additionForm.name?.ar || ""}
            onChange={(e) =>
              setAdditionForm({
                ...additionForm,
                name: { ar: e.target.value, en: additionForm.name?.en },
              })
            }
            required
          />
          <Input
            placeholder="اسم الاضافة انجليزي"
            value={additionForm.name?.en || ""}
            onChange={(e) =>
              setAdditionForm({
                ...additionForm,
                name: {
                  ar: additionForm.name?.ar,
                  en: e.target.value,
                },
              })
            }
            required
          />
          <Input
            placeholder={t("addition_price")}
            type="number"
            value={additionForm.price}
            onChange={(e) =>
              setAdditionForm({
                ...additionForm,
                price: e.target.value,
              })
            }
            required
          />
          <Select
            onValueChange={(value) => {
              const selectedCategory = CATEGORIES.find(
                (cat) => cat[i18n.language === "ar" ? "ar" : "en"] === value
              );
              setAdditionForm({
                ...additionForm,
                category: selectedCategory?.en, // always store English value for backend
              });
            }}
            className="mt-1.5"
          >
            <SelectTrigger>
              <SelectValue placeholder={t("choose_category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat, index) => (
                <SelectItem
                  key={index}
                  value={i18n.language === "ar" ? cat.ar : cat.en}
                >
                  {i18n.language === "ar" ? cat.ar : cat.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">
            {editingAdditionId ? t("save_changes") : t("add_addition")}
          </Button>
        </form>

        {/* قائمة الإضافات */}
        {additions.length === 0 ? (
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
                    onClick={() => handleAdditionEdit(addition)}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAdditionDelete(addition._id)}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdditionsManagement;

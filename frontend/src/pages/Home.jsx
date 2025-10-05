import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ShoppingCart,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Award,
  Users,
  Heart,
  Loader2,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import burger from "../assets/burger.jpg";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
// عدد المنتجات التي ستظهر مبدئيًا
const PRODUCTS_PER_PAGE = 6;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [productsToShow, setProductsToShow] = useState(PRODUCTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const location = useLocation(); // ✨ استخدام useLocation لقراءة الهاش
  const { t } = useTranslation();

  // جلب البيانات وتعيين حالة المنتجات الأساسية
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.data || [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
        const cats = ["الكل", ...new Set(allProducts.map((p) => p.category))];
        setCategories(cats);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  }, []);

  // ✨ منطق التمرير السلس عند العودة من صفحة أخرى
  useEffect(() => {
    // التأكد من أن جميع المكونات قد تم تحميلها والـ products قد تم جلبها
    if (location.hash && !isLoading) {
      const id = location.hash.substring(1); // إزالة رمز #
      const element = document.getElementById(id);

      // تأخير بسيط لضمان انتهاء تحديث الـ DOM والتمرير بسلاسة
      const timer = setTimeout(() => {
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

      return () => clearTimeout(timer); // تنظيف المؤقت
    } else if (!location.hash) {
      // إذا لا يوجد هاش، تأكد من أن الصفحة تبدأ من الأعلى عند التحميل العادي
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash, isLoading]); // يعتمد على تغير الهاش وحالة التحميل

  // فلترة المنتجات عند تغير البحث أو التصنيف
  useEffect(() => {
    let filtered = products;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "الكل") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
    setProductsToShow(PRODUCTS_PER_PAGE); // إعادة تعيين العدد المعروض عند كل فلترة
  }, [products, searchTerm, selectedCategory]);

  // دالة لإظهار جميع المنتجات
  const handleShowMore = () => {
    setProductsToShow(filteredProducts.length);
  };

  // المنتجات التي سيتم عرضها فعلياً (تستخدم في JSX)
  const displayedProducts = filteredProducts.slice(0, productsToShow);
  // هل مازال هناك منتجات لإظهارها؟ (تستخدم في منطق زر "إظهار المزيد")
  const hasMoreProducts = filteredProducts.length > productsToShow;

  return (
    <div className="min-h-screen bg-background arabic-font" dir="rtl">
      {/* قسم الرئيسية - تأكد من وجود id="home" */}
      <section
        id="home"
        className="pt-24 pb-16 bg-gradient-to-br from-red-50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="text-center lg:text-right">
              <Badge className="mb-6 bg-red-100 text-red-700 border-red-200 px-4 py-2">
                <Award className="h-4 w-4 ml-2" />
                {t("best_in_town")}
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                <span className="text-red-700"> {t("resturant_name")}</span>
                <br />
                {t("taste_unforgettable")}
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                {t("welcome_description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-red-700 hover:bg-red-800 text-white px-8 py-3"
                >
                  {t("order_now")}
                  <ShoppingCart className="mr-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <img
                src={burger}
                alt="شاورما شيش"
                className="rounded-2xl shadow-xl w-full h-auto"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-700 text-white px-3 py-1">
                  {t("fresh_daily")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم الإحصائيات (لم يتم تغيير ID) */}
      <section className="py-16 bg-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-red-100">{t("years_of_experience")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100k+</div>
              <div className="text-red-100">{t("happy_customers")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-red-100">{t("fresh_ingredients")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">09:00AM - 03:00AM</div>
              <div className="text-red-100">{t("delivery_service")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم القائمة - تأكد من وجود id="menu" */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 px-4 py-2">
              <ChefHat className="h-4 w-4 ml-2" />
              {t("menu")}
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t("menu_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("menu_description")}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
            <div className="w-full lg:w-80">
              <input
                type="text"
                placeholder={t("search_your_favorite_dish")}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <Button
                  key={i}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 ${
                    selectedCategory === cat
                      ? "bg-red-700 hover:bg-red-800 text-white"
                      : "border-red-700 text-red-700 hover:bg-red-50"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* حالة التحميل */}
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-red-700 mx-auto mb-4" />
              <p className="text-gray-600">{t("loading_products")}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* عرض المنتجات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedProducts.map((product) => (
                  <Card
                    key={product._id}
                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white"
                  >
                    <div className="relative">
                      <img
                        src={product.image || burger}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-700 text-white">
                          {product.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          {product.discount > 0 ? (
                            <>
                              {/* السعر الأصلي مع خط */}
                              <p className="text-gray-500 line-through text-sm">
                                {product.price} د.أ
                              </p>

                              {/* السعر بعد الخصم */}
                              <p className="text-2xl font-bold text-red-700">
                                {product.discountedPrice
                                  ? product.discountedPrice
                                  : product.price -
                                    (product.price * product.discount) / 100}
                                د.أ
                              </p>

                              {/* نسبة الخصم */}
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                خصم {product.discount}%
                              </span>
                            </>
                          ) : (
                            <p className="text-2xl font-bold text-red-700">
                              {product.price} د.أ
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => addToCart(product._id)}
                          className="bg-red-700 hover:bg-red-800 text-white px-6 py-2"
                        >
                          {t("add_to_cart")}
                          <ShoppingCart className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* زر "إظهار المزيد" يظهر فقط إذا كان هناك المزيد من المنتجات */}
              {hasMoreProducts && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleShowMore}
                    size="lg"
                    className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3"
                  >
                    {t("show_more_products", {
                      count: filteredProducts.length - productsToShow,
                    })}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">
                {t("no_results_title")}
              </h3>
              <p className="text-gray-600">{t("no_results_description")}</p>
            </div>
          )}
        </div>
      </section>

      {/* قسم من نحن - تأكد من وجود id="about" */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-red-100 text-red-700 border-red-200 px-4 py-2">
                <Heart className="h-4 w-4 ml-2" />
                {t("our_story")}
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                {t("story_title")}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t("story_description")}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <Award className="h-8 w-8 text-red-700 mx-auto" />
                    <h4 className="font-bold text-sm">{t("high_quality")}</h4>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <Users className="h-8 w-8 text-red-700 mx-auto" />
                    <h4 className="font-bold text-sm">
                      {" "}
                      {t("professional_team")}
                    </h4>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <Clock className="h-8 w-8 text-red-700 mx-auto" />
                    <h4 className="font-bold text-sm"> {t("fast_service")}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <img
                src="https://scontent.fadj1-1.fna.fbcdn.net/v/t39.30808-6/472238019_122212350974069185_5089714023424660035_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=-T7Lk-loCQcQ7kNvwEgN31q&_nc_oc=AdmB0m-eK1W7DVxz_okSOzvmS5U4TbBl4J-at5hp3JcHubDYaerdGwnPl8LBEywCRZA&_nc_zt=23&_nc_ht=scontent.fadj1-1.fna&_nc_gid=vYeRhwov-vuv5fkKzFMEUw&oh=00_AfaiB7cKaNfCTZVJOXTbqIRWxlitg2_AXTLLU0cZqU9q7A&oe=68E05936"
                alt="مطبخنا"
                className="rounded-2xl shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* قسم اتصل بنا - تأكد من وجود id="contact" */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 px-4 py-2">
              <Phone className="h-4 w-4 ml-2" />
              {t("contact_us")}
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t("contact_section_title")}
            </h2>
            <p className="text-lg text-gray-600">
              {" "}
              {t("contact_section_description")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg bg-white">
              <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <a
                  href="https://maps.app.goo.gl/krQ9B5eYkjgVz9es6?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-8 w-8 text-red-700 cursor-pointer hover:scale-110 transition" />
                </a>
              </div>
              <h3 className="text-xl font-bold mb-4">{t("our_location")}</h3>
              <p className="text-gray-600">
                {t("location_line1")}
                <br />
                {t("location_line2")}
              </p>
            </Card>

            <a href="tel:+96332019099">
              <Card className="text-center p-8 border-0 shadow-lg bg-white cursor-pointer hover:shadow-xl transition">
                <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="text-xl font-bold mb-4"> {t("call_us")}</h3>
                <p className="text-gray-600">
                  (03) 201 9099
                  <br />
                  {t("contact_info")}
                </p>
              </Card>
            </a>

            <Card className="text-center p-8 border-0 shadow-lg bg-white">
              <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-8 w-8 text-red-700" />
              </div>
              <h3 className="text-xl font-bold mb-4"> {t("working_hours")}</h3>
              <p className="text-gray-600">
                {t("working_hours_start")}
                <br />
                {t("working_hours_end")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t("resturant_name")}</h3>
                <p className="text-gray-400 text-sm">
                  {" "}
                  {t("resturant_tagline")}{" "}
                </p>
              </div>
            </div>

            <p className="text-gray-400 mb-6"> {t("taste_unforgettable")}</p>

            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-gray-400"> {t("rating")} </span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                {t("all_rights_reserved")}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

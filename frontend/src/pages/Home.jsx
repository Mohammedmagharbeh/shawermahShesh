import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Clock, MapPin, Phone, Menu, X, ChefHat, Award, Users, Heart } from "lucide-react"

export default function Home() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const userId = "68d53731440f4c97ce2c036f" // بدّلها بالـ userId الحقيقي (ممكن تجيبها من localStorage بعد تسجيل الدخول)

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data)
        setFilteredProducts(data.data)
        const cats = ["الكل", ...new Set(data.data.map((p) => p.category))]
        setCategories(cats)
      })
      .catch((err) => {
        console.log("Error fetching products:", err)
        alert("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.")        
      })
  }, [])

  useEffect(() => {
    let filtered = products

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    if (selectedCategory !== "الكل") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }
    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const addToCart = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userId}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      const data = await response.json()

      if (response.ok) {
        setCartCount((prev) => prev + 1)
        alert("تمت الإضافة إلى السلة ✅")
        console.log("Cart updated:", data)
      } else {
        alert("خطأ: " + data.message)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      // في حالة فشل الاتصال، أضف للعداد المحلي فقط
      setCartCount((prev) => prev + 1)
      alert("تمت الإضافة إلى السلة ✅")
    }
  }

  return (
    <div className="min-h-screen bg-background arabic-font">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-700">شاورما شيش</h1>
                <p className="text-xs text-gray-600">طعم أصيل ولذيذ</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-gray-700 hover:text-red-700 font-medium transition-colors">
                الرئيسية
              </a>
              <a href="#menu" className="text-gray-700 hover:text-red-700 font-medium transition-colors">
                القائمة
              </a>
              <a href="#about" className="text-gray-700 hover:text-red-700 font-medium transition-colors">
                من نحن
              </a>
              <a href="#contact" className="text-gray-700 hover:text-red-700 font-medium transition-colors">
                اتصل بنا
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-700">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col gap-4 pt-4">
                <a href="#home" className="text-gray-700 hover:text-red-700 font-medium">
                  الرئيسية
                </a>
                <a href="#menu" className="text-gray-700 hover:text-red-700 font-medium">
                  القائمة
                </a>
                <a href="#about" className="text-gray-700 hover:text-red-700 font-medium">
                  من نحن
                </a>
                <a href="#contact" className="text-gray-700 hover:text-red-700 font-medium">
                  اتصل بنا
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section id="home" className="pt-24 pb-16 bg-gradient-to-br from-red-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="text-center lg:text-right">
              <Badge className="mb-6 bg-red-100 text-red-700 border-red-200 px-4 py-2">
                <Award className="h-4 w-4 ml-2" />
                أفضل شاورما في المدينة
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                <span className="text-red-700">شاورما شيش</span>
                <br />
                طعم لا يُنسى
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                نقدم لكم أشهى أنواع الشاورما والشيش المحضرة بأجود المكونات وأفضل الطرق التقليدية
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white px-8 py-3">
                  اطلب الآن
                  <ShoppingCart className="mr-2 h-5 w-5" />
                </Button>

              </div>

              
            </div>

            <div className="relative">
              <img
                src="https://scontent.fadj1-1.fna.fbcdn.net/v/t39.30808-6/476454852_122217977474069185_4322824607711777600_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=dd4XTtVu-oQQ7kNvwG9sIu1&_nc_oc=Admi4bZoX5TL8FA1IKnukMZp0SjENBexVrx6C4HVMRnyK9MF11cc9Hm_trDhXuK47LQ&_nc_zt=23&_nc_ht=scontent.fadj1-1.fna&_nc_gid=x2jZce-ReEMKXr2SybzW6w&oh=00_AfZWq6YgcVUK1rDUxdRXp68u_eSAosWuQux81-FaRdhdng&oe=68E03B01"
                alt="شاورما شيش"
                className="rounded-2xl shadow-xl w-full h-auto"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-700 text-white px-3 py-1">طازج يومياً</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-red-100">سنة خبرة</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100k+</div>
              <div className="text-red-100">عميل سعيد</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-red-100">مكونات طازجة</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">

                    09:00Am  -  03:00Am

              </div>
              <div className="text-red-100">خدمة التوصيل</div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 px-4 py-2">
              <ChefHat className="h-4 w-4 ml-2" />
              قائمة الطعام
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">تشكيلتنا المميزة</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              اختر من تشكيلة واسعة من أشهى الأطباق المحضرة بعناية فائقة
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
            <div className="w-full lg:w-80">
              <input
                type="text"
                placeholder="ابحث عن طبقك المفضل..."
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

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white"
                >
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-700 text-white">{product.category}</Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-red-700">{product.price} د.أ</div>
                      <Button
                        onClick={() => addToCart(product._id)}
                        className="bg-red-700 hover:bg-red-800 text-white px-6 py-2"
                      >
                        أضف للسلة
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600">جرب البحث بكلمات أخرى أو اختر تصنيف مختلف</p>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-red-100 text-red-700 border-red-200 px-4 py-2">
                <Heart className="h-4 w-4 ml-2" />
                قصتنا
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">تراث من النكهات الأصيلة</h2>
             <p className="text-lg text-gray-600 mb-8">
   نحرص على تقديم برغر وشاورما طازجة ولذيذة تجمع بين النكهة الأصيلة والجودة الممتازة 
</p>


              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <Award className="h-8 w-8 text-red-700 mx-auto" />
                  </div>
                  <h4 className="font-bold text-sm">جودة عالية</h4>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <Users className="h-8 w-8 text-red-700 mx-auto" />
                  </div>
                  <h4 className="font-bold text-sm">فريق محترف</h4>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <Clock className="h-8 w-8 text-red-700 mx-auto" />
                  </div>
                  <h4 className="font-bold text-sm">خدمة سريعة</h4>
                </div>
              </div>

              {/* <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white px-8 py-3">
                اعرف المزيد
              </Button> */}
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

      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 px-4 py-2">
              <Phone className="h-4 w-4 ml-2" />
              تواصل معنا
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">نحن في خدمتكم</h2>
            <p className="text-lg text-gray-600">فريقنا جاهز لخدمتكم</p>
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
  <h3 className="text-xl font-bold mb-4">موقعنا</h3>
  <p className="text-gray-600">
    العقبة، سوق الثامنة
    <br />
    شارع الملك فيصل
  </p>
</Card>


            <a href="tel:+96332019099">
  <Card className="text-center p-8 border-0 shadow-lg bg-white cursor-pointer hover:shadow-xl transition">
    <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
      <Phone className="h-8 w-8 text-red-700" />
    </div>
    <h3 className="text-xl font-bold mb-4">اتصل بنا</h3>
    <p className="text-gray-600">
      (03) 201 9099
      <br />
      للطلبات والاستفسارات
    </p>
  </Card>
</a>


            <Card className="text-center p-8 border-0 shadow-lg bg-white">
              <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-8 w-8 text-red-700" />
              </div>
              <h3 className="text-xl font-bold mb-4">ساعات العمل</h3>
              <p className="text-gray-600">
                يومياً من 9 صباحاً
                <br />
                حتى 3 بعد منتصف الليل
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
                <h3 className="text-2xl font-bold">شاورما شيش</h3>
                <p className="text-gray-400 text-sm">طعم أصيل ولذيذ</p>
              </div>
            </div>

            <p className="text-gray-400 mb-6">طعم لا يُنسى منذ 2021</p>

            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-400">4.9 من 5 نجوم</span>
              </div>
             
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">© 2025 شاورما شيش. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

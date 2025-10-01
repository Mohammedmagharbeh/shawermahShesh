import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  ImageIcon,
  Tag,
  Loader2,
} from "lucide-react"

const PRODUCTS_PER_PAGE = 20

export default function AdminProductPanel() {
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount: "",
    description: "",
    image: "",
    category: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [loading, setLoading] = useState(true)

  // جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await axios.get("http://localhost:5000/api/products")
        const allProducts = res.data.data || []
        setProducts(allProducts)
        const uniqueCategories = [...new Set(allProducts.map((p) => p.category))]
        setCategories(["الكل", ...uniqueCategories])
        setSelectedCategory("الكل")
      } catch (err) {
        console.error("Error fetching products:", err)
        alert("خطأ في جلب المنتجات.")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  // إضافة أو تعديل
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await axios.put(
          `http://127.0.0.1:5000/api/admin/updatefood/${editingId}`,
          {
            ...formData,
            price: Number(formData.price),
            discount: formData.discount ? Number(formData.discount) : 0,
          }
        )
        setProducts(products.map((p) => (p._id === editingId ? res.data : p)))
        setEditingId(null)
      } else {
        const res = await axios.post(
          "http://127.0.0.1:5000/api/admin/postfood",
          {
            ...formData,
            price: Number(formData.price),
            discount: formData.discount ? Number(formData.discount) : 0,
          }
        )
        setProducts([res.data, ...products])
      }

      setFormData({
        name: "",
        price: "",
        discount: "",
        description: "",
        image: "",
        category: "",
      })

      const res = await axios.get("http://localhost:5000/api/products")
      const allProducts = res.data.data || []
      const uniqueCategories = [...new Set(allProducts.map((p) => p.category))]
      setCategories(["الكل", ...uniqueCategories])
    } catch (error) {
      console.error("خطأ في الإرسال:", error.response?.data || error.message)
      alert("حدث خطأ أثناء الإرسال.")
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discount: product.discount?.toString() || "",
      description: product.description,
      image: product.image,
      category: product.category,
    })
    setEditingId(product._id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/deletefood/${id}`)
      setProducts(products.filter((p) => p._id !== id))
    } catch (error) {
      console.error("خطأ في الحذف:", error.response?.data || error.message)
      alert("حدث خطأ أثناء الحذف.")
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "الكل" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const displayedProducts = filteredProducts.slice(0, displayedCount)
  const hasMoreProducts = filteredProducts.length > displayedCount

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20"
      dir="rtl"
    >
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">لوحة إدارة المنتجات 🍔</h1>
              <p className="text-muted-foreground text-sm mt-1">
                إدارة قائمة الطعام والمنتجات
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl sticky top-24">
              <CardHeader>
                <CardTitle>
                  {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "قم بتعديل بيانات المنتج الحالي"
                    : "أضف منتج جديد إلى القائمة"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name">اسم المنتج</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">السعر (دينار)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount">نسبة الخصم (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="مثال: 10"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">الفئة</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">رابط الصورة</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
                  </Button>

                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setFormData({
                          name: "",
                          price: "",
                          discount: "",
                          description: "",
                          image: "",
                          category: "",
                        })
                      }}
                      className="w-full"
                    >
                      إلغاء التعديل
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <Input
                    placeholder="ابحث عن منتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((cat, i) => (
                    <Button
                      key={i}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-lg text-muted-foreground">لا توجد منتجات</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {displayedProducts.map((product) => (
                  <Card key={product._id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge>{product.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">{product.name}</h3>
                        <span className="font-semibold text-primary">
                          {product.price} د
                        </span>
                      </div>
                      {product.discount > 0 && (
                        <p className="text-sm text-red-500">
                          خصم: {product.discount}%
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {product.description}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="ml-2 h-4 w-4" /> تعديل
                        </Button>
                        <Button
                          onClick={() => handleDelete(product._id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="ml-2 h-4 w-4" /> حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {hasMoreProducts && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() =>
                    setDisplayedCount(displayedCount + PRODUCTS_PER_PAGE)
                  }
                >
                  إظهار المزيد
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

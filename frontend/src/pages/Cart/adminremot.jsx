
// import { useState, useEffect } from "react"
// import axios from "axios"
// import { Button } from "@/components/ui/button"
// import { Input } from "../../components/ui/input"
// import { Label } from "../../components/ui/label"
// import { Textarea } from "../../components/ui/textarea"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Plus, Search, Edit2, Trash2, Package, DollarSign, ImageIcon, Tag } from "lucide-react"

// export default function AdminProductPanel() {
//   const [products, setProducts] = useState([])
//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     description: "",
//     image: "",
//     category: "",
//   })
//   const [editingId, setEditingId] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filteredProducts, setFilteredProducts] = useState([]);


//   // تحميل البيانات من الباك اند
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/products");
//         const data = await res.json();
//         const allProducts = data.data || [];
//         setProducts(allProducts);

//         // عرض أول 20 عنصر
//         setDisplayedProducts(allProducts.slice(0, itemsToShow));

//         // التصنيفات
//         const cats = ["الكل", ...new Set(allProducts.map((p) => p.category))];
//         setCategories(cats);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         alert("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   // إضافة أو تعديل منتج
//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       if (editingId) {
//         const res = await axios.put(`http://127.0.0.1:5000/api/updatefood/${editingId}`, {
//           ...formData,
//           price: Number(formData.price),
//         })
//         setProducts(products.map((p) => (p._id === editingId ? res.data : p)))
//         setEditingId(null)
//       } else {
//         const res = await axios.post("http://127.0.0.1:5000/api/postfood", {
//           ...formData,
//           price: Number(formData.price),
//         })
//         setProducts([...products, res.data])
//       }
//       setFormData({ name: "", price: "", description: "", image: "", category: "" })
//     } catch (error) {
//       console.error("خطأ في الإرسال:", error.response?.data || error.message)
//     }
//   }

//   // تفعيل وضع التعديل
//   const handleEdit = (product) => {
//     setFormData({
//       name: product.name,
//       price: product.price.toString(),
//       description: product.description,
//       image: product.image,
//       category: product.category,
//     })
//     setEditingId(product._id)
//   }

//   // حذف المنتج
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://127.0.0.1:5000/api/deletefood/${id}`)
//       setProducts(products.filter((p) => p._id !== id))
//     } catch (error) {
//       console.error("خطأ في الحذف:", error.response?.data || error.message)
//     }
//   }

//   // فلترة المنتجات للبحث
//   const filteredProducts = products.filter(
//     (p) =>
//       p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.category.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20" dir="rtl">
//       {/* Header */}
//       <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
//         <div className="container mx-auto px-4 py-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
//               <Package className="h-8 w-8 text-primary-foreground" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-foreground">لوحة إدارة المنتجات</h1>
//               <p className="text-muted-foreground text-sm mt-1">إدارة قائمة الطعام والمنتجات</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Form Section */}
//           <div className="lg:col-span-1">
//             <Card className="border-border/50 shadow-xl sticky top-24">
//               <CardHeader className="space-y-1 pb-4">
//                 <CardTitle className="text-2xl flex items-center gap-2">
//                   <div className="p-2 bg-primary/10 rounded-lg">
//                     <Plus className="h-5 w-5 text-primary" />
//                   </div>
//                   {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
//                 </CardTitle>
//                 <CardDescription>{editingId ? "قم بتعديل بيانات المنتج" : "أضف منتج جديد إلى القائمة"}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                   <div className="space-y-2">
//                     <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
//                       <Package className="h-4 w-4 text-primary" /> اسم المنتج
//                     </Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="مثال: برجر كلاسيك"
//                       required
//                       className="h-11"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
//                       <DollarSign className="h-4 w-4 text-primary" /> السعر (دينار)
//                     </Label>
//                     <Input
//                       id="price"
//                       type="number"
//                       value={formData.price}
//                       onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                       placeholder="45"
//                       required
//                       className="h-11"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
//                       <Tag className="h-4 w-4 text-primary" /> الفئة
//                     </Label>
//                     <Input
//                       id="category"
//                       value={formData.category}
//                       onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                       placeholder="مثال: برجر، بيتزا، مشروبات"
//                       required
//                       className="h-11"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="image" className="text-sm font-medium flex items-center gap-2">
//                       <ImageIcon className="h-4 w-4 text-primary" /> رابط الصورة
//                     </Label>
//                     <Input
//                       id="image"
//                       value={formData.image}
//                       onChange={(e) => setFormData({ ...formData, image: e.target.value })}
//                       placeholder="https://example.com/image.jpg"
//                       required
//                       className="h-11"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="description" className="text-sm font-medium">الوصف</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       placeholder="وصف تفصيلي للمنتج..."
//                       required
//                       rows={4}
//                       className="resize-none"
//                     />
//                   </div>

//                   <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
//                     <Plus className="ml-2 h-5 w-5" />
//                     {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
//                   </Button>

//                   {editingId && (
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         setEditingId(null)
//                         setFormData({ name: "", price: "", description: "", image: "", category: "" })
//                       }}
//                       className="w-full h-11"
//                     >
//                       إلغاء التعديل
//                     </Button>
//                   )}
//                 </form>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Products List Section */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Search Bar */}
//             <Card className="border-border/50 shadow-lg">
//               <CardContent className="pt-6">
//                 <div className="relative">
//                   <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                   <Input
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     placeholder="ابحث عن منتج أو فئة..."
//                     className="pr-10 h-12 text-base"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Products Grid */}
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold text-foreground">المنتجات ({filteredProducts.length})</h2>
//                 <Badge variant="secondary" className="px-4 py-2 text-sm">
//                   إجمالي: {products.length} منتج
//                 </Badge>
//               </div>

//               {filteredProducts.length === 0 ? (
//                 <Card className="border-dashed border-2">
//                   <CardContent className="flex flex-col items-center justify-center py-16">
//                     <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                     <p className="text-lg text-muted-foreground">لا توجد منتجات</p>
//                     <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة منتج جديد</p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-6">
//                   {filteredProducts.map((product) => (
//                     <Card key={product._id} className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-border/50 overflow-hidden">
//                       <div className="relative h-48 overflow-hidden bg-muted">
//                         <img
//                           src={product.image || "/placeholder.svg"}
//                           alt={product.name}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                         <div className="absolute top-3 left-3">
//                           <Badge className="bg-primary text-primary-foreground shadow-lg">{product.category}</Badge>
//                         </div>
//                       </div>

//                       <CardContent className="p-5 space-y-4">
//                         <div className="space-y-2">
//                           <div className="flex items-start justify-between gap-3">
//                             <h3 className="text-xl font-bold text-foreground leading-tight">{product.name}</h3>
//                             <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg shrink-0">
//                               <span className="text-lg font-bold text-primary">{product.price}</span>
//                               <span className="text-sm text-primary">دينار</span>
//                             </div>
//                           </div>
//                           <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
//                         </div>

//                         <div className="flex gap-2 pt-2">
//                           <Button onClick={() => handleEdit(product)} variant="outline" size="sm" className="flex-1 h-10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
//                             <Edit2 className="ml-2 h-4 w-4" /> تعديل
//                           </Button>
//                           <Button onClick={() => handleDelete(product._id)} variant="destructive" size="sm" className="flex-1 h-10 shadow-md hover:shadow-lg transition-shadow">
//                             <Trash2 className="ml-2 h-4 w-4" /> حذف
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit2, Trash2, Package, DollarSign, ImageIcon, Tag } from "lucide-react"

export default function AdminProductPanel() {
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [displayedCount, setDisplayedCount] = useState(20)
  const [loading, setLoading] = useState(true)

  // جلب البيانات من الباك اند
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products")
        setProducts(res.data.data || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        alert("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // إضافة أو تعديل منتج
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await axios.put(`http://127.0.0.1:5000/api/admin/updatefood/${editingId}`, {
          ...formData,
          price: Number(formData.price),
        })
        setProducts(products.map((p) => (p._id === editingId ? res.data : p)))
        setEditingId(null)
      } else {
        const res = await axios.post("http://127.0.0.1:5000/api/admin/postfood", {
          ...formData,
          price: Number(formData.price),
        })
        setProducts([res.data, ...products])
      }
      setFormData({ name: "", price: "", description: "", image: "", category: "" })
    } catch (error) {
      console.error("خطأ في الإرسال:", error.response?.data || error.message)
    }
  }

  // تفعيل وضع التعديل
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
      category: product.category,
    })
    setEditingId(product._id)
  }

  // حذف المنتج
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/deletefood/${id}`)      
      setProducts(products.filter((p) => p._id !== id))
    } catch (error) {
      console.error("خطأ في الحذف:", error.response?.data || error.message)
    }
  }

  // فلترة المنتجات للبحث
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // المنتجات التي سيتم عرضها (أول displayedCount عنصر)
  const displayedProducts = filteredProducts.slice(0, displayedCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20" dir="rtl">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">لوحة إدارة المنتجات</h1>
              <p className="text-muted-foreground text-sm mt-1">إدارة قائمة الطعام والمنتجات</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-xl sticky top-24">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
                </CardTitle>
                <CardDescription>{editingId ? "قم بتعديل بيانات المنتج" : "أضف منتج جديد إلى القائمة"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" /> اسم المنتج
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: برجر كلاسيك"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" /> السعر (دينار)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="45"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" /> الفئة
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="مثال: برجر، بيتزا، مشروبات"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" /> رابط الصورة
                    </Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف تفصيلي للمنتج..."
                      required
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
                    <Plus className="ml-2 h-5 w-5" />
                    {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setFormData({ name: "", price: "", description: "", image: "", category: "" })
                      }}
                      className="w-full h-11"
                    >
                      إلغاء التعديل
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Products List Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن منتج أو فئة..."
                    className="pr-10 h-12 text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">المنتجات ({filteredProducts.length})</h2>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  إجمالي: {products.length} منتج
                </Badge>
              </div>

              {displayedProducts.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground">لا توجد منتجات</p>
                    <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة منتج جديد</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {displayedProducts.map((product) => (
                    <Card key={product._id} className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-border/50 overflow-hidden">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-primary-foreground shadow-lg">{product.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-5 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-xl font-bold text-foreground leading-tight">{product.name}</h3>
                            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg shrink-0">
                              <span className="text-lg font-bold text-primary">{product.price}</span>
                              <span className="text-sm text-primary">دينار</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button onClick={() => handleEdit(product)} variant="outline" size="sm" className="flex-1 h-10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                            <Edit2 className="ml-2 h-4 w-4" /> تعديل
                          </Button>
                          <Button onClick={() => handleDelete(product._id)} variant="destructive" size="sm" className="flex-1 h-10 shadow-md hover:shadow-lg transition-shadow">
                            <Trash2 className="ml-2 h-4 w-4" /> حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* زر عرض المزيد */}
              {displayedCount < filteredProducts.length && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => setDisplayedCount(displayedCount + 20)}>إظهار المزيد</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


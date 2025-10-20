//   import { useState, useEffect } from "react"
// import axios from "axios"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Search, Edit2, Trash2, Package, Loader2 } from "lucide-react"
// import { useTranslation } from "react-i18next"
// import toast from "react-hot-toast"
// import product_placeholder from "../assets/product_placeholder.jpeg";

// const PRODUCTS_PER_PAGE = 20

// export default function AdminProductPanel() {
//   const { t } = useTranslation()
  

//   const [products, setProducts] = useState([])
//   const [formData, setFormData] = useState({
//     arName: "",
//     enName: "",
//     price: "",
//     discount: "",
//     arDescription: "",
//     enDescription: "",
//     image: "",
//     arCategory: "",
//     enCategory: "",
//   })
//   const [editingId, setEditingId] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [categories, setCategories] = useState([])
//   const [selectedCategory, setSelectedCategory] = useState("all")
//   const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
//   const [loading, setLoading] = useState(true)
//   const selectedLanguage = localStorage.getItem("i18nextLng") || "ar"

//   // الإضافات
//   const [additions, setAdditions] = useState([])
//   const [additionForm, setAdditionForm] = useState({ name: "", price: "" })
//   const [editingAdditionId, setEditingAdditionId] = useState(null)

//   // جلب المنتجات
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true)
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`)
//         const allProducts = res.data.data || []
//         setProducts(allProducts)
//         const uniqueCategories = [...new Set(allProducts.map((p) => p.category[selectedLanguage] || p.category))]
//         setCategories(["all", ...uniqueCategories])
//         setSelectedCategory("all")
//       } catch (err) {
//         console.error("Error fetching products:", err)
//         alert(t("fetch_products_error"))
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProducts()
//   }, [])

//   // جلب الإضافات
//   useEffect(() => {
//     const fetchAdditions = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/additions`)
//         setAdditions(res.data.additions)
//       } catch (error) {
//         console.error("Error fetching additions:", error)
//       }
//     }
//     fetchAdditions()
//   }, [])

//   // دوال المنتجات
//   const handleInputChange = (e) => {
//     const { id, value } = e.target
//     setFormData({ ...formData, [id]: value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       if (editingId) {
//         const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/admin/updatefood/${editingId}`, {
//           ...formData,
//           price: Number(formData.price),
//           discount: formData.discount ? Number(formData.discount) : 0,
//         })
//         setProducts(products.map((p) => (p._id === editingId ? res.data : p)))
//         setEditingId(null)
//       } else {
//         const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/admin/postfood`, {
//           ...formData,
//           name: { ar: formData.arName, en: formData.enName },
//           description: {
//             ar: formData.arDescription,
//             en: formData.enDescription,
//           },
//           price: Number(formData.price),
//           discount: formData.discount ? Number(formData.discount) : 0,
//         })
//         setProducts([res.data, ...products])
//       }

//       setFormData({
//         arName: "",
//         enName: "",
//         price: "",
//         discount: "",
//         arDescription: "",
//         enDescription: "",
//         image: "",
//         category: "",
//       })

//       const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`)
//       const allProducts = res.data.data || []
//       const uniqueCategories = [...new Set(allProducts.map((p) => p.category[selectedLanguage] || p.category))]
//       setCategories(["all", ...uniqueCategories])
//       toast.success(editingId ? "product_updated" : "product_added")
//     } catch (error) {
//       console.error("خطأ في الإرسال:", error.response?.data || error.message)
//       alert(t("submit_error"))
//     }
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         const imageData = reader.result
//         setFormData({ ...formData, image: imageData })
//       }
//       reader.readAsDataURL(file)
//     } else {
//       alert(t("choose_image"))
//     }
//   }

//   const handleEdit = (product) => {
//     setFormData({
//       arName: product.name.ar,
//       enName: product.name.en,
//       price: product.price.toString(),
//       discount: product.discount?.toString() || "",
//       arDescription: product.description.ar,
//       enDescription: product.description.en,
//       image: product.image,
//       arCategory: product.category.ar,
//       enCategory: product.category.en,
//     })
//     setEditingId(product._id)
//   }

//   const handleDelete = async (id) => {
//   toast((t) => (
//     <div className="flex flex-col gap-2">
//       <span>{t("confirm_delete")}</span>
//       <div className="flex justify-end gap-2 mt-2">
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => toast.dismiss(t.id)}
//         >
//           {t("cancel")}
//         </Button>
//         <Button
//           size="sm"
//           variant="destructive"
//           onClick={async () => {
//             try {
//               await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/deletefood/${id}`)
//               setProducts(products.filter((p) => p._id !== id))
//               toast.success("تم الحذف بنجاح")
//               toast.dismiss(t.id)
//             } catch (error) {
//               console.error("خطأ في الحذف:", error.response?.data || error.message)
//               toast.error(t("delete_error"))
//             }
//           }}
//         >
//           {t("delete")}
//         </Button>
//       </div>
//     </div>
//   ))
// }


//   // دوال الإضافات
//   const handleAdditionSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       if (editingAdditionId) {
//         const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/additions/${editingAdditionId}`, additionForm)
//         setAdditions(additions.map((a) => (a._id === editingAdditionId ? res.data : a)))
//         setEditingAdditionId(null)
//       } else {
//         const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/additions`, additionForm)
//         setAdditions([res.data, ...additions])
//       }
//       setAdditionForm({ name: "", price: "" })
//       toast.success(editingAdditionId ? "تم تعديل الإضافة" : "تمت إضافة الإضافة")
//     } catch (error) {
//       console.error("Error submitting addition:", error)
//     }
//   }
// const handleAdditionDelete = async (id) => {
  
//   toast((t) => (
//     <div className="flex flex-col gap-2">
//       <span>هل أنت متأكد من حذف الإضافة؟</span>
//       <div className="flex justify-end gap-2 mt-2">
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => toast.dismiss(t.id)}
//         >
//           إلغاء
//         </Button>
//         <Button
//           size="sm"
//           variant="destructive"
//           onClick={async () => {
//             try {
//               await axios.delete(`${import.meta.env.VITE_BASE_URL}/additions/${id}`)
//               setAdditions(additions.filter((a) => a._id !== id))
//               toast.success("تم حذف الإضافة")
//               toast.dismiss(t.id)
//             } catch (error) {
//               console.error("خطأ في الحذف:", error)
//               toast.error("حدث خطأ أثناء الحذف")
//             }
//           }}
//         >
//           حذف
//         </Button>
//       </div>
//     </div>
//   ))
// }


//   const handleAdditionEdit = (addition) => {
//     setAdditionForm({ name: addition.name, price: addition.price })
//     setEditingAdditionId(addition._id)
//   }

//   // فلترة المنتجات
//   const filteredProducts = products.filter((p) => {
//     const name = p.name?.[selectedLanguage] || ""
//     const categoryLang = typeof p.category === "object" ? p.category?.[selectedLanguage] || "" : p.category || ""

//     const matchesSearch =
//       name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       categoryLang.toLowerCase().includes(searchTerm.toLowerCase())

//     const matchesCategory = selectedCategory === "all" || categoryLang.toLowerCase() === selectedCategory.toLowerCase()

//     return matchesSearch && matchesCategory
//   })

//   const displayedProducts = filteredProducts.slice(0, displayedCount)
//   const hasMoreProducts = filteredProducts.length > displayedCount

//   const handleCategoryChange = (cat) => {
//     setSelectedCategory(cat)
//     setDisplayedCount(PRODUCTS_PER_PAGE)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
//       {/* Header */}
//       <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
//         <div className="container mx-auto px-4 py-8 mt-10">
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="p-2 sm:p-3 bg-primary rounded-lg sm:rounded-xl shadow-lg shadow-primary/20">
//               <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
//             </div>
//             <div>
//               <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t("admin_panel")}</h1>
//               <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">{t("admin_panel_desc")}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
//           {/* Form */}
//           <div className="lg:col-span-1">
//             <Card className="shadow-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto rounded-md">
//               <CardHeader className="p-4 sm:p-6">
//                 <CardTitle className="text-lg sm:text-xl">{editingId ? t("edit_product") : t("add_product")}</CardTitle>
//                 <CardDescription className="text-xs sm:text-sm">
//                   {editingId ? t("edit_existing_product") : t("add_new_product")}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 sm:p-6">
//                 <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
//                   <div className="flex flex-col">
//                     <Label htmlFor="arName" className="text-sm">
//                       {t("arabic_name")}
//                     </Label>
//                     <Input
//                       id="arName"
//                       value={formData.arName}
//                       onChange={handleInputChange}
//                       required
//                       className="mt-1.5"
//                       dir="rtl"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <Label htmlFor="enName" className="text-sm">
//                       {t("english_name")}
//                     </Label>
//                     <Input
//                       id="enName"
//                       value={formData.enName}
//                       onChange={handleInputChange}
//                       required
//                       className="mt-1.5"
//                       dir="ltr"
//                     />
//                   </div>

//                   <div className="flex flex-col">
//                     <Label htmlFor="price" className="text-sm">
//                       {t("price_jod")}
//                     </Label>
//                     <Input
//                       id="price"
//                       type="number"
//                       value={formData.price}
//                       onChange={handleInputChange}
//                       required
//                       min="0"
//                       step="0.01"
//                       className="mt-1.5"
//                     />
//                   </div>

//                   <div className="flex flex-col">
//                     <Label htmlFor="discount" className="text-sm">
//                       {t("discount_percentage")}
//                     </Label>
//                     <Input
//                       id="discount"
//                       type="number"
//                       value={formData.discount}
//                       onChange={handleInputChange}
//                       placeholder={t("discount_example")}
//                       min="0"
//                       max="100"
//                       className="mt-1.5"
//                     />
//                   </div>

//                   <div className="flex flex-col">
//                     <Label htmlFor="arCategory" className="text-sm">
//                       {t("ar_category")}
//                     </Label>
//                     <Input
//                       id="arCategory"
//                       value={formData.arCategory}
//                       onChange={handleInputChange}
//                       required
//                       className="mt-1.5"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <Label htmlFor="enCategory" className="text-sm">
//                       {t("en_category")}
//                     </Label>
//                     <Input
//                       id="enCategory"
//                       value={formData.enCategory}
//                       onChange={handleInputChange}
//                       required
//                       className="mt-1.5"
//                     />
//                   </div>

//                   <div className="flex flex-col">
//                     <Label htmlFor="image" className="text-sm">
//                       {t("product_image")}
//                     </Label>
//                     <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mt-1.5" />
//                   </div>

//                   <div className="flex flex-col">
//                     <Label htmlFor="arDescription" className="text-sm">
//                       {t("arabic_description")}
//                     </Label>
//                     <Textarea
//                       id="arDescription"
//                       value={formData.arDescription}
//                       onChange={handleInputChange}
//                       required
//                       rows={4}
//                       className="mt-1.5 border-2 border-input p-1 rounded-md"
//                       dir="rtl"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <Label htmlFor="enDescription" className="text-sm">
//                       {t("english_description")}
//                     </Label>
//                     <Textarea
//                       id="enDescription"
//                       value={formData.enDescription}
//                       onChange={handleInputChange}
//                       required
//                       rows={4}
//                       className="mt-1.5 border-2 border-input p-1 rounded-md"
//                       dir="ltr"
//                     />
//                   </div>

//                   <Button type="submit" className="w-full">
//                     {editingId ? t("save_changes") : t("add_product")}
//                   </Button>

//                   {editingId && (
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         setEditingId(null)
//                         setFormData({
//                           arName: "",
//                           enName: "",
//                           price: "",
//                           discount: "",
//                           arDescription: "",
//                           enDescription: "",
//                           image: "",
//                           category: "",
//                         })
//                       }}
//                       className="w-full"
//                     >
//                       {t("cancel_edit")}
//                     </Button>
//                   )}
//                 </form>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Products List */}
//           <div className="lg:col-span-2 space-y-4 sm:space-y-6">
//             {/* إدارة الإضافات */}
//             {/* إدارة الإضافات */}
// <Card>
//   <CardHeader>
//     <CardTitle>{t("manage_additions")}</CardTitle>
//     <CardDescription>{t("add_addition")} / {t("edit_addition")} / {t("delete_addition")}</CardDescription>
//   </CardHeader>
//   <CardContent>
//     {/* نموذج إضافة أو تعديل الإضافة */}
//     <form onSubmit={handleAdditionSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
//       <Input
//         placeholder={t("addition_name")}
//         value={additionForm.name}
//         onChange={(e) => setAdditionForm({...additionForm, name: e.target.value})}
//         required
//       />
//       <Input
//         placeholder={t("addition_price")}
//         type="number"
//         value={additionForm.price}
//         onChange={(e) => setAdditionForm({...additionForm, price: e.target.value})}
//         required
//       />
//       <Button type="submit">{editingAdditionId ? t("edit_addition") : t("add_addition")}</Button>
//     </form>

//     {/* قائمة الإضافات */}
//     {additions.length === 0 ? (
//       <p className="text-muted-foreground text-center">{t("no_additions")}</p>
//     ) : (
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {additions.map((addition) => (
//           <Card key={addition._id} className="p-3 flex flex-col justify-between">
//             <div>
//               <h3 className="font-semibold">{addition.name}</h3>
//               <p className="text-sm text-muted-foreground">{addition.price} {t("jod")}</p>
//             </div>
//             <div className="flex gap-2 mt-3">
//               <Button variant="outline" size="sm" onClick={() => handleAdditionEdit(addition)}>{t("edit_addition")}</Button>
//               <Button variant="destructive" size="sm" onClick={() => handleAdditionDelete(addition._id)}>{t("delete_addition")}</Button>
//             </div>
//           </Card>
//         ))}
//       </div>
//     )}
//   </CardContent>
// </Card>

//             <Card>
//               <CardContent className="p-4 sm:p-6">
//                 <div className="relative mb-4">
//                   <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
//                   <Input
//                     placeholder={t("search_product")}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pr-10 text-sm sm:text-base"
//                   />
//                 </div>

//                 <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
//                   {categories.map((cat, i) => (
//                     <Button
//                       key={i}
//                       variant={selectedCategory === cat ? "default" : "outline"}
//                       onClick={() => handleCategoryChange(cat)}
//                       className="whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
//                       size="sm"
//                     >
//                       {cat === "all" ? t("all") : cat}
//                     </Button>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {loading ? (
//               <div className="flex justify-center items-center py-12 sm:py-20">
//                 <Loader2 className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary" />
//               </div>
//             ) : displayedProducts.length === 0 ? (
//               <Card className="border-dashed border-2">
//                 <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
//                   <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
//                   <p className="text-base sm:text-lg text-muted-foreground">{t("no_products")}</p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                 {displayedProducts.map((product) => (
//                   <Card key={product._id} className="overflow-hidden">
//                     <div className="relative h-40 sm:h-48 bg-muted">
//                       <img
//                         src={product.image || product_placeholder}
//                         alt={product.name[selectedLanguage]}
//                         className="w-full h-full object-cover"
//                       />
//                       <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
//                         <Badge className="text-xs">{product.category[selectedLanguage] || product.category}</Badge>
//                       </div>
//                     </div>
//                     <CardContent className="p-3 sm:p-5">
//                       <div className="flex justify-between items-start gap-2">
//                         <h3 className="font-bold text-sm sm:text-base line-clamp-1">
//                           {product.name[selectedLanguage]}
//                         </h3>
//                         <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap">
//                           {product.price} {t("jod")}
//                         </span>
//                       </div>
//                       {product.discount > 0 && (
//                         <p className="text-xs sm:text-sm text-red-500 mt-1">
//                           {t("discount")}: {product.discount}%
//                         </p>
//                       )}
//                       <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
//                         {product.description[selectedLanguage]}
//                       </p>
//                       {/* Action Buttons - تم إضافتها هنا */}
//                       <div className="flex gap-2 mt-3 sm:mt-4">
//                         <Button
//                           onClick={() => handleEdit(product)}
//                           variant="outline"
//                           size="sm"
//                           className="flex-1 text-xs sm:text-sm"
//                         >
//                           <Edit2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("edit")}
//                         </Button>
//                         <Button
//                           onClick={() => handleDelete(product._id)}
//                           variant="destructive"
//                           size="sm"
//                           className="flex-1 text-xs sm:text-sm"
//                         >
//                           <Trash2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("delete")}
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}

//             {hasMoreProducts && (
//               <div className="text-center mt-4 sm:mt-6">
//                 <Button variant="outline" onClick={() => setDisplayedCount((prev) => prev + PRODUCTS_PER_PAGE)}>
//                   {t("show_more")}
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Edit2, Trash2, Package, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"
import product_placeholder from "../assets/product_placeholder.jpeg";

const PRODUCTS_PER_PAGE = 20

export default function AdminProductPanel() {
  const { t } = useTranslation()

  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    arName: "",
    enName: "",
    price: "",
    discount: "",
    arDescription: "",
    enDescription: "",
    image: "",
    arCategory: "",
    enCategory: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar"

  // الإضافات
  const [additions, setAdditions] = useState([])
  const [additionForm, setAdditionForm] = useState({ name: "", price: "" })
  const [editingAdditionId, setEditingAdditionId] = useState(null)

  // جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`)
        const allProducts = res.data.data || []
        setProducts(allProducts)
        const uniqueCategories = [...new Set(allProducts.map((p) => p.category[selectedLanguage] || p.category))]
        setCategories(["all", ...uniqueCategories])
        setSelectedCategory("all")
      } catch (err) {
        console.error("Error fetching products:", err)
        alert(t("fetch_products_error"))
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // جلب الإضافات
  useEffect(() => {
    const fetchAdditions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/additions`)
        setAdditions(res.data.additions)
      } catch (error) {
        console.error("Error fetching additions:", error)
      }
    }
    fetchAdditions()
  }, [])

  // دوال المنتجات
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/admin/updatefood/${editingId}`, {
          ...formData,
          price: Number(formData.price),
          discount: formData.discount ? Number(formData.discount) : 0,
        })
        setProducts(products.map((p) => (p._id === editingId ? res.data : p)))
        setEditingId(null)
      } else {
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/admin/postfood`, {
          ...formData,
          name: { ar: formData.arName, en: formData.enName },
          description: {
            ar: formData.arDescription,
            en: formData.enDescription,
          },
          price: Number(formData.price),
          discount: formData.discount ? Number(formData.discount) : 0,
        })
        setProducts([res.data, ...products])
      }

      setFormData({
        arName: "",
        enName: "",
        price: "",
        discount: "",
        arDescription: "",
        enDescription: "",
        image: "",
        category: "",
      })

      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`)
      const allProducts = res.data.data || []
      const uniqueCategories = [...new Set(allProducts.map((p) => p.category[selectedLanguage] || p.category))]
      setCategories(["all", ...uniqueCategories])
      toast.success(editingId ? t("product_updated") : t("product_added"))
    } catch (error) {
      console.error("خطأ في الإرسال:", error.response?.data || error.message)
      alert(t("submit_error"))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result
        setFormData({ ...formData, image: imageData })
      }
      reader.readAsDataURL(file)
    } else {
      alert(t("choose_image"))
    }
  }

  const handleEdit = (product) => {
    setFormData({
      arName: product.name.ar,
      enName: product.name.en,
      price: product.price.toString(),
      discount: product.discount?.toString() || "",
      arDescription: product.description.ar,
      enDescription: product.description.en,
      image: product.image,
      arCategory: product.category.ar,
      enCategory: product.category.en,
    })
    setEditingId(product._id)
  }

  const handleDelete = async (id) => {
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
                await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/deletefood/${id}`)
                setProducts(products.filter((p) => p._id !== id))
                toast.success(t("product_deleted"))
                toast.dismiss(toastInstance.id)
              } catch (error) {
                console.error("خطأ في الحذف:", error.response?.data || error.message)
                toast.error(t("delete_error"))
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    ))
  }

  // دوال الإضافات
  const handleAdditionSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAdditionId) {
        const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/additions/${editingAdditionId}`, additionForm)
        setAdditions(additions.map((a) => (a._id === editingAdditionId ? res.data : a)))
        setEditingAdditionId(null)
      } else {
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/additions`, additionForm)
        setAdditions([res.data, ...additions])
      }
      setAdditionForm({ name: "", price: "" })
      toast.success(editingAdditionId ? t("edit_addition") : t("Add Addition"))
    } catch (error) {
      console.error("Error submitting addition:", error)
      toast.error(t("submit_error"))
    }
  }

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
                await axios.delete(`${import.meta.env.VITE_BASE_URL}/additions/${id}`)
                setAdditions(additions.filter((a) => a._id !== id))
                toast.success(t("addition_deleted"))
                toast.dismiss(toastInstance.id)
              } catch (error) {
                console.error("خطأ في الحذف:", error)
                toast.error(t("delete_error"))
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    ))
  }

  const handleAdditionEdit = (addition) => {
    setAdditionForm({ name: addition.name, price: addition.price })
    setEditingAdditionId(addition._id)
  }

  // فلترة المنتجات
  const filteredProducts = products.filter((p) => {
    const name = p.name?.[selectedLanguage] || ""
    const categoryLang = typeof p.category === "object" ? p.category?.[selectedLanguage] || "" : p.category || ""

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryLang.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || categoryLang.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const displayedProducts = filteredProducts.slice(0, displayedCount)
  const hasMoreProducts = filteredProducts.length > displayedCount

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary rounded-lg sm:rounded-xl shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t("admin_panel")}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">{t("admin_panel_desc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto rounded-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">{editingId ? t("edit_product") : t("add_product")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {editingId ? t("edit_existing_product") : t("add_new_product")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="flex flex-col">
                    <Label htmlFor="arName" className="text-sm">
                      {t("arabic_name")}
                    </Label>
                    <Input
                      id="arName"
                      value={formData.arName}
                      onChange={handleInputChange}
                      required
                      className="mt-1.5"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="enName" className="text-sm">
                      {t("english_name")}
                    </Label>
                    <Input
                      id="enName"
                      value={formData.enName}
                      onChange={handleInputChange}
                      required
                      className="mt-1.5"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="price" className="text-sm">
                      {t("price_jod")}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="discount" className="text-sm">
                      {t("discount_percentage")}
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder={t("discount_example")}
                      min="0"
                      max="100"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="arCategory" className="text-sm">
                      {t("ar_category")}
                    </Label>
                    <Input
                      id="arCategory"
                      value={formData.arCategory}
                      onChange={handleInputChange}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="enCategory" className="text-sm">
                      {t("en_category")}
                    </Label>
                    <Input
                      id="enCategory"
                      value={formData.enCategory}
                      onChange={handleInputChange}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="image" className="text-sm">
                      {t("product_image")}
                    </Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mt-1.5" />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="arDescription" className="text-sm">
                      {t("arabic_description")}
                    </Label>
                    <Textarea
                      id="arDescription"
                      value={formData.arDescription}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="mt-1.5 border-2 border-input p-1 rounded-md"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="enDescription" className="text-sm">
                      {t("english_description")}
                    </Label>
                    <Textarea
                      id="enDescription"
                      value={formData.enDescription}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="mt-1.5 border-2 border-input p-1 rounded-md"
                      dir="ltr"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editingId ? t("save_changes") : t("add_product")}
                  </Button>

                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setFormData({
                          arName: "",
                          enName: "",
                          price: "",
                          discount: "",
                          arDescription: "",
                          enDescription: "",
                          image: "",
                          category: "",
                        })
                      }}
                      className="w-full"
                    >
                      {t("cancel_edit")}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* إدارة الإضافات */}
            <Card>
              <CardHeader>
                <CardTitle>{t("manage_additions")}</CardTitle>
                <CardDescription>{t("add_addition_desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* نموذج إضافة أو تعديل الإضافة */}
                <form onSubmit={handleAdditionSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Input
                    placeholder={t("addition_name")}
                    value={additionForm.name}
                    onChange={(e) => setAdditionForm({...additionForm, name: e.target.value})}
                    required
                  />
                  <Input
                    placeholder={t("addition_price")}
                    type="number"
                    value={additionForm.price}
                    onChange={(e) => setAdditionForm({...additionForm, price: e.target.value})}
                    required
                  />
                  <Button type="submit">{editingAdditionId ? t("save_changes") : t("add_addition")}</Button>
                </form>

                {/* قائمة الإضافات */}
                {additions.length === 0 ? (
                  <p className="text-muted-foreground text-center">{t("no_additions")}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {additions.map((addition) => (
                      <Card key={addition._id} className="p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold">{addition.name}</h3>
                          <p className="text-sm text-muted-foreground">{addition.price} {t("jod")}</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleAdditionEdit(addition)}>
                            {t("edit")}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleAdditionDelete(addition._id)}>
                            {t("delete")}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    placeholder={t("search_product")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 text-sm sm:text-base"
                  />
                </div>

                <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {categories.map((cat, i) => (
                    <Button
                      key={i}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      onClick={() => handleCategoryChange(cat)}
                      className="whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
                      size="sm"
                    >
                      {cat === "all" ? t("all") : cat}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <Loader2 className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg text-muted-foreground">{t("no_products")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <Card key={product._id} className="overflow-hidden">
                    <div className="relative h-40 sm:h-48 bg-muted">
                      <img
                        src={product.image || product_placeholder}
                        alt={product.name[selectedLanguage]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                        <Badge className="text-xs">{product.category[selectedLanguage] || product.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm sm:text-base line-clamp-1">
                          {product.name[selectedLanguage]}
                        </h3>
                        <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap">
                          {product.price} {t("jod")}
                        </span>
                      </div>
                      {product.discount > 0 && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">
                          {t("discount")}: {product.discount}%
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                        {product.description[selectedLanguage]}
                      </p>
                      {/* Action Buttons - تم إضافتها هنا */}
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Edit2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("edit")}
                        </Button>
                        <Button
                          onClick={() => handleDelete(product._id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Trash2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("delete")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {hasMoreProducts && (
              <div className="text-center mt-4 sm:mt-6">
                <Button variant="outline" onClick={() => setDisplayedCount((prev) => prev + PRODUCTS_PER_PAGE)}>
                  {t("show_more")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
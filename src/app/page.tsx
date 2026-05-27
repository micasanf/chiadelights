'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  MapPin,
  CreditCard,
  Camera,
  CheckCircle2,
  ChevronRight,
  Star,
  Leaf,
  Heart,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Minus,
  Plus,
  Upload,
  X,
  Loader2,
  Instagram,
  Facebook,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

// ─── Data ───────────────────────────────────────────────

const FLAVORS = [
  {
    id: 'vanilla',
    name: 'Classic Vanilla Bean',
    description: 'Smooth vanilla bean with fresh berries & coconut flakes',
    image: '/images/vanilla.png',
    bestseller: true,
  },
  {
    id: 'chocolate',
    name: 'Rich Chocolate',
    description: 'Dark cocoa layers with chocolate shavings & drizzle',
    image: '/images/chocolate.png',
    bestseller: true,
  },
  {
    id: 'mango',
    name: 'Tropical Mango',
    description: 'Golden mango puree with fresh mango cubes & mint',
    image: '/images/mango.png',
    bestseller: false,
  },
  {
    id: 'matcha',
    name: 'Zen Matcha',
    description: 'Premium matcha layers dusted with matcha powder & berries',
    image: '/images/matcha.png',
    bestseller: false,
  },
  {
    id: 'strawberry',
    name: 'Strawberry Bliss',
    description: 'Pink strawberry cream with fresh slices & edible flowers',
    image: '/images/strawberry.png',
    bestseller: false,
  },
  {
    id: 'coconut',
    name: 'Island Coconut',
    description: 'Creamy coconut with toasted flakes & honey drizzle',
    image: '/images/coconut.png',
    bestseller: false,
  },
]

const SIZES = [
  { id: 'regular', label: 'Regular (8oz)', price: 120 },
  { id: 'large', label: 'Large (12oz)', price: 160 },
]

const PAYMENT_METHODS = [
  {
    id: 'gcash',
    label: 'GCash',
    icon: '💚',
    details: 'Send payment to 0917-XXX-XXXX',
  },
  {
    id: 'maya',
    label: 'Maya',
    icon: '💜',
    details: 'Send payment to 0917-XXX-XXXX',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: '🏦',
    details: 'BPI Savings: 1234-5678-90',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: '💵',
    details: 'Pay when you receive your order',
  },
]

const STEPS = [
  { icon: ShoppingBag, title: 'Choose', desc: 'Pick your flavor & size' },
  { icon: CreditCard, title: 'Pay', desc: 'Upload proof or pay on delivery' },
  { icon: Truck, title: 'Receive', desc: 'We deliver or you pick up' },
  { icon: Heart, title: 'Enjoy', desc: 'Savor your chia pudding!' },
]

// ─── Component ──────────────────────────────────────────

export default function Home() {
  // Order form state
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [address, setAddress] = useState('')
  const [flavor, setFlavor] = useState('')
  const [size, setSize] = useState('regular')
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('gcash')
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [paymentProofName, setPaymentProofName] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const orderFormRef = useRef<HTMLDivElement>(null)

  // Calculate total
  const selectedSize = SIZES.find((s) => s.id === size)!
  const totalAmount = selectedSize.price * quantity

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, paymentProof: 'Please upload an image file' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, paymentProof: 'Image must be under 5MB' }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPaymentProof(reader.result as string)
      setPaymentProofName(file.name)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.paymentProof
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  // Scroll to order form
  const scrollToOrder = () => {
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Select flavor and scroll to order
  const selectFlavor = (flavorId: string) => {
    setFlavor(flavorId)
    setTimeout(() => scrollToOrder(), 100)
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!customerName.trim()) newErrors.customerName = 'Name is required'
    if (!phone.trim()) newErrors.phone = 'Phone number is required'
    if (deliveryMethod === 'delivery' && !address.trim())
      newErrors.address = 'Address is required for delivery'
    if (!flavor) newErrors.flavor = 'Please select a flavor'
    if (paymentMethod !== 'cod' && !paymentProof)
      newErrors.paymentProof = 'Payment screenshot is required for online payments'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Please enter a valid email'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit order
  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          email: email || null,
          phone,
          address: deliveryMethod === 'delivery' ? address : null,
          deliveryMethod,
          flavor,
          size,
          quantity,
          paymentMethod,
          paymentProof: paymentMethod !== 'cod' ? paymentProof : null,
          specialRequests: specialRequests || null,
          totalAmount,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to place order')
      }

      const data = await res.json()
      setOrderNumber(data.id)
      setShowSuccess(true)

      // Reset form
      setCustomerName('')
      setEmail('')
      setPhone('')
      setAddress('')
      setFlavor('')
      setSize('regular')
      setQuantity(1)
      setPaymentMethod('gcash')
      setPaymentProof(null)
      setPaymentProofName('')
      setSpecialRequests('')
      setErrors({})
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Something went wrong' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ChiaDelights</span>
          </div>
          <Button onClick={scrollToOrder} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            Order Now
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/hero.png"
              alt="Chia pudding collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                <Star className="w-3 h-3 mr-1" /> Freshly Made Daily
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Delicious Chia Pudding, <span className="text-emerald-400">Delivered to You</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                Handcrafted with premium chia seeds, real fruits, and love. Choose from 6 amazing
                flavors — order online and enjoy!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={scrollToOrder}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Order Now <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() =>
                    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  View Menu
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-16 md:py-20 bg-emerald-50/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">How It Works</h2>
              <p className="text-muted-foreground">Simple steps to get your chia pudding fix</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Menu / Flavors ─── */}
        <section id="menu" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-3">
                <Leaf className="w-3 h-3 mr-1" /> Our Menu
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Choose Your Flavor</h2>
              <p className="text-muted-foreground">
                Six handcrafted flavors made fresh daily with premium ingredients
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FLAVORS.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg group ${
                      flavor === item.id ? 'ring-2 ring-emerald-600 shadow-lg' : ''
                    }`}
                    onClick={() => selectFlavor(item.id)}
                  >
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {item.bestseller && (
                        <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-white border-0">
                          <Star className="w-3 h-3 mr-1" /> Bestseller
                        </Badge>
                      )}
                      {flavor === item.id && (
                        <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                          <div className="bg-emerald-600 text-white rounded-full p-2">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4 pb-2">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm">
                          <span className="font-bold text-emerald-600">₱120</span>
                          <span className="text-muted-foreground"> / ₱160</span>
                        </div>
                        <Button
                          size="sm"
                          variant={flavor === item.id ? 'default' : 'outline'}
                          className={
                            flavor === item.id
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                          }
                        >
                          {flavor === item.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Order Form ─── */}
        <section ref={orderFormRef} className="py-16 md:py-20 bg-emerald-50/50" id="order">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-3">
                <ShoppingBag className="w-3 h-3 mr-1" /> Place Your Order
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Order Your Chia Pudding</h2>
              <p className="text-muted-foreground">Fill in your details and we&apos;ll get it ready for you</p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-8">
                {/* ─── Customer Info ─── */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-bold">
                      1
                    </div>
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Juan Dela Cruz"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value)
                          if (errors.customerName) setErrors((p) => ({ ...p, customerName: '' }))
                        }}
                        className={errors.customerName ? 'border-red-500' : ''}
                      />
                      {errors.customerName && (
                        <p className="text-xs text-red-500">{errors.customerName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="0917-123-4567"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          if (errors.phone) setErrors((p) => ({ ...p, phone: '' }))
                        }}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                        }}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ─── Delivery Method ─── */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-bold">
                      2
                    </div>
                    Delivery Method
                  </h3>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(v) => {
                      setDeliveryMethod(v)
                      if (v === 'pickup') setErrors((p) => ({ ...p, address: '' }))
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <Label
                      htmlFor="delivery"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        deliveryMethod === 'delivery'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Truck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="font-medium">Deliver to me</div>
                        <div className="text-xs text-muted-foreground">
                          We&apos;ll bring it to your door
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="pickup"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        deliveryMethod === 'pickup'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <RadioGroupItem value="pickup" id="pickup" />
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="font-medium">I&apos;ll pick it up</div>
                        <div className="text-xs text-muted-foreground">Come and grab your order</div>
                      </div>
                    </Label>
                  </RadioGroup>

                  <AnimatePresence>
                    {deliveryMethod === 'delivery' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <Label htmlFor="address">
                          Delivery Address <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="address"
                          placeholder="Enter your complete delivery address..."
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value)
                            if (errors.address) setErrors((p) => ({ ...p, address: '' }))
                          }}
                          className={`mt-1.5 ${errors.address ? 'border-red-500' : ''}`}
                        />
                        {errors.address && (
                          <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator />

                {/* ─── Your Order ─── */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-bold">
                      3
                    </div>
                    Your Order
                  </h3>

                  {/* Flavor */}
                  <div className="space-y-2 mb-4">
                    <Label>
                      Flavor <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={flavor}
                      onValueChange={(v) => {
                        setFlavor(v)
                        if (errors.flavor) setErrors((p) => ({ ...p, flavor: '' }))
                      }}
                    >
                      <SelectTrigger className={`w-full ${errors.flavor ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Choose a flavor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {FLAVORS.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.flavor && <p className="text-xs text-red-500">{errors.flavor}</p>}
                  </div>

                  {/* Size */}
                  <div className="space-y-2 mb-4">
                    <Label>Size</Label>
                    <RadioGroup
                      value={size}
                      onValueChange={setSize}
                      className="grid grid-cols-2 gap-3"
                    >
                      {SIZES.map((s) => (
                        <Label
                          key={s.id}
                          htmlFor={`size-${s.id}`}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            size === s.id
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-border hover:border-emerald-300'
                          }`}
                        >
                          <RadioGroupItem value={s.id} id={`size-${s.id}`} />
                          <div>
                            <div className="font-medium">{s.label}</div>
                            <div className="text-sm font-bold text-emerald-600">₱{s.price}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(20, quantity + 1))}
                        disabled={quantity >= 20}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ─── Payment ─── */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-bold">
                      4
                    </div>
                    Payment Method
                  </h3>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => {
                      setPaymentMethod(v)
                      if (v === 'cod') setErrors((p) => ({ ...p, paymentProof: '' }))
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <Label
                        key={pm.id}
                        htmlFor={`pm-${pm.id}`}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === pm.id
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-border hover:border-emerald-300'
                        }`}
                      >
                        <RadioGroupItem value={pm.id} id={`pm-${pm.id}`} />
                        <span className="text-xl">{pm.icon}</span>
                        <div>
                          <div className="font-medium">{pm.label}</div>
                          <div className="text-xs text-muted-foreground">{pm.details}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  <AnimatePresence>
                    {paymentMethod !== 'cod' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <Label>
                          Upload Payment Screenshot <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          After sending payment via {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}, take a screenshot and upload it here.
                        </p>
                        <div
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                            errors.paymentProof
                              ? 'border-red-400 bg-red-50'
                              : paymentProof
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-border hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {paymentProof ? (
                            <div className="space-y-2">
                              <div className="relative inline-block">
                                <img
                                  src={paymentProof}
                                  alt="Payment proof preview"
                                  className="max-h-40 rounded-lg mx-auto"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPaymentProof(null)
                                    setPaymentProofName('')
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground">{paymentProofName}</p>
                              <p className="text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                Screenshot uploaded
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                              <p className="text-sm font-medium">Click to upload screenshot</p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        {errors.paymentProof && (
                          <p className="text-xs text-red-500">{errors.paymentProof}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator />

                {/* ─── Special Requests ─── */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-bold">
                      5
                    </div>
                    Special Requests
                  </h3>
                  <Textarea
                    placeholder="Any allergies, special instructions, or requests? Let us know..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <Separator />

                {/* ─── Order Summary ─── */}
                <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flavor</span>
                      <span className="font-medium">
                        {flavor ? FLAVORS.find((f) => f.id === flavor)?.name : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">{selectedSize.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium capitalize">{deliveryMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium">
                        {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-emerald-600 text-lg">₱{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* ─── Error / Submit ─── */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                    {errors.submit}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order — ₱{totalAmount}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Secure ordering
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Freshly made
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Made with love
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">What People Say</h2>
              <p className="text-muted-foreground">Loved by chia pudding fans everywhere</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Maria S.',
                  text: 'The Vanilla Bean is absolutely divine! Creamy, fresh, and the delivery was super quick.',
                  rating: 5,
                },
                {
                  name: 'James R.',
                  text: 'Best chia pudding I\'ve ever had. The Mango flavor is my go-to breakfast now!',
                  rating: 5,
                },
                {
                  name: 'Angela T.',
                  text: 'Love how easy it is to order online. The Matcha flavor is perfect — not too sweet!',
                  rating: 5,
                },
              ].map((review, i) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm mb-4 italic">&ldquo;{review.text}&rdquo;</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                          {review.name[0]}
                        </div>
                        <span className="font-medium text-sm">{review.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-emerald-900 text-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">ChiaDelights</span>
              </div>
              <p className="text-emerald-200 text-sm">
                Handcrafted chia pudding made fresh daily with premium, all-natural ingredients.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <div className="space-y-2 text-sm text-emerald-200">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> 0917-XXX-XXXX
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> hello@chiadelights.ph
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Mon–Sat, 8AM–6PM
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-200 hover:text-white hover:bg-emerald-800"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-200 hover:text-white hover:bg-emerald-800"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-200 hover:text-white hover:bg-emerald-800"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <Separator className="my-6 bg-emerald-700" />
          <p className="text-center text-xs text-emerald-300">
            © {new Date().getFullYear()} ChiaDelights. All rights reserved. Made with{' '}
            <Heart className="w-3 h-3 inline" /> in the Philippines
          </p>
        </div>
      </footer>

      {/* ─── Success Dialog ─── */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Order Placed!</DialogTitle>
            <DialogDescription className="text-center">
              Your chia pudding order has been received. We&apos;ll prepare it fresh for you!
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order #</span>
              <span className="font-mono font-bold">{orderNumber.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-emerald-600">₱{totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="capitalize">{deliveryMethod}</span>
            </div>
          </div>
          <Button
            onClick={() => setShowSuccess(false)}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

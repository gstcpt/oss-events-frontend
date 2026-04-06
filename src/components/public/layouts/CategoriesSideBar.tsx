'use client'
import { useState, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown, LayoutGrid, X, Building2, UtensilsCrossed, Shirt, Music, Sparkles, Camera, Car, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react'
import { IconRoad } from '@tabler/icons-react'
import Link from 'next/link'
import { getPublicCategories } from '@/lib/api/public/categories'
import { PublicCategory } from '@/types/public/categories'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  icon?: string
  subCategories?: SubCategory[]
  isOpen?: boolean
  isSelected?: boolean
}

interface SubCategory {
  id: string
  name: string
  isSelected?: boolean
}

interface CategoriesSideBarProps {
  onCategorySelect?: (categoryId: number) => void;
  onClearAll?: () => void;
  selectedCategories?: number[];
}

export default function CategoriesSideBar({
  onCategorySelect,
  onClearAll,
  selectedCategories = []
}: CategoriesSideBarProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('CategoriesSideBar')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [localSelectedCategories, setLocalSelectedCategories] = useState<Set<string>>(new Set())

  // Get selected chips for display
  const selectedChips = categories.flatMap(cat => {
    const chips: { id: string; name: string }[] = []
    if (cat.isSelected) { chips.push({ id: cat.id, name: cat.name }) }
    ; (cat.subCategories || []).forEach(sc => {
      if (sc.isSelected) { chips.push({ id: sc.id, name: sc.name }) }
    })
    return chips
  })

  // Map backend categories to frontend structure
  const mapCategories = (backendCategories: PublicCategory[]): Category[] => {
    // Convert selectedCategories to string set for comparison
    const selectedSet = new Set(selectedCategories.map(String))

    return backendCategories.map(cat => ({
      id: cat.id.toString(),
      name: cat.title,
      icon: getIconForCategory(cat.title),
      isSelected: selectedSet.has(cat.id.toString()) || localSelectedCategories.has(cat.id.toString()),
      subCategories: cat.children?.map(child => ({
        id: child.id.toString(),
        name: child.title,
        isSelected: selectedSet.has(child.id.toString()) || localSelectedCategories.has(child.id.toString())
      })) || [],
      isOpen: false
    }))
  }

  const getIconForCategory = (categoryName: string): string => {
    const name = categoryName.toLowerCase()
    if (name.includes('lieu') || name.includes('venue')) return 'building2'
    if (name.includes('catering') || name.includes('food')) return 'utensils-crossed'
    if (name.includes('clothing') || name.includes('vêtement')) return 'shirt'
    if (name.includes('music') || name.includes('musique')) return 'music'
    if (name.includes('beauty') || name.includes('beauté') || name.includes('makeup')) return 'sparkles'
    if (name.includes('photo') || name.includes('video')) return 'camera'
    if (name.includes('transport')) return 'car'
    return 'briefcase'
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Sync selectedCategories prop changes with local state
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const newSelected = new Set(selectedCategories.map(String))
      setLocalSelectedCategories(newSelected)

      // Update category selection state
      setCategories(prev => prev.map(cat => {
        const catSelected = newSelected.has(cat.id)
        const subUpdated = (cat.subCategories || []).map(sc => ({
          ...sc,
          isSelected: newSelected.has(sc.id)
        }))
        return { ...cat, isSelected: catSelected, subCategories: subUpdated }
      }))
    } else {
      // Clear selection if no categories are selected
      setLocalSelectedCategories(new Set())
      setCategories(prev => prev.map(cat => ({
        ...cat,
        isSelected: false,
        subCategories: (cat.subCategories || []).map(sc => ({ ...sc, isSelected: false }))
      })))
    }
  }, [selectedCategories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getPublicCategories()
      const mappedCategories = mapCategories(data)
      setCategories(mappedCategories)
    } catch (error) {
      toast.error(t('failedToLoad'))
      setCategories(getStaticCategories())
    } finally { setLoading(false) }
  }

  const getStaticCategories = (): Category[] => [
    {
      id: 'lieux',
      name: 'Lieux',
      icon: 'building2',
      isSelected: false
    },
    {
      id: 'catering',
      name: 'Catering',
      icon: 'utensils-crossed',
      isSelected: false,
      subCategories: [
        { id: 'traiteur', name: 'Traiteur', isSelected: false },
        { id: 'cakes', name: 'Gâteaux', isSelected: false },
        { id: 'sweets', name: 'Sweets & Desserts', isSelected: false },
        { id: 'boissons', name: 'Boissons', isSelected: false },
        { id: 'kiosks', name: 'Kiosks', isSelected: false },
        { id: 'distribution', name: 'Cadeaux pour invités', isSelected: false }
      ]
    },
    {
      id: 'vetements',
      name: 'Vêtements & Accessoires',
      icon: 'shirt',
      isSelected: false,
      subCategories: [
        { id: 'for-her', name: 'For Her', isSelected: false },
        { id: 'for-him', name: 'For Him', isSelected: false },
        { id: 'for-kids', name: 'For Kids', isSelected: false },
        { id: 'accessoires', name: 'Accessoires', isSelected: false }
      ]
    },
    {
      id: 'musique',
      name: 'Musique & Animation',
      icon: 'music',
      isSelected: false
    },
    {
      id: 'beaute',
      name: 'Coiffure & Maquillage',
      icon: 'sparkles',
      isSelected: false,
      subCategories: [
        { id: 'her', name: 'For Her', isSelected: false },
        { id: 'him', name: 'For Him', isSelected: false },
        { id: 'spa', name: 'Spa & Hammam', isSelected: false }
      ]
    },
    {
      id: 'photo-video',
      name: 'Photographie & Vidéo',
      icon: 'camera',
      isSelected: false
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: 'car',
      isSelected: false,
      subCategories: [
        { id: 'luxe', name: 'Véhicule', isSelected: false },
        { id: 'traditionnel', name: 'Transport Traditionnel', isSelected: false }
      ]
    },
    {
      id: 'decoration',
      name: 'Décoration & Location',
      icon: 'sparkle',
      isSelected: false,
      subCategories: [
        { id: 'decoration-evenementielle', name: 'Décoration événementielle', isSelected: false },
        { id: 'florale', name: 'Décoration Florale / Fleuriste', isSelected: false },
        { id: 'equipement-materiels', name: 'Équipement & Matériels', isSelected: false }
      ]
    },
    {
      id: 'services',
      name: 'Services Complémentaires',
      icon: 'briefcase',
      isSelected: false
    }
  ]

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, isOpen: !category.isOpen }
          : category
      )
    )
  }

  const handleCategorySelect = (categoryId: string) => {
    const categoryIdNum = parseInt(categoryId);

    // If callback is provided, use it (for items page)
    if (onCategorySelect) {
      onCategorySelect(categoryIdNum);
      return;
    }

    // Otherwise use local state (for category detail page)
    const newSelected = new Set(localSelectedCategories)

    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }

    setLocalSelectedCategories(newSelected)

    // Update category selection state
    setCategories(prev => prev.map(cat => {
      const catSelected = newSelected.has(cat.id)
      const subUpdated = (cat.subCategories || []).map(sc => ({
        ...sc,
        isSelected: newSelected.has(sc.id)
      }))
      return { ...cat, isSelected: catSelected, subCategories: subUpdated }
    }))

    // Update URL for category detail page
    updateUrl(newSelected)
  }

  const updateUrl = (cats: Set<string>) => {
    const params = new URLSearchParams(searchParams.toString())

    if (cats.size > 0) {
      params.set('category', Array.from(cats).join(','))
    } else {
      params.delete('category')
    }

    // Only update URL if there are changes
    const currentCategory = searchParams.get('category') || ''
    const newCategory = params.get('category') || ''

    if (currentCategory !== newCategory) {
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    }
  }

  const removeCategoryChip = (categoryId: string) => {
    const newSelected = new Set(localSelectedCategories)
    newSelected.delete(categoryId)
    setLocalSelectedCategories(newSelected)

    // Update category selection state
    setCategories(prev => prev.map(cat => {
      const catSelected = newSelected.has(cat.id)
      const subUpdated = (cat.subCategories || []).map(sc => ({
        ...sc,
        isSelected: newSelected.has(sc.id)
      }))
      return { ...cat, isSelected: catSelected, subCategories: subUpdated }
    }))

    // Update URL
    updateUrl(newSelected)
  }

  const getIconComponent = (iconName: string) => {
    const iconProps = {
      className: "h-5 w-5 transition-colors",
      strokeWidth: 2
    }

    switch (iconName) {
      case 'building2': return <Building2 {...iconProps} />
      case 'utensils-crossed': return <UtensilsCrossed {...iconProps} />
      case 'shirt': return <Shirt {...iconProps} />
      case 'music': return <Music {...iconProps} />
      case 'sparkles': return <Sparkles {...iconProps} />
      case 'camera': return <Camera {...iconProps} />
      case 'car': return <Car {...iconProps} />
      case 'briefcase': return <Briefcase {...iconProps} />
      default: return <LayoutGrid {...iconProps} />
    }
  }

  if (loading) {
    return (
      <aside className="w-70 bg-white border-r border-slate-200 transition-transform duration-300 ease-out shadow-lg z-10 lg:sticky lg:top-16 fixed left-0 top-16 -translate-x-full lg:translate-x-0">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t('title')}</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-70 bg-white border-r border-slate-200 transition-transform duration-300 ease-out shadow-lg z-10 lg:sticky lg:top-16 fixed left-0 top-16 -translate-x-full lg:translate-x-0 rounded-lg">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{t('title')}</h2>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-200">
        <button
          onClick={() => {
            // Reset sidebar visual state
            setLocalSelectedCategories(new Set())
            setCategories(prev => prev.map(cat => ({ ...cat, isSelected: false, subCategories: (cat.subCategories || []).map(sc => ({ ...sc, isSelected: false })) })))
            if (onClearAll) {
              // Items page: clear parent state directly — no navigation needed
              onClearAll()
            } else {
              // URL mode (category detail page): strip category param and navigate
              const params = new URLSearchParams(searchParams.toString())
              params.delete('category')
              router.push(`/items${params.toString() ? `?${params.toString()}` : ''}`)
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200 group"
        >
          <span>{t('viewAllServices')}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto" aria-label={t('categoryList')}>
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <div className={`group relative flex items-center rounded-xl transition-all duration-200 ${category.isSelected
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(170,169,153,0.6)]'
                : 'hover:bg-primary/5'
                }`}>
                {category.isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}

                <div
                  className={`flex items-center gap-3 px-4 py-3 flex-1 transition-transform duration-200 cursor-pointer ${category.isSelected ? '' : 'group-hover:translate-x-1'
                    }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${category.isSelected ? 'bg-white/20' : 'bg-primary/10 group-hover:bg-primary/20'}`}>
                    {getIconComponent(category.icon || 'layout-grid')}
                  </div>
                  <span className={`text-sm font-medium ${category.isSelected ? 'text-white' : 'text-slate-900 group-hover:text-primary'
                    }`}>
                    {category.name}
                  </span>
                </div>

                {(category.subCategories && category.subCategories.length > 0) && (
                  <button
                    className={`p-3 mr-2 rounded-lg transition-all duration-200 ${category.isSelected
                      ? 'hover:bg-white/10 text-white'
                      : 'hover:bg-primary/10 text-slate-500 hover:text-primary'
                      }`}
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={category.isOpen}
                    aria-label={t('expand')}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${category.isOpen ? 'rotate-180' : ''
                      }`} />
                  </button>
                )}
              </div>

              {(category.subCategories && category.subCategories.length > 0) && (
                <div className={`overflow-hidden transition-all duration-300 ease-out ${category.isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  <ul className="ml-6 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-4 py-2">
                    {category.subCategories.map((subCategory) => (
                      <li key={subCategory.id}>
                        <div
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 font-['Poppins',sans-serif] cursor-pointer ${subCategory.isSelected
                            ? 'bg-primary text-white shadow-[0_0_10px_rgba(170,169,153,0.5)]'
                            : 'text-slate-500 hover:bg-primary/5 hover:text-primary hover:translate-x-1'
                            }`}
                          onClick={() => handleCategorySelect(subCategory.id)}
                        >
                          {subCategory.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-200">
        <Link
          href="/categories"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 transition-all duration-200 group font-['Poppins',sans-serif]"
        >
          <span>{t('categoryList')}</span>
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </aside>
  )
}

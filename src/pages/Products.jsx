import React, { useEffect, useState } from 'react';
import { catalogueService } from '../services/catalogueService';
import { 
  Package, Search, Plus, Edit3, Trash2, Layers, 
  CheckCircle2, Tag, ArrowLeft, Image as ImageIcon, Check,
  AlertCircle, Sparkles, FileText, ShieldAlert
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Dedicated Full-Page Views: 'list' | 'product_detail' | 'product_form' | 'variant_form'
  const [currentView, setCurrentView] = useState('list');
  const [activeProduct, setActiveProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Product Form State (Full Page)
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    product_type: '',
    description: '',
    highlights: '',
    how_to_use: '',
    package_contents: '',
    safety_warnings: '',
    hsn_code: '',
    tax_rate: '0.00',
    has_variants: true,
    is_active: true,
    mrp: '',
    selling_price: '',
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Variant Form State (Full Page)
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    sku: '',
    mrp: '',
    selling_price: '',
    is_default: false,
    is_active: true,
    attribute_values: [],
  });
  const [variantImageFile, setVariantImageFile] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState('');
  const [savingVariant, setSavingVariant] = useState(false);

  // Image Uploading State in Detail
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchMasterData = async () => {
    try {
      const [choicesRes, attrRes] = await Promise.all([
        catalogueService.getChoices(),
        catalogueService.getAttributes(),
      ]);
      if (choicesRes.data) {
        setCategories(choicesRes.data.categories || []);
        setProductTypes(choicesRes.data.product_types || []);
      }
      if (attrRes.data) {
        setAttributesList(attrRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching choices:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await catalogueService.getAdminProducts({
        search,
        category: categoryFilter,
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --- Inspect Product Detail Page ---
  const handleInspectProduct = async (productUid) => {
    setDetailLoading(true);
    setCurrentView('product_detail');
    try {
      const res = await catalogueService.getProductDetail(productUid);
      setActiveProduct(res.data);
    } catch (err) {
      showToast('Failed to load product details', true);
      setCurrentView('list');
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadActiveProduct = async () => {
    if (!activeProduct) return;
    try {
      const res = await catalogueService.getProductDetail(activeProduct.uid);
      setActiveProduct(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Image Helpers ---
  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVariantImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVariantImageFile(file);
      setVariantImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadGalleryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeProduct) return;
    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('image', file);
      await catalogueService.uploadProductImage(activeProduct.uid, fd);
      showToast('Image uploaded successfully!');
      reloadActiveProduct();
      fetchProducts();
    } catch (err) {
      showToast('Failed to upload image', true);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageUid) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await catalogueService.deleteProductImage(imageUid);
      showToast('Image removed successfully');
      reloadActiveProduct();
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete image', true);
    }
  };

  // --- Navigate to Dedicated Product Create Page ---
  const goToCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories.length ? categories[0].key : 'period_care',
      product_type: '',
      description: '',
      highlights: '',
      how_to_use: '',
      package_contents: '',
      safety_warnings: '',
      hsn_code: '',
      tax_rate: '0.00',
      has_variants: true,
      is_active: true,
      mrp: '',
      selling_price: '',
    });
    setProductImageFile(null);
    setProductImagePreview('');
    setCurrentView('product_form');
  };

  // --- Navigate to Dedicated Product Edit Page ---
  const goToEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      product_type: prod.product_type || '',
      description: prod.description || '',
      highlights: Array.isArray(prod.highlights) ? prod.highlights.join('\n') : (prod.highlights || ''),
      how_to_use: prod.how_to_use || '',
      package_contents: prod.package_contents || '',
      safety_warnings: prod.safety_warnings || '',
      hsn_code: prod.hsn_code || '',
      tax_rate: prod.tax_rate || '0.00',
      has_variants: prod.has_variants !== undefined ? prod.has_variants : true,
      is_active: prod.is_active !== undefined ? prod.is_active : true,
      mrp: prod.mrp || '',
      selling_price: prod.selling_price || '',
    });
    setProductImageFile(null);
    setProductImagePreview(prod.primary_image_url || prod.images?.[0]?.url || '');
    setCurrentView('product_form');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.category) {
      alert('Product name and category are required.');
      return;
    }

    try {
      setSavingProduct(true);
      if (editingProduct) {
        await catalogueService.updateProduct(editingProduct.uid, productForm);
        if (productImageFile) {
          const fd = new FormData();
          fd.append('image', productImageFile);
          fd.append('is_primary', 'true');
          await catalogueService.uploadProductImage(editingProduct.uid, fd);
        }
        showToast('Product updated successfully!');
        await fetchProducts();
        await handleInspectProduct(editingProduct.uid);
      } else {
        const res = await catalogueService.createProduct(productForm);
        const newProdUid = res.data?.uid;

        if (newProdUid && productImageFile) {
          const fd = new FormData();
          fd.append('image', productImageFile);
          fd.append('is_primary', 'true');
          await catalogueService.uploadProductImage(newProdUid, fd);
        }

        showToast('Product created successfully with base configuration!');
        await fetchProducts();
        if (newProdUid) {
          await handleInspectProduct(newProdUid);
        } else {
          setCurrentView('list');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.errors || 'Failed to save product', true);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (prodUid) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await catalogueService.deleteProduct(prodUid);
      showToast('Product deleted successfully');
      setCurrentView('list');
      setActiveProduct(null);
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', true);
    }
  };

  // --- Navigate to Dedicated Variant Create Page ---
  const goToCreateVariant = () => {
    setEditingVariant(null);
    setVariantForm({
      sku: '',
      mrp: '',
      selling_price: '',
      is_default: false,
      is_active: true,
      attribute_values: [],
    });
    setVariantImageFile(null);
    setVariantImagePreview('');
    setCurrentView('variant_form');
  };

  // --- Navigate to Dedicated Variant Edit Page ---
  const goToEditVariant = (v) => {
    setEditingVariant(v);
    setVariantForm({
      sku: v.sku || '',
      mrp: v.mrp || '',
      selling_price: v.selling_price || '',
      is_default: Boolean(v.is_default),
      is_active: v.is_active !== undefined ? v.is_active : true,
      attribute_values: v.attributes?.map((a) => a.value_uid).filter(Boolean) || [],
    });
    setVariantImageFile(null);
    setVariantImagePreview(v.image_url || '');
    setCurrentView('variant_form');
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.mrp || !variantForm.selling_price) {
      alert('MRP and Selling Price are required.');
      return;
    }

    try {
      setSavingVariant(true);
      let savedVarUid = null;
      if (editingVariant) {
        await catalogueService.updateVariant(editingVariant.uid, variantForm);
        savedVarUid = editingVariant.uid;
        showToast('Variant updated successfully!');
      } else {
        const res = await catalogueService.createVariant(activeProduct.uid, variantForm);
        savedVarUid = res.data?.uid;
        showToast('Variant created successfully!');
      }

      if (savedVarUid && variantImageFile && activeProduct) {
        const fd = new FormData();
        fd.append('image', variantImageFile);
        fd.append('variant_uid', savedVarUid);
        fd.append('is_primary', 'true');
        await catalogueService.uploadProductImage(activeProduct.uid, fd);
      }

      await reloadActiveProduct();
      fetchProducts();
      setCurrentView('product_detail');
    } catch (err) {
      showToast(err.response?.data?.errors || 'Failed to save variant', true);
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantUid) => {
    if (!window.confirm('Are you sure you want to remove this variant?')) return;
    try {
      await catalogueService.deleteVariant(variantUid);
      showToast('Variant removed successfully');
      reloadActiveProduct();
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete variant', true);
    }
  };

  const toggleAttributeSelect = (attrUid, valUid) => {
    setVariantForm((prev) => {
      const attrGroup = attributesList.find((a) => a.uid === attrUid);
      const groupValUids = attrGroup ? attrGroup.values.map((v) => v.uid) : [];
      const withoutGroup = prev.attribute_values.filter((id) => !groupValUids.includes(id));
      const isAlreadySelected = prev.attribute_values.includes(valUid);
      return {
        ...prev,
        attribute_values: isAlreadySelected ? withoutGroup : [...withoutGroup, valUid],
      };
    });
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl text-sm font-semibold border ${
            toastMsg.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. PRODUCT LIST VIEW */}
      {/* ============================================================== */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Catalogue & Products
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Add new products, manage variants, pricing, attributes, and inventory status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="Search by name, SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <select
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setTimeout(() => fetchProducts(), 50);
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Filter
                </button>
              </form>

              <button
                onClick={goToCreateProduct}
                className="inline-flex items-center gap-2 bg-[#9d71c7] hover:bg-[#8a5bb8] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus size={16} />
                <span>New Product</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Product Details</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Product Type</th>
                    <th className="py-3.5 px-5">Variants</th>
                    <th className="py-3.5 px-5">Price Range</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                        Loading catalogue products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                        No products found. Click "New Product" to add your first product.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const variants = p.variants || [];
                      const prices = variants.map((v) => parseFloat(v.selling_price || 0)).filter((pr) => pr > 0);
                      const minP = prices.length ? Math.min(...prices) : null;
                      const maxP = prices.length ? Math.max(...prices) : null;
                      const priceDisplay = minP !== null ? (minP === maxP ? `₹${minP}` : `₹${minP} - ₹${maxP}`) : '—';

                      return (
                        <tr key={p.uid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {p.primary_image_url ? (
                                <img
                                  src={p.primary_image_url}
                                  alt={p.name}
                                  className="w-11 h-11 rounded-lg object-cover border border-slate-100"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50">
                                  <Package size={20} />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                                <div className="text-[11px] text-slate-400">HSN: {p.hsn_code || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {p.category_display || p.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 font-medium">
                            {p.product_type_display || '—'}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                              {variants.length} variant(s)
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            {priceDisplay}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleInspectProduct(p.uid)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#9d71c7] bg-[#f6effc] hover:bg-[#ede0f7] transition-colors cursor-pointer"
                                title="Manage Variants & Details"
                              >
                                <Layers size={13} />
                                <span>Details / Variants</span>
                              </button>
                              <button
                                onClick={() => goToEditProduct(p)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                title="Edit product"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.uid)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DEDICATED FULL-PAGE PRODUCT CREATE / EDIT PAGE */}
      {/* ============================================================== */}
      {currentView === 'product_form' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (activeProduct) {
                  setCurrentView('product_detail');
                } else {
                  setCurrentView('list');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>{activeProduct ? 'Back to Product Details' : 'Back to Products List'}</span>
            </button>

            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-[#9d71c7] rounded-full border border-purple-100">
              {editingProduct ? 'Editing Existing Product' : 'Creating New Product'}
            </span>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-6">
            {/* Top Banner & Title */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#f6effc] flex items-center justify-center text-[#9d71c7]">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in complete e-commerce specifications, categories, and customer-facing instructions
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. Core Identifiers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100"
                      placeholder="e.g. CLASSIE Soothing Sanitary Pads"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                      Category *
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                      Product Type
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100"
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                    >
                      <option value="">-- Choose Type --</option>
                      {productTypes.map((pt) => (
                        <option key={pt.key} value={pt.key}>{pt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                      HSN Code (GST Invoice)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="e.g. 96190010"
                      value={productForm.hsn_code}
                      onChange={(e) => setProductForm({ ...productForm, hsn_code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                      GST Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="0.00"
                      value={productForm.tax_rate}
                      onChange={(e) => setProductForm({ ...productForm, tax_rate: e.target.value })}
                    />
                  </div>
                </div>

                {/* 2. Product Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-[#9d71c7]" />
                    <span>General Description</span>
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100 leading-relaxed font-sans"
                    placeholder="Comprehensive overview of product, benefits, and branding..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Rich Specification Cards (Highlights, Kit Contents, Instructions, Warnings) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#9d71c7]" />
                  <span>Rich Customer Specifications</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  These appear directly on the Customer Product Detail Page in separate highlighted sections
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Product Highlights (One bullet per line)</span>
                  </label>
                  <textarea
                    rows="6"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100 leading-relaxed"
                    placeholder="Antibacterial Strip: Designed with antibacterial hygiene features&#10;High Absorbency: Helps manage menstrual flow with confidence&#10;Comfortable Coverage: Extra length for day and night protection"
                    value={productForm.highlights}
                    onChange={(e) => setProductForm({ ...productForm, highlights: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Each line renders as an item with a green checkmark.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <Package size={14} className="text-indigo-600" />
                    <span>What's Inside / Kit Breakdown</span>
                  </label>
                  <textarea
                    rows="6"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100 leading-relaxed"
                    placeholder="• CLASSIE Soothing Sanitary Pads XL – 2 Nos&#10;• CLASSIE Soothing Sanitary Pads XXL – 2 Nos&#10;• Pocket Hand Sanitizer – 30 ml&#10;• Disposable Paper Toilet Seat Covers – 4 Nos"
                    value={productForm.package_contents}
                    onChange={(e) => setProductForm({ ...productForm, package_contents: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Essential for kits like Bloom or itemized box contents.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-600" />
                    <span>How to Use / Directions</span>
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100 leading-relaxed"
                    placeholder="Step-by-step instructions for use, washing, application, or dilution..."
                    value={productForm.how_to_use}
                    onChange={(e) => setProductForm({ ...productForm, how_to_use: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-600" />
                    <span>Safety Precautions & Warnings</span>
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7] focus:ring-2 focus:ring-purple-100 leading-relaxed"
                    placeholder="Warnings, external use only, patch test cautions, fabric care notices..."
                    value={productForm.safety_warnings}
                    onChange={(e) => setProductForm({ ...productForm, safety_warnings: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Architecture & Media */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase">
                  Variant Architecture Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, has_variants: true })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      productForm.has_variants
                        ? 'border-[#9d71c7] bg-[#f6effc] text-[#6f4798] ring-2 ring-purple-100 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Layers size={14} className="text-[#9d71c7]" />
                      <span>Multi-Variant Product (Recommended)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-1 leading-normal">
                      Allows connecting multiple sizes, pack counts, or volumes (e.g. XL, XXL, 200ml) with individual pricing and SKUs.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, has_variants: false })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      !productForm.has_variants
                        ? 'border-[#9d71c7] bg-[#f6effc] text-[#6f4798] ring-2 ring-purple-100 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Tag size={14} className="text-slate-500" />
                      <span>Single Product (Fixed Pricing)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-1 leading-normal">
                      Direct single fixed price. Extra size/pack variants cannot be added.
                    </div>
                  </button>
                </div>

                {!productForm.has_variants && (
                  <div className="pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                        placeholder="e.g. 199.00"
                        value={productForm.selling_price}
                        onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                        required={!productForm.has_variants}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        MRP (Printed) (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                        placeholder="e.g. 249.00"
                        value={productForm.mrp}
                        onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                        required={!productForm.has_variants}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                  Product Primary Cover Photo
                </label>
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {productImagePreview ? (
                    <img
                      src={productImagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-contain border border-slate-200 bg-white p-1"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                      <ImageIcon size={28} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f6effc] file:text-[#9d71c7] hover:file:bg-[#ecdcf8] cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 mt-1.5 block">JPG, PNG, or WEBP (Up to 5MB)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="product_is_active_page"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#9d71c7] rounded cursor-pointer"
                />
                <label htmlFor="product_is_active_page" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Publish Product in Store Catalogue (Active)
                </label>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  if (activeProduct) setCurrentView('product_detail');
                  else setCurrentView('list');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel & Discard
              </button>

              <button
                type="submit"
                disabled={savingProduct}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#9d71c7] hover:bg-[#8a5bb8] transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check size={16} />
                <span>{savingProduct ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DEDICATED FULL-PAGE VARIANT CREATE / EDIT PAGE */}
      {/* ============================================================== */}
      {currentView === 'variant_form' && activeProduct && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView('product_detail')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>Back to {activeProduct.name}</span>
            </button>

            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-[#9d71c7] rounded-full border border-purple-100">
              {editingVariant ? `Edit Variant: ${editingVariant.sku || 'SKU'}` : 'New Variant Addition'}
            </span>
          </div>

          <form onSubmit={handleSaveVariant} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVariant ? 'Edit Variant Specifications' : `Add New Variant for ${activeProduct.name}`}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure SKU, pricing (MRP vs Selling Price), and select corresponding master attributes (Size, Pack, Volume)
                </p>
              </div>

              {/* SKU & Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="e.g. CLS-PAD-XXL-15"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Optional unique warehouse code</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                    MRP (Maximum Retail Price) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="e.g. 299.00"
                    value={variantForm.mrp}
                    onChange={(e) => setVariantForm({ ...variantForm, mrp: e.target.value })}
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Printed MRP on packaging</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="e.g. 249.00"
                    value={variantForm.selling_price}
                    onChange={(e) => setVariantForm({ ...variantForm, selling_price: e.target.value })}
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Actual amount charged to customer</span>
                </div>
              </div>

              {/* Master Attributes Selection Cards */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase">
                      Select Variant Attributes
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click the buttons below to assign Size, Pack Count, or Volume to this variant
                    </p>
                  </div>
                  {variantForm.attribute_values.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setVariantForm({ ...variantForm, attribute_values: [] })}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset / Clear Selection
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {attributesList.map((attr) => (
                    <div key={attr.uid} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                        <span>{attr.name}</span>
                        <span className="text-[10px] text-slate-400 lowercase">{attr.values?.length || 0} options</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {attr.values?.map((val) => {
                          const isSelected = variantForm.attribute_values.includes(val.uid);
                          return (
                            <button
                              type="button"
                              key={val.uid}
                              onClick={() => toggleAttributeSelect(attr.uid, val.uid)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#9d71c7] bg-[#9d71c7] text-white shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {val.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant-specific Packaging Image */}
              <div className="border-t border-slate-100 pt-6">
                <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                  Variant Packaging / Specific Photo (Optional)
                </label>
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {variantImagePreview ? (
                    <img
                      src={variantImagePreview}
                      alt="Variant Preview"
                      className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-white p-1"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVariantImageChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f6effc] file:text-[#9d71c7] hover:file:bg-[#ecdcf8] cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      When selected on the customer PDP, this image replaces the primary product photo
                    </span>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="page_variant_is_default"
                    checked={variantForm.is_default}
                    onChange={(e) => setVariantForm({ ...variantForm, is_default: e.target.checked })}
                    className="w-4 h-4 accent-[#9d71c7] rounded cursor-pointer"
                  />
                  <label htmlFor="page_variant_is_default" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Set as Default Variant (Pre-selected on PDP)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="page_variant_is_active"
                    checked={variantForm.is_active}
                    onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                    className="w-4 h-4 accent-[#9d71c7] rounded cursor-pointer"
                  />
                  <label htmlFor="page_variant_is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Variant Active (Available for sale)
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setCurrentView('product_detail')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel & Return
              </button>

              <button
                type="submit"
                disabled={savingVariant}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#9d71c7] hover:bg-[#8a5bb8] transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check size={16} />
                <span>{savingVariant ? 'Saving...' : (editingVariant ? 'Update Variant' : 'Create Variant')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. PRODUCT DETAIL & VARIANT MANAGEMENT VIEW */}
      {/* ============================================================== */}
      {currentView === 'product_detail' && activeProduct && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentView('list');
                setActiveProduct(null);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>Back to Products List</span>
            </button>

            <button
              onClick={() => goToEditProduct(activeProduct)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 size={15} className="text-[#9d71c7]" />
              <span>Edit Full Product Specs</span>
            </button>
          </div>

          {/* Product Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex gap-5">
              {activeProduct.images?.length > 0 ? (
                <img
                  src={activeProduct.images[0].url}
                  alt={activeProduct.name}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 bg-slate-50 p-1 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                  <Package size={36} />
                </div>
              )}
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeProduct.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {activeProduct.category_display || activeProduct.category}
                  </span>
                  {activeProduct.product_type_display && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {activeProduct.product_type_display}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeProduct.has_variants
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {activeProduct.has_variants ? 'Multi-Variant' : 'Single Product'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeProduct.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {activeProduct.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 max-w-2xl whitespace-pre-line leading-relaxed">
                  {activeProduct.description || 'No description provided.'}
                </p>

                {/* Rich Details Grid in Admin Inspection */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                  {activeProduct.highlights && activeProduct.highlights.length > 0 && (
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-[#9d71c7]" />
                        <span>Highlights ({activeProduct.highlights.length})</span>
                      </div>
                      <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                        {activeProduct.highlights.map((hl, idx) => (
                          <li key={idx} className="line-clamp-2">{hl}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeProduct.package_contents && (
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Package size={12} className="text-[#9d71c7]" />
                        <span>What's Inside / Kit Breakdown</span>
                      </div>
                      <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                        {activeProduct.package_contents}
                      </p>
                    </div>
                  )}

                  {activeProduct.how_to_use && (
                    <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers size={12} className="text-amber-600" />
                        <span>How To Use</span>
                      </div>
                      <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                        {activeProduct.how_to_use}
                      </p>
                    </div>
                  )}

                  {activeProduct.safety_warnings && (
                    <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-200/60">
                      <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Tag size={12} className="text-rose-600" />
                        <span>Safety / Warnings</span>
                      </div>
                      <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                        {activeProduct.safety_warnings}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              <button
                onClick={() => goToEditProduct(activeProduct)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 size={15} />
                <span>Edit Full Specs</span>
              </button>
              <button
                onClick={() => handleDeleteProduct(activeProduct.uid)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Variants Management Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">Product Variants</h4>
                  {!activeProduct.has_variants && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Single Product (No Variants)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeProduct.has_variants
                    ? 'Manage individual sizes, packs, pricing (MRP vs Selling Price), and default SKU selection'
                    : 'This is a standalone single product. You can update its price and details, but extra variants cannot be added.'}
                </p>
              </div>

              {activeProduct.has_variants ? (
                <button
                  onClick={goToCreateVariant}
                  className="inline-flex items-center gap-2 bg-[#9d71c7] hover:bg-[#8a5bb8] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add Variant</span>
                </button>
              ) : (
                <div className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Fixed Item (1 Base SKU)
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Variant / SKU</th>
                      <th className="py-3 px-4">Attributes</th>
                      <th className="py-3 px-4">MRP</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Default</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProduct.variants?.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-10 text-slate-400 font-medium">
                          No variants created yet. Click "Add Variant" to create sizes or pack options.
                        </td>
                      </tr>
                    ) : (
                      activeProduct.variants?.map((v) => (
                        <tr key={v.uid} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{v.sku || 'No SKU'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">UID: {v.uid.slice(0, 8)}...</div>
                          </td>
                          <td className="py-3 px-4">
                            {v.attributes?.length > 0 ? (
                              <div className="flex gap-1.5 flex-wrap">
                                {v.attributes.map((att, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {att.attribute}: {att.value}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">None (Single)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 line-through">
                            ₹{v.mrp}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{v.selling_price}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {v.discount_percentage ? `${v.discount_percentage}% OFF` : '0%'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {v.is_default ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f6effc] text-[#9d71c7]">
                                Default
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">No</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                v.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                              }`}
                            >
                              {v.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => goToEditVariant(v)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                title="Edit variant pricing or attributes"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteVariant(v.uid)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete variant"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Product Media & Image Gallery Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Product Media & Gallery</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload additional image angles, packaging photos, or promotional graphics
                </p>
              </div>

              <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer">
                <Plus size={15} />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGalleryImage}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {(!activeProduct.images || activeProduct.images.length === 0) ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No images uploaded for this product yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Upload Image" above to add product photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {activeProduct.images.map((img) => (
                  <div key={img.uid} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <img src={img.url} alt="Product Media" className="w-full h-full object-contain p-2" />
                    {img.is_primary && (
                      <span className="absolute top-1.5 left-1.5 bg-[#9d71c7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.uid)}
                      className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

import React, { useEffect, useState } from 'react';
import { catalogueService } from '../services/catalogueService';
import { 
  Package, Search, Plus, Edit3, Trash2, Eye, Layers, 
  CheckCircle2, XCircle, Tag, ArrowLeft, Image as ImageIcon, DollarSign
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

  // Active view: 'list' | 'detail'
  const [currentView, setCurrentView] = useState('list');
  const [activeProduct, setActiveProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modals & Forms
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    product_type: '',
    description: '',
    hsn_code: '',
    tax_rate: '0.00',
    is_active: true,
    mrp: '',
    selling_price: '',
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');

  const [variantModalOpen, setVariantModalOpen] = useState(false);
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

  // Open Full Product Detail / Variant Manager View
  const handleInspectProduct = async (productUid) => {
    setDetailLoading(true);
    setCurrentView('detail');
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

  // Refresh active product in detail view
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

  // --- Product CRUD Handlers ---
  const openCreateProductModal = () => {
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
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
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
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.category) {
      alert('Product name and category are required.');
      return;
    }

    try {
      if (editingProduct) {
        await catalogueService.updateProduct(editingProduct.uid, productForm);
        // Upload image if a new file was chosen
        if (productImageFile) {
          const fd = new FormData();
          fd.append('image', productImageFile);
          fd.append('is_primary', 'true');
          await catalogueService.uploadProductImage(editingProduct.uid, fd);
        }
        showToast('Product updated successfully!');
        setProductModalOpen(false);
        fetchProducts();
        if (currentView === 'detail' && activeProduct) {
          reloadActiveProduct();
        }
      } else {
        const res = await catalogueService.createProduct(productForm);
        const newProdUid = res.data?.uid;

        // Upload primary image if selected
        if (newProdUid && productImageFile) {
          const fd = new FormData();
          fd.append('image', productImageFile);
          fd.append('is_primary', 'true');
          await catalogueService.uploadProductImage(newProdUid, fd);
        }

        showToast('Product created successfully with base variant!');
        setProductModalOpen(false);
        fetchProducts();

        if (newProdUid) {
          await handleInspectProduct(newProdUid);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.errors || 'Failed to save product', true);
    }
  };

  const handleDeleteProduct = async (prodUid) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await catalogueService.deleteProduct(prodUid);
      showToast('Product deleted successfully');
      if (currentView === 'detail') {
        setCurrentView('list');
        setActiveProduct(null);
      }
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', true);
    }
  };

  // --- Variant CRUD Handlers ---
  const openCreateVariantModal = () => {
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
    setVariantModalOpen(true);
  };

  const openEditVariantModal = (v) => {
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
    setVariantModalOpen(true);
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.mrp || !variantForm.selling_price) {
      alert('MRP and Selling Price are required.');
      return;
    }

    try {
      let savedVarUid = null;
      if (editingVariant) {
        const res = await catalogueService.updateVariant(editingVariant.uid, variantForm);
        savedVarUid = editingVariant.uid;
        showToast('Variant updated successfully!');
      } else {
        const res = await catalogueService.createVariant(activeProduct.uid, variantForm);
        savedVarUid = res.data?.uid;
        showToast('Variant created successfully!');
      }

      // If a variant image was uploaded
      if (savedVarUid && variantImageFile && activeProduct) {
        const fd = new FormData();
        fd.append('image', variantImageFile);
        fd.append('variant_uid', savedVarUid);
        fd.append('is_primary', 'true');
        await catalogueService.uploadProductImage(activeProduct.uid, fd);
      }

      setVariantModalOpen(false);
      reloadActiveProduct();
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.errors || 'Failed to save variant', true);
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
      // Find all values belonging to this specific attribute group
      const attrGroup = attributesList.find((a) => a.uid === attrUid);
      const groupValUids = attrGroup ? attrGroup.values.map((v) => v.uid) : [];

      // Remove any previously selected value from this same attribute group
      const withoutGroup = prev.attribute_values.filter((id) => !groupValUids.includes(id));

      // If clicking already selected option, toggle off; otherwise select the new option
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
                onClick={openCreateProductModal}
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
                                <span>Variants</span>
                              </button>
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                title="Edit product info"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.uid)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
      {/* 2. PRODUCT DETAIL & VARIANT MANAGEMENT VIEW */}
      {/* ============================================================== */}
      {currentView === 'detail' && activeProduct && (
        <div className="space-y-6">
          <button
            onClick={() => {
              setCurrentView('list');
              setActiveProduct(null);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft size={15} />
            <span>Back to Products List</span>
          </button>

          {/* Product Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex gap-4">
              {activeProduct.images?.length > 0 ? (
                <img
                  src={activeProduct.images[0].url}
                  alt={activeProduct.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <Package size={32} />
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
                <p className="text-xs text-slate-600 mt-2 max-w-xl whitespace-pre-line leading-relaxed">
                  {activeProduct.description || 'No description provided.'}
                </p>

                {/* Rich Details Grid in Admin Inspection */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
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
                onClick={() => openEditProductModal(activeProduct)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 size={15} />
                <span>Edit Info</span>
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
                  onClick={openCreateVariantModal}
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
                                onClick={() => openEditVariantModal(v)}
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
                <h4 className="font-extrabold text-slate-900 text-base">Product Images & Gallery</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload catalog photos, product angles, or package images
                </p>
              </div>

              <label className="inline-flex items-center gap-2 bg-[#9d71c7] hover:bg-[#8a5bb8] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer">
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

      {/* ============================================================== */}
      {/* 3. PRODUCT CREATE / EDIT MODAL */}
      {/* ============================================================== */}
      {productModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h4>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-base hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="flex flex-col">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="e.g. Ultra Soft Organic Cotton Pads"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      Category *
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      Product Type
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                    >
                      <option value="">-- Choose Type --</option>
                      {productTypes.map((pt) => (
                        <option key={pt.key} value={pt.key}>{pt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Product Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="Describe benefits, material, certifications..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      Highlights (One per line)
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="Antibacterial Strip&#10;Extra length for comfortable coverage&#10;High Absorbency"
                      value={productForm.highlights}
                      onChange={(e) => setProductForm({ ...productForm, highlights: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      What's Inside / Kit Breakdown
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="• XL Pads – 2 Nos&#10;• Wet Wipes – 4 Nos"
                      value={productForm.package_contents}
                      onChange={(e) => setProductForm({ ...productForm, package_contents: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      How to Use
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="Step-by-step instructions..."
                      value={productForm.how_to_use}
                      onChange={(e) => setProductForm({ ...productForm, how_to_use: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      Safety & Warnings
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="Precautions, fabric testing, warning notes..."
                      value={productForm.safety_warnings}
                      onChange={(e) => setProductForm({ ...productForm, safety_warnings: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="e.g. 96190010"
                      value={productForm.hsn_code}
                      onChange={(e) => setProductForm({ ...productForm, hsn_code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="0.00"
                      value={productForm.tax_rate}
                      onChange={(e) => setProductForm({ ...productForm, tax_rate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Variant Architecture Mode Toggle */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    Variant Configuration *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, has_variants: false })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        !productForm.has_variants
                          ? 'border-[#9d71c7] bg-[#f6effc] text-[#6f4798] ring-2 ring-purple-100 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">Single Product</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        No sizes/packs. Direct fixed price. Cannot add variants later.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, has_variants: true })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        productForm.has_variants
                          ? 'border-[#9d71c7] bg-[#f6effc] text-[#6f4798] ring-2 ring-purple-100 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">Multi-Variant Product</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        Multiple sizes, pack counts, or options (e.g. 280mm, 320mm).
                      </div>
                    </button>
                  </div>

                  {/* If Single Product: require Selling Price & MRP */}
                  {!productForm.has_variants && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Product Price *
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Selling Price (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                            placeholder="e.g. 299.00"
                            value={productForm.selling_price}
                            onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                            required={!productForm.has_variants}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            MRP (Printed) (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#9d71c7]"
                            placeholder="e.g. 399.00"
                            value={productForm.mrp}
                            onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                            required={!productForm.has_variants}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {productForm.has_variants && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      You can create and manage variant combinations (Size, Pack Count, SKU, and Price) after saving.
                    </p>
                  )}
                </div>

                {/* Primary Image Upload */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Product Primary Image
                  </label>
                  <div className="flex items-center gap-3">
                    {productImagePreview ? (
                      <img
                        src={productImagePreview}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-slate-50"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageChange}
                        className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f6effc] file:text-[#9d71c7] hover:file:bg-[#ecdcf8] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">JPG, PNG, or WEBP (Max 5MB)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="product_is_active"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                    className="accent-[#9d71c7] rounded cursor-pointer"
                  />
                  <label htmlFor="product_is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Active (visible in catalogue)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#9d71c7] hover:bg-[#8a5bb8] transition-all cursor-pointer shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. VARIANT CREATE / EDIT MODAL */}
      {/* ============================================================== */}
      {variantModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setVariantModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">
                {editingVariant ? 'Edit Variant' : 'Add New Variant'}
              </h4>
              <button
                onClick={() => setVariantModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-base hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveVariant} className="flex flex-col">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                    placeholder="e.g. PAD-XL-14"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      MRP (Maximum Retail Price) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="e.g. 299.00"
                      value={variantForm.mrp}
                      onChange={(e) => setVariantForm({ ...variantForm, mrp: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                      Selling Price (Discounted) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9d71c7]"
                      placeholder="e.g. 249.00"
                      value={variantForm.selling_price}
                      onChange={(e) => setVariantForm({ ...variantForm, selling_price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Attributes Selection */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                      Connect Attributes <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    {variantForm.attribute_values.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setVariantForm({ ...variantForm, attribute_values: [] })}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear Selection (Standalone)
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Leave blank if this is a single standalone item (like a bag, pouch, or heat belt) with no sizes or colors.
                  </p>
                  <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                    {attributesList.map((attr) => (
                      <div key={attr.uid} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          {attr.name}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {attr.values?.map((val) => {
                            const isSelected = variantForm.attribute_values.includes(val.uid);
                            return (
                              <button
                                type="button"
                                key={val.uid}
                                onClick={() => toggleAttributeSelect(attr.uid, val.uid)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#9d71c7] bg-[#f6effc] text-[#6f4798]'
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

                {/* Variant-specific Image */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                    Variant Photo / Packaging (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    {variantImagePreview ? (
                      <img
                        src={variantImagePreview}
                        alt="Variant Preview"
                        className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-slate-50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50">
                        <ImageIcon size={18} />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVariantImageChange}
                        className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f6effc] file:text-[#9d71c7] hover:file:bg-[#ecdcf8] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Overrides product image when this variant is picked</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="variant_is_default"
                      checked={variantForm.is_default}
                      onChange={(e) => setVariantForm({ ...variantForm, is_default: e.target.checked })}
                      className="accent-[#9d71c7] rounded cursor-pointer"
                    />
                    <label htmlFor="variant_is_default" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Set as Default Variant
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="variant_is_active"
                      checked={variantForm.is_active}
                      onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                      className="accent-[#9d71c7] rounded cursor-pointer"
                    />
                    <label htmlFor="variant_is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#9d71c7] hover:bg-[#8a5bb8] transition-all cursor-pointer shadow-xs"
                >
                  {editingVariant ? 'Save Changes' : 'Create Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

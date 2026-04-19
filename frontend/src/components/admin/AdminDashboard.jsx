import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getDisplayOrderNumber } from '../../lib/customer';
import { productTypeOptions } from '../../lib/productTypes';
import { parseSpecificationText, stringifySpecifications } from '../../lib/specifications';

const initialProduct = {
  title: '',
  description: '',
  price: '',
  discount: '',
  stock: '',
  category: 'Trending Summer Products',
  featured: true,
  imageUrlsText: '',
  videoUrl: '',
  specificationsText: '',
  specifications: [{ label: '', value: '' }]
};

const toProductPayload = (form) => ({
  title: form.title,
  description: form.description,
  price: Number(form.price),
  discount: Number(form.discount || 0),
  stock: Number(form.stock || 0),
  category: form.category,
  featured: Boolean(form.featured),
  imageUrls: form.imageUrlsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  videoUrl: form.videoUrl,
  specifications: [...form.specifications, ...parseSpecificationText(form.specificationsText)]
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
    .filter((item) => item.label && item.value)
});

const formatCurrency = (value) => `Rs ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

const getOrderLine = (address = '', label) => {
  const line = String(address)
    .split('\n')
    .find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.replace(new RegExp(`^${label}:\\s*`, 'i'), '') : '';
};
export function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('bharatmart-admin-token') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [productForm, setProductForm] = useState(initialProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', active: true });
  const [dashboard, setDashboard] = useState({
    products: [],
    orders: [],
    announcements: [],
    coupons: []
  });
  const [message, setMessage] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadDashboard = async () => {
    if (!token) return;

    const { data } = await api.get('/admin/dashboard', { headers: authHeaders });
    setDashboard(data.data);
  };

  useEffect(() => {
    loadDashboard().catch(() => {});
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginStatus('Checking admin credentials, please wait...');

    try {
      const { data } = await api.post('/users/admin-login', loginForm);
      localStorage.setItem('bharatmart-admin-token', data.token);
      setToken(data.token);
      setMessage('Admin login successful. Loading dashboard...');
      setLoginStatus('Logged in successfully. Loading dashboard...');
    } catch (error) {
      setLoginStatus(error.response?.data?.message || 'Admin login failed. Please check email and password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    const payload = toProductPayload(productForm);

    if (editingProductId) {
      await api.put(`/admin/products/${editingProductId}`, payload, { headers: authHeaders });
      setMessage('Product updated.');
    } else {
      await api.post('/admin/products', payload, { headers: authHeaders });
      setMessage('Product created.');
    }

    setProductForm(initialProduct);
    setEditingProductId(null);
    loadDashboard();
  };

  const handleAnnouncementSubmit = async (event) => {
    event.preventDefault();
    await api.post(
      '/admin/announcements',
      { text: announcementText, active: true },
      { headers: authHeaders }
    );
    setAnnouncementText('');
    setMessage('Announcement created.');
    loadDashboard();
  };

  const handleCouponSubmit = async (event) => {
    event.preventDefault();
    await api.post('/admin/coupons', couponForm, { headers: authHeaders });
    setCouponForm({ code: '', discount: '', active: true });
    setMessage('Coupon created.');
    loadDashboard();
  };

  const updateOrderStatus = async (orderId, status) => {
    await api.patch(`/admin/orders/${orderId}`, { status }, { headers: authHeaders });
    setMessage('Order status updated.');
    loadDashboard();
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      category: product.category,
      featured: Boolean(product.featured),
      imageUrlsText: JSON.parse(product.image_urls || '[]').join(', '),
      videoUrl: product.video_url || ''
    });
  };

  const updateSpecificationRow = (index, field, value) => {
    setProductForm((current) => ({
      ...current,
      specifications: current.specifications.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const addSpecificationRow = () => {
    setProductForm((current) => ({
      ...current,
      specifications: [...current.specifications, { label: '', value: '' }]
    }));
  };

  const removeSpecificationRow = (index) => {
    setProductForm((current) => ({
      ...current,
      specifications: current.specifications.filter((row, rowIndex) => rowIndex !== index)
    }));
  };
  const deleteProduct = async (productId) => {
    await api.delete(`/products/${productId}`, { headers: authHeaders });
    setMessage('Product deleted.');
    if (editingProductId === productId) {
      setEditingProductId(null);
      setProductForm(initialProduct);
    }
    loadDashboard();
  };

  const toggleCoupon = async (coupon) => {
    await api.patch(`/admin/coupons/${coupon.id}`, { active: !coupon.active }, { headers: authHeaders });
    setMessage('Coupon status updated.');
    loadDashboard();
  };

  const toggleAnnouncement = async (announcement) => {
    await api.patch(
      `/admin/announcements/${announcement.id}`,
      { active: !announcement.active },
      { headers: authHeaders }
    );
    setMessage('Announcement status updated.');
    loadDashboard();
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-ink">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">Secure JWT login for BharatMart operations.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Admin email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"
            value={loginForm.email}
            onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <button disabled={loginLoading} className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-white transition hover:bg-brand hover:text-navy disabled:opacity-60">
            {loginLoading ? 'Please wait...' : 'Login'}
          </button>
          {loginStatus ? <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{loginStatus}</p> : null}

        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-ink">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage products, announcements, coupons, media, and incoming orders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('bharatmart-admin-token');
              setToken('');
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Logout
          </button>
        </div>
        {message ? <p className="mt-4 text-sm font-medium text-accent">{message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] bg-white p-5 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Total Orders</p>
          <p className="mt-2 text-3xl font-black text-ink">{dashboard.orders.length}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-black text-orange-600">{dashboard.orders.filter((order) => order.status === 'Pending').length}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Delivered</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{dashboard.orders.filter((order) => order.status === 'Delivered').length}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatCurrency(dashboard.orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0))}</p>
        </div>
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Order Management</p>
            <h2 className="mt-2 text-2xl font-black text-ink">All Customer Orders</h2>
            <p className="mt-1 text-sm text-slate-500">Public order numbers start from #2488 for stronger social proof while database IDs stay private.</p>
          </div>
          <button type="button" onClick={loadDashboard} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            Refresh Orders
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {dashboard.orders.length ? dashboard.orders.map((order) => {
            const billing = getOrderLine(order.address, 'Billing');
            const shipping = getOrderLine(order.address, 'Shipping');
            const payment = getOrderLine(order.address, 'Payment') || 'COD';
            const coupon = getOrderLine(order.address, 'Coupon') || 'No coupon';
            const note = getOrderLine(order.address, 'Note') || 'No note';
            return (
              <div key={order.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                    <h3 className="mt-1 text-2xl font-black text-ink">Order {getDisplayOrderNumber(order.id)}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{order.customer_name} - {order.phone}</p>
                    <p className="text-sm text-slate-500">{order.email}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order Value</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(order.total_price)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{payment}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-black text-ink">Billing Address</p>
                    <p className="mt-1 text-slate-600">{billing || order.address}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-black text-ink">Shipping Address</p>
                    <p className="mt-1 text-slate-600">{shipping || billing || order.address}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-black text-ink">Coupon</p>
                    <p className="mt-1 text-slate-600">{coupon}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-black text-ink">Customer Note</p>
                    <p className="mt-1 text-slate-600">{note}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['Pending', 'Shipped', 'Delivered'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateOrderStatus(order.id, status)}
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        order.status === status
                          ? 'bg-brand text-navy'
                          : 'border border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </div>
            );
          }) : (
            <p className="rounded-3xl bg-slate-50 p-5 text-slate-500">No orders yet.</p>
          )}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={handleProductSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-ink">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
            {editingProductId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm(initialProduct);
                }}
                className="text-sm font-semibold text-slate-500"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-4">
            <input
              placeholder="Product title"
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={productForm.title}
              onChange={(event) => setProductForm((current) => ({ ...current, title: event.target.value }))}
            />
            <textarea
              placeholder="Description"
              className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3"
              value={productForm.description}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, description: event.target.value }))
              }
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Price"
                type="number"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={productForm.price}
                onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
              />
              <input
                placeholder="Discount %"
                type="number"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={productForm.discount}
                onChange={(event) =>
                  setProductForm((current) => ({ ...current, discount: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Stock"
                type="number"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={productForm.stock}
                onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
              />
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Product selling type
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({ ...current, category: event.target.value }))
                  }
                >
                  {productTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Choose Physical, Plant Based/Microgreen, or Digital so the website places it in the right section.
                </p>
              </div>
            </div>
            <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-3">
              {productTypeOptions.slice(0, 3).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProductForm((current) => ({ ...current, category: option.value }))}
                  className={`rounded-2xl border p-4 text-left transition active:scale-95 ${
                    productForm.category === option.value
                      ? 'border-orange-400 bg-white shadow-soft'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <p className="text-sm font-black text-ink">{option.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{option.hint}</p>
                </button>
              ))}
            </div>
            <textarea
              placeholder="Image URLs separated by commas"
              className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3"
              value={productForm.imageUrlsText}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, imageUrlsText: event.target.value }))
              }
            />
            <input
              placeholder="Video URL"
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={productForm.videoUrl}
              onChange={(event) => setProductForm((current) => ({ ...current, videoUrl: event.target.value }))}
            />

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-ink">Product Specification Table</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Paste rows like "Cooler Type: Desert" or paste two-column table data from Excel/Sheets.
                  </p>
                </div>
                <button type="button" onClick={addSpecificationRow} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                  Add row
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {productForm.specifications.map((row, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
                    <input
                      placeholder="Column / label"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      value={row.label}
                      onChange={(event) => updateSpecificationRow(index, 'label', event.target.value)}
                    />
                    <input
                      placeholder="Value"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      value={row.value}
                      onChange={(event) => updateSpecificationRow(index, 'value', event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecificationRow(index)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Paste specification table here"
                className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                value={productForm.specificationsText}
                onChange={(event) => setProductForm((current) => ({ ...current, specificationsText: event.target.value }))}
              />
            </div>

            <button className="rounded-full bg-brand px-5 py-3 font-semibold text-navy">
              {editingProductId ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>

        <div className="space-y-8">
          <form onSubmit={handleAnnouncementSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-black text-ink">Announcement Banner</h2>
            <input
              placeholder="Announcement text"
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={announcementText}
              onChange={(event) => setAnnouncementText(event.target.value)}
            />
            <button className="mt-4 rounded-full bg-ink px-5 py-3 font-semibold text-white">
              Publish Banner
            </button>
            <div className="mt-4 space-y-2">
              {dashboard.announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="pr-3 text-slate-600">{announcement.text}</span>
                  <button type="button" onClick={() => toggleAnnouncement(announcement)} className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold">
                    {announcement.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </form>

          <form onSubmit={handleCouponSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-black text-ink">Coupons</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                placeholder="Code"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={couponForm.code}
                onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value }))}
              />
              <input
                placeholder="Discount %"
                type="number"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={couponForm.discount}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, discount: event.target.value }))
                }
              />
            </div>
            <button className="mt-4 rounded-full bg-accent px-5 py-3 font-semibold text-white">
              Save Coupon
            </button>
            <div className="mt-4 space-y-2">
              {dashboard.coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-ink">{coupon.code} ({coupon.discount}%)</span>
                  <button type="button" onClick={() => toggleCoupon(coupon)} className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold">
                    {coupon.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-black text-ink">Products</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {dashboard.products.map((product) => (
            <div key={product.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{product.title}</p>
                  <p className="text-sm text-slate-500">Rs {product.price} - {product.stock} in stock</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editProduct(product)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

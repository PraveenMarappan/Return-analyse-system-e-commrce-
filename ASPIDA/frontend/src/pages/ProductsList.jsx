import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Eye, TrendingUp, AlertTriangle } from 'lucide-react';
import { productService } from '../services/productService';
import { RiskBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'Footwear', price: '', description: '' });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ search, category });
      if (res.success) setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleViewDetail = async (p) => {
    setSelectedProduct(p);
    setDetailLoading(true);
    try {
      const res = await productService.getProductById(p.id);
      if (res.success) setProductDetail(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      const res = await productService.createProduct(newProduct);
      if (res.success) {
        setShowAddModal(false);
        setNewProduct({ name: '', sku: '', category: 'Footwear', price: '', description: '' });
        fetchProducts();
      } else {
        setAddError(res.message || 'Failed to create product.');
      }
    } catch (err) {
      setAddError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Portfolio Risk & Health Monitor</h1>
          <p className="page-subtitle">Multi-factor Risk Scoring (0–100) and Health Score assessment across catalogue SKUs</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Product SKU
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: '180px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>Category: {c}</option>)}
          </select>

          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Return Rate</th>
              <th>Health Score</th>
              <th>Risk Score</th>
              <th>Top Complaint</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px' }}>Loading product catalogue...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No products found matching query.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.sku}</td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                  <td>{formatPercent(p.return_rate)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.health_score >= 70 ? '#10b981' : (p.health_score >= 40 ? '#f59e0b' : '#ef4444') }}>
                      {p.health_score}/100
                    </span>
                  </td>
                  <td><RiskBadge score={p.risk_score} status={p.status} /></td>
                  <td>{p.top_complaint || 'None'}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleViewDetail(p)}>
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Profile Modal */}
      {selectedProduct && (
        <Modal
          title={`Product Profile: ${selectedProduct.name}`}
          onClose={() => { setSelectedProduct(null); setProductDetail(null); }}
        >
          {detailLoading ? (
            <p style={{ textAlign: 'center', padding: '30px' }}>Loading detailed metrics...</p>
          ) : productDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-3" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PRODUCT HEALTH SCORE</p>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: productDetail.health_score >= 70 ? '#10b981' : '#ef4444' }}>
                    {productDetail.health_score}/100
                  </h2>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RISK SCORE</p>
                  <div style={{ marginTop: '4px' }}><RiskBadge score={productDetail.risk_score} status={productDetail.status} /></div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RETURN RATE</p>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {formatPercent(productDetail.return_rate)}
                  </h2>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>RISK FACTORS IDENTIFIED BY SYSTEM</p>
                {productDetail.factors && productDetail.factors.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {productDetail.factors.map((f, idx) => <li key={idx}>{f}</li>)}
                  </ul>
                ) : <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No high risk factors triggered.</p>}
              </div>

              {productDetail.recommendations && productDetail.recommendations.length > 0 && (
                <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>RECOMMENDED ACTION FOR PRODUCT</p>
                  <p style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '4px' }}>{productDetail.recommendations[0].recommendation}</p>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <Modal title="Add New Product SKU" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateProduct}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="SKU-FOOT-1001"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Price (INR) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>

            {addError && (
              <div style={{ padding: '10px', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                {addError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Product</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProductsList;

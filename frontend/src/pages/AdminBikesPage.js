import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Bike, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { fleetBikeSchema, validateWithToast } from '../validation/schemas';
import BikeImage from '../components/BikeImage';

const AdminBikesPage = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor Modal state
  const [showEditor, setShowEditor] = useState(false);
  const [editingBike, setEditingBike] = useState(null); // null if adding, bike object if editing

  // Form Fields
  const [bikeName, setBikeName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [pricePerDay, setPricePerDay] = useState(1000);
  const [availability, setAvailability] = useState('Available');
  const [imageUrl, setImageUrl] = useState('');
  const [engine, setEngine] = useState('');
  const [torque, setTorque] = useState('');
  const [fuelTank, setFuelTank] = useState('');
  const [mileage, setMileage] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5 MB or less');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    const toastId = toast.loading('Uploading image to Cloudinary...');
    try {
      const res = await client.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.url);
      toast.success('Image uploaded to Cloudinary successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload image to Cloudinary', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchBikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/bikes');
      setBikes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching fleet catalog:", err);
      setError("Failed to sync fleet inventory database.");
      toast.error('Failed to load fleet inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingBike(null);
    setBikeName('');
    setBrand('');
    setModel('');
    setPricePerDay(1000);
    setAvailability('Available');
    setImageUrl('');
    setEngine('');
    setTorque('');
    setFuelTank('');
    setMileage('');
    setPlateNumber('');
    setShowEditor(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (bike) => {
    setEditingBike(bike);
    setBikeName(bike.bike_name);
    setBrand(bike.brand);
    setModel(bike.model);
    setPricePerDay(bike.price_per_day);
    setAvailability(bike.availability);
    setImageUrl(bike.image_url || '');
    setEngine(bike.engine || '');
    setTorque(bike.torque || '');
    setFuelTank(bike.fuel_tank || '');
    setMileage(bike.mileage || '');
    setPlateNumber(bike.plate_number || '');
    setShowEditor(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const validation = validateWithToast(fleetBikeSchema, {
      bikeName, brand, model, pricePerDay: Number(pricePerDay), availability,
      imageUrl, engine, torque, fuelTank, mileage, plateNumber,
    });
    if (!validation) return;

    setFormLoading(true);
    const payload = {
      bike_name: bikeName,
      brand: brand,
      model: model,
      price_per_day: Number(pricePerDay),
      availability: availability,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600',
      engine: engine || null,
      torque: torque || null,
      fuel_tank: fuelTank || null,
      mileage: mileage || null,
      plate_number: plateNumber || null
    };

    try {
      if (editingBike) {
        // Edit flow
        await client.put(`/update-bike/${editingBike.id}`, payload);
        toast.success("Motorcycle fleet details updated successfully!");
      } else {
        // Add flow
        await client.post('/add-bike', payload);
        toast.success("New motorcycle added to active fleet successfully!");
      }
      setShowEditor(false);
      fetchBikes();
    } catch (err) {
      toast.error("Could not save motorcycle: " + (err.response?.data?.detail || "Connection timeout."));
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Bike
  const handleDeleteBike = async (id) => {
    const check = window.confirm("Are you sure you want to permanently delete this bike from the system?");
    if (!check) return;

    try {
      await client.delete(`/delete-bike/${id}`);
      toast.success("Bike deleted from active list successfully.");
      fetchBikes();
    } catch (err) {
      toast.error("Failed to delete bike: " + (err.response?.data?.detail || "Dependency block."));
    }
  };

  return (
    <div className="home-container animate-fade-in" style={{ paddingBottom: '100px' }}>
      <header className="hero-section" style={{ marginBottom: '40px' }}>
        <div className="hero-badge" style={{ background: 'rgba(255, 94, 20, 0.1)', borderColor: 'rgba(255, 94, 20, 0.2)', color: 'var(--accent)' }}>
          🔐 Fleet cockpit
        </div>
        <h1 className="hero-title" style={{ fontSize: '38px' }}>Manage Fleet Catalog</h1>
        <p className="hero-subtitle">Instantly insert new vehicles, edit specifications, delete decommissioned rides, and inspect availability status.</p>
      </header>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button onClick={handleOpenAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>Add New Motorcycle</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Syncing active motorcycle fleet catalog...</p>
        </div>
      ) : error ? (
        <div className="empty-box" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={48} color="#ef4444" />
          <h3 style={{ color: '#ef4444', marginTop: '10px' }}>Sync Failure</h3>
          <p>{error}</p>
        </div>
      ) : bikes.length === 0 ? (
        <div className="empty-box">
          <Bike size={48} color="var(--accent)" />
          <h3>No Motorcycles Active</h3>
          <p>The active fleet catalog is currently empty! Click the "Add New Motorcycle" button to seed values.</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle Detail</th>
                <th>Brand & Model</th>
                <th>Price / Day</th>
                <th>Specifications</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bikes.map(bike => {
                const isAvailable = bike.availability.toLowerCase().includes('avail');
                return (
                  <tr key={bike.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '65px', height: '45px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                          <BikeImage src={bike.image_url} alt={bike.bike_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '15px' }}>{bike.bike_name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{bike.id}91 | Plate: {bike.plate_number || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{bike.brand}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Year: {bike.model}</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent)', fontSize: '15px' }}>₹{bike.price_per_day}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '240px' }}>
                        {bike.engine && <span className="spec-pill" style={{ fontSize: '10px' }}>{bike.engine} cc</span>}
                        {bike.mileage && <span className="spec-pill" style={{ fontSize: '10px' }}>{bike.mileage} km/l</span>}
                        {bike.fuel_tank && <span className="spec-pill" style={{ fontSize: '10px' }}>{bike.fuel_tank} L</span>}
                      </div>
                    </td>
                    <td>
                      <span className={isAvailable ? 'badge-verified' : 'badge-unverified'}>
                        {bike.availability}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenEditModal(bike)} className="btn-secondary" style={{ padding: '6px 10px' }} title="Edit details">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDeleteBike(bike.id)} className="btn-logout" style={{ padding: '6px 10px' }} title="Delete Vehicle">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal Drawer */}
      {showEditor && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingBike ? `Edit Vehicle: ${editingBike.bike_name}` : 'Add New Vehicle to Catalog'}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowEditor(false)}>Close</button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Bike Catalog Name</label>
                  <input type="text" maxLength={100} className="form-input" placeholder="e.g. Enfield Continental GT 650" value={bikeName} onChange={(e) => setBikeName(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Manufacturer / Brand</label>
                  <input type="text" maxLength={80} className="form-input" placeholder="e.g. Royal Enfield" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Model Year</label>
                  <input type="text" maxLength={40} className="form-input" placeholder="e.g. 2024" value={model} onChange={(e) => setModel(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rent Price per Day (INR)</label>
                  <input type="number" min={1} max={1000000} step={1} className="form-input" placeholder="e.g. 1200" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Availability Status</label>
                  <select className="brand-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="Available">Available (Open for bookings)</option>
                    <option value="Booked">Booked (Blocked globally)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Plate / Registration No</label>
                  <input type="text" maxLength={20} className="form-input" placeholder="e.g. MH-12-AB-1234" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Bike Image (Upload to Cloudinary)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    style={{ fontSize: '13px', padding: '6px 0' }}
                  />
                  {uploadingImage && <span style={{ fontSize: '12px', color: 'var(--accent)' }}>Uploading image to Cloudinary...</span>}
                  <input 
                    type="url" 
                    maxLength={2048} 
                    className="form-input" 
                    placeholder="Image URL (auto-filled on file upload, or enter URL)" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                  />
                  {imageUrl && (
                    <div style={{ marginTop: '6px', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <img src={imageUrl} alt="Bike Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', margin: '20px 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                Engine & Ride Specifications (Optional)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Engine Capacity (cc)</label>
                  <input type="text" maxLength={40} className="form-input" placeholder="648" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ padding: '8px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Torque (Nm)</label>
                  <input type="text" maxLength={40} className="form-input" placeholder="52" value={torque} onChange={(e) => setTorque(e.target.value)} style={{ padding: '8px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Fuel Tank (Liters)</label>
                  <input type="text" maxLength={40} className="form-input" placeholder="13.7" value={fuelTank} onChange={(e) => setFuelTank(e.target.value)} style={{ padding: '8px 12px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Estimated Mileage (km/l)</label>
                  <input type="text" maxLength={40} className="form-input" placeholder="25" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ padding: '8px 12px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditor(false)} className="btn-secondary" style={{ flexGrow: 1, padding: '12px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flexGrow: 2, padding: '12px' }} disabled={formLoading}>
                  {formLoading ? 'Saving changes...' : 'Save Motorcycle Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBikesPage;

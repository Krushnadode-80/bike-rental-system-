import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Cloud, 
  Home, 
  Users, 
  ClipboardList, 
  Bike, 
  LogOut, 
  Trash2, 
  DollarSign, 
  Search, 
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import '../Dashboard.css'; // Import the new styles
import toast from 'react-hot-toast';
import { adminBikeSchema, adminUserSchema, validateWithToast } from '../validation/schemas';
import BikeImage from '../components/BikeImage';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [fleetBikes, setFleetBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bikeForm, setBikeForm] = useState({
    bike_name: '', brand: '', model: '', price_per_day: '', availability: 'Available', 
    image_url: '', engine: '', mileage: '', torque: '', fuel_tank: '', plate_number: ''
  });
  const [bikeLoading, setBikeLoading] = useState(false);
  const [uploadingBikeImage, setUploadingBikeImage] = useState(false);
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [selectedViewBike, setSelectedViewBike] = useState(null);
  const [editBikeId, setEditBikeId] = useState(null);
  const [bikeFilter, setBikeFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ id: null, name: '', email: '', phone: '', role: '' });
  const [userLoading, setUserLoading] = useState(false);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const resStats = await client.get('/admin/dashboard');
      setStats(resStats.data);

      const resUsers = await client.get('/admin/users');
      setUsersList(Array.isArray(resUsers.data) ? resUsers.data : []);

      const resBookings = await client.get('/admin/bookings');
      setBookingsList(Array.isArray(resBookings.data) ? resBookings.data : []);

      const resBikes = await client.get('/bikes');
      setFleetBikes(Array.isArray(resBikes.data) ? resBikes.data : []);
    } catch (err) {
      console.error("Error fetching administrative dashboard:", err);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (userId) => {
    const check = window.confirm("Are you sure you want to delete this user?");
    if (!check) return;
    try {
      await client.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to delete user: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    const validatedUser = validateWithToast(adminUserSchema, editUserForm);
    if (!validatedUser) return;
    setUserLoading(true);
    try {
      await client.put(`/admin/users/${editUserForm.id}`, {
        name: validatedUser.name,
        email: validatedUser.email,
        phone: validatedUser.phone,
        role: validatedUser.role
      });
      toast.success('User updated successfully!');
      setShowEditUserModal(false);
      fetchDashboardData();
      if (selectedUser && selectedUser.id === editUserForm.id) {
        setSelectedUser({ ...selectedUser, name: editUserForm.name, email: editUserForm.email, phone: editUserForm.phone, role: editUserForm.role });
      }
    } catch (err) {
      toast.error("Failed to update user: " + (err.response?.data?.detail || err.message));
    } finally {
      setUserLoading(false);
    }
  };

  const openEditUserModal = (user) => {
    setEditUserForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user'
    });
    setShowEditUserModal(true);
  };

  const handleBikeChange = (e) => {
    setBikeForm({ ...bikeForm, [e.target.name]: e.target.value });
  };

  const handleDashboardBikeImageChange = async (e) => {
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

    setUploadingBikeImage(true);
    const toastId = toast.loading('Uploading image to Cloudinary...');
    try {
      const res = await client.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBikeForm((prev) => ({ ...prev, image_url: res.data.url }));
      toast.success('Image uploaded to Cloudinary successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload image to Cloudinary', { id: toastId });
    } finally {
      setUploadingBikeImage(false);
    }
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    const validatedBike = validateWithToast(adminBikeSchema, bikeForm);
    if (!validatedBike) return;
    setBikeLoading(true);
    try {
      if (editBikeId) {
        await client.put(`/update-bike/${editBikeId}`, { ...validatedBike, price_per_day: Number(validatedBike.price_per_day) });
        toast.success('Bike updated successfully!');
      } else {
        await client.post('/add-bike', { ...validatedBike, price_per_day: Number(validatedBike.price_per_day) });
        toast.success('Bike added successfully!');
      }
      setBikeForm({
        bike_name: '', brand: '', model: '', price_per_day: '', availability: 'Available', 
        image_url: '', engine: '', mileage: '', torque: '', fuel_tank: '', plate_number: ''
      });
      setEditBikeId(null);
      setShowAddBikeModal(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(`Failed to ${editBikeId ? 'update' : 'add'} bike: ` + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setBikeLoading(false);
    }
  };

  const openAddModal = () => {
    setBikeForm({
      bike_name: '', brand: '', model: '', price_per_day: '', availability: 'Available', 
      image_url: '', engine: '', mileage: '', torque: '', fuel_tank: '', plate_number: ''
    });
    setEditBikeId(null);
    setShowAddBikeModal(true);
  };

  const openEditModal = (bike) => {
    setBikeForm({
      bike_name: bike.bike_name || '', brand: bike.brand || '', model: bike.model || '', 
      price_per_day: bike.price_per_day || '', availability: bike.availability || 'Available', 
      image_url: bike.image_url || '', engine: bike.engine || '', mileage: bike.mileage || '', 
      torque: bike.torque || '', fuel_tank: bike.fuel_tank || '', plate_number: bike.plate_number || ''
    });
    setEditBikeId(bike.id);
    setShowAddBikeModal(true);
  };

  const handleDeleteBike = async (bikeId) => {
    if (!window.confirm("Are you sure you want to delete this bike?")) return;
    try {
      await client.delete(`/delete-bike/${bikeId}`);
      toast.success('Bike deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to delete bike: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await client.delete(`/cancel-booking/${bookingId}`);
      toast.success('Booking cancelled successfully.');
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to cancel booking: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleVerifyUser = async (userId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      if (action === 'verify') {
        await client.put(`/admin/users/${userId}/verify`);
      } else {
        await client.put(`/admin/users/${userId}/unverify`);
      }
      toast.success(`User ${action === 'verify' ? 'verified' : 'verification removed'} successfully.`);
      fetchDashboardData();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, admin_verified: action === 'verify' });
      }
    } catch (err) {
      toast.error(`Failed to ${action} user: ` + (err.response?.data?.detail || err.message));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderOverview = () => {
    const activeRentals = bookingsList.filter(b => b.status === 'Booked').length;
    const cancelledRentals = bookingsList.filter(b => b.status === 'Cancelled').length || 12;

    return (
    <>
      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-icon-box purple">
            <Users size={24} />
          </div>
          <div className="dash-card-info">
            <h4>Total Users</h4>
            <h2>{stats?.total_users || 7}</h2>
            <p>Active Members</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon-box green">
            <Bike size={24} />
          </div>
          <div className="dash-card-info">
            <h4>Total Bikes</h4>
            <h2>{stats?.total_bikes || 2}</h2>
            <p>Live Inventory</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon-box orange">
            <ClipboardList size={24} />
          </div>
          <div className="dash-card-info">
            <h4>Active Rentals</h4>
            <h2>{activeRentals || 0}</h2>
            <p>Currently Out</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon-box pink">
            <DollarSign size={24} />
          </div>
          <div className="dash-card-info">
            <h4>Total Revenue</h4>
            <h2>₹{stats?.total_revenue || 18450}</h2>
            <p>Gross Earnings</p>
          </div>
        </div>
      </div>

      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <h4>Revenue Analytics (Monthly)</h4>
          <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'May', revenue: 750 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="dash-chart-card">
          <h4>Weekly Performance</h4>
          <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', val: 0 }, { name: 'Tue', val: 0 }, { name: 'Wed', val: 0 },
                { name: 'Thu', val: 750 }, { name: 'Fri', val: 0 }, { name: 'Sat', val: 0 }, { name: 'Sun', val: 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{fill: '#fff', stroke: '#10b981', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dash-bottom-grid">
        <div className="dash-bottom-card">
          <p className="dash-bottom-card-title">Most Booked Bike</p>
          <h3 className="dash-bottom-card-value">Hutter</h3>
        </div>
        <div className="dash-bottom-card">
          <p className="dash-bottom-card-title">Peak Booking Day</p>
          <h3 className="dash-bottom-card-value">Thu</h3>
        </div>
        <div className="dash-bottom-card">
          <p className="dash-bottom-card-title">Cancelled Rentals</p>
          <h3 className="dash-bottom-card-value red">{cancelledRentals}</h3>
        </div>
        <div className="dash-bottom-card dash-notifications">
          <div className="dash-notif-header">
            <h4><span style={{color: '#f59e0b'}}>🔔</span> Notifications</h4>
            <span className="dash-notif-badge">10 New</span>
          </div>
          <div className="dash-notif-item">
            <div className="dash-notif-icon">!</div>
            <div className="dash-notif-content">
              <h5>Booking Cancelled</h5>
              <p>pankaj reserved Hutter</p>
              <span>2026-05-20</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )};

  const renderUsers = () => (
    <div className="dash-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0 }}>User Directory</h3>
        <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
          Total: {usersList.length}
        </div>
      </div>
      
      <table className="dash-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map(u => (
            <tr key={u.id}>
              <td>
                <div onClick={() => setSelectedUser(u)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} title="View User Details">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <strong>{u.name}</strong>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <span className={`status-badge status-${u.role === 'admin' ? 'admin' : 'user'}`}>
                  {u.role}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {u.role !== 'admin' && (
                    <button className="dash-action-btn" onClick={() => handleDeleteUser(u.id)} title="Delete User">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: '#f8fafc', borderRadius: '20px', width: 'calc(100% - 32px)', maxWidth: '800px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(15,23,42,0.28)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: '#0f172a', padding: '14px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>User Profile: {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} aria-label="Close user profile" style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#fff', padding: '0 2px', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ padding: '20px 24px 22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '190px minmax(0, 1fr)', gap: '24px', marginBottom: '22px' }}>
              <div>
                {selectedUser.profile_photo ? (
                  <img src={selectedUser.profile_photo} alt="Profile" style={{ width: '100%', height: '190px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                ) : (
                    <div style={{ width: '100%', height: '190px', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', color: '#94a3b8' }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, background: selectedUser.admin_verified ? '#dcfce7' : '#fee2e2', color: selectedUser.admin_verified ? '#16a34a' : '#ef4444' }}>
                    {selectedUser.admin_verified ? 'Verified by Admin' : 'Unverified'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', color: '#334155' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '125px 14px minmax(0, 1fr)', alignItems: 'center', gap: '8px', minHeight: '42px', borderBottom: '1px solid #e8edf4' }}><strong style={{ color: '#475569' }}>Email</strong><span style={{ color: '#94a3b8' }}>:</span><span style={{ overflowWrap: 'anywhere' }}>{selectedUser.email}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '125px 14px minmax(0, 1fr)', alignItems: 'center', gap: '8px', minHeight: '42px', borderBottom: '1px solid #e8edf4' }}><strong style={{ color: '#475569' }}>Phone</strong><span style={{ color: '#94a3b8' }}>:</span><span>{selectedUser.phone || 'N/A'}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '125px 14px minmax(0, 1fr)', alignItems: 'center', gap: '8px', minHeight: '42px', borderBottom: '1px solid #e8edf4' }}><strong style={{ color: '#475569' }}>Address</strong><span style={{ color: '#94a3b8' }}>:</span><span>{selectedUser.address || 'N/A'}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '125px 14px minmax(0, 1fr)', alignItems: 'center', gap: '8px', minHeight: '42px', borderBottom: '1px solid #e8edf4' }}><strong style={{ color: '#475569' }}>Role</strong><span style={{ color: '#94a3b8' }}>:</span><span style={{ display: 'inline-flex', width: 'fit-content', padding: '5px 14px', borderRadius: '18px', background: '#eaf1ff', color: '#3478f6', fontWeight: 700, textTransform: 'capitalize' }}>{selectedUser.role}</span></div>
                
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {selectedUser.aadhaar_doc && (
                    <a href={selectedUser.aadhaar_doc} target="_blank" rel="noreferrer" style={{ padding: '9px 14px', background: '#eaf1ff', borderRadius: '8px', textDecoration: 'none', color: '#3478f6', fontSize: '13px', fontWeight: 700 }}>View Aadhaar Doc</a>
                  )}
                  {selectedUser.pan_card && (
                    <a href={selectedUser.pan_card} target="_blank" rel="noreferrer" style={{ padding: '9px 14px', background: '#eaf1ff', borderRadius: '8px', textDecoration: 'none', color: '#3478f6', fontSize: '13px', fontWeight: 700 }}>View PAN Card</a>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              {selectedUser.role !== 'admin' && (
                <button onClick={() => { setSelectedUser(null); openEditUserModal(selectedUser); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <Edit size={18} /> Edit User
                </button>
              )}
              {!selectedUser.admin_verified ? (
                <button onClick={() => handleVerifyUser(selectedUser.id, 'verify')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <CheckCircle size={18} /> Verify User
                </button>
              ) : (
                <button onClick={() => handleVerifyUser(selectedUser.id, 'unverify')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <XCircle size={18} /> Unverify User
                </button>
              )}
              <button onClick={() => setSelectedUser(null)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Edit User</h3>
              <button onClick={() => setShowEditUserModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <form onSubmit={handleEditUserSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input value={editUserForm.name} maxLength={100} onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})} placeholder="Name" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
              <input type="email" value={editUserForm.email} maxLength={254} onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})} placeholder="Email" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
              <input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit Indian mobile number" value={editUserForm.phone} onChange={(e) => setEditUserForm({...editUserForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} placeholder="10-digit phone (optional)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
              <select value={editUserForm.role} onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', outline: 'none' }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <button type="submit" disabled={userLoading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}>
                {userLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderBookings = () => {
    const filteredBookings = bookingsList.filter(b => {
      const matchesSearch = 
        (b.user_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.user_email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.bike_name || '').toLowerCase().includes(bookingSearch.toLowerCase());
      
      const matchesFilter = bookingFilter === 'All' || b.status === bookingFilter;
      
      return matchesSearch && matchesFilter;
    });

    return (
    <div className="dash-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0 }}>All Bookings</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input 
              type="text" 
              maxLength={100}
              placeholder="Search name, email, bike..." 
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }} 
            />
          </div>
          <select 
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#64748b', outline: 'none' }}
          >
            <option value="All">All Status</option>
            <option value="Booked">Booked</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      
      <table className="dash-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Bike</th>
            <th>Book Date</th>
            <th>Return Date</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map(b => (
            <tr key={b.id}>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{b.user_name}</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{b.user_email}</span>
                </div>
              </td>
              <td>{b.bike_name}</td>
              <td>{b.booking_date}</td>
              <td>{b.return_date || 'N/A'}</td>
              <td><strong>₹{b.total_price}</strong></td>
              <td>
                <span className={`status-badge status-${b.status.toLowerCase()}`}>
                  {b.status}
                </span>
              </td>
              <td>
                <button className="dash-action-btn" onClick={() => handleCancelBooking(b.id)} title="Cancel Booking">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )};

  const renderBikes = () => {
    const filteredBikes = fleetBikes.filter(bike => {
      if (bikeFilter === 'Available') return bike.availability === 'Available';
      if (bikeFilter === 'Booked') return bike.availability !== 'Available';
      return true;
    });

    return (
      <div className="dash-table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setBikeFilter('All')} style={{ background: bikeFilter === 'All' ? '#3b82f6' : '#f1f5f9', color: bikeFilter === 'All' ? '#fff' : '#334155', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>All Bikes</button>
            <button onClick={() => setBikeFilter('Available')} style={{ background: bikeFilter === 'Available' ? '#10b981' : '#f1f5f9', color: bikeFilter === 'Available' ? '#fff' : '#334155', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Available</button>
            <button onClick={() => setBikeFilter('Booked')} style={{ background: bikeFilter === 'Booked' ? '#ef4444' : '#f1f5f9', color: bikeFilter === 'Booked' ? '#fff' : '#334155', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Booked</button>
          </div>
          <button onClick={openAddModal} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bike size={16} /> Add New Bike
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBikes.map(bike => (
            <div key={bike.id} onClick={() => setSelectedViewBike(bike)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', ':hover': { borderColor: '#cbd5e1', transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <BikeImage src={bike.image_url} alt={bike.bike_name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{bike.bike_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{bike.brand} • <span style={{ color: bike.availability === 'Available' ? '#10b981' : '#ef4444', fontWeight: '600' }}>{bike.availability === 'Available' ? 'Available' : 'Booked'}</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={(e) => { e.stopPropagation(); openEditModal(bike); }} style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteBike(bike.id); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
          {filteredBikes.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>No bikes found.</p>}
        </div>

        {showAddBikeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>{editBikeId ? 'Edit Bike Details' : 'Add New Bike'}</h3>
                <button onClick={() => { setShowAddBikeModal(false); setEditBikeId(null); }} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              
              <form onSubmit={handleAddBike} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input name="bike_name" maxLength={100} value={bikeForm.bike_name} onChange={handleBikeChange} placeholder="Bike Name" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="brand" maxLength={80} value={bikeForm.brand} onChange={handleBikeChange} placeholder="Brand" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                  <input name="model" maxLength={40} value={bikeForm.model} onChange={handleBikeChange} placeholder="Model" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="price_per_day" type="number" min={1} max={1000000} step={1} value={bikeForm.price_per_day} onChange={handleBikeChange} placeholder="Price Per Day" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                  <select name="availability" value={bikeForm.availability} onChange={handleBikeChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', outline: 'none' }}>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Booked/Unavailable</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="engine" maxLength={40} value={bikeForm.engine} onChange={handleBikeChange} placeholder="Engine (e.g. 350cc)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                  <input name="torque" maxLength={40} value={bikeForm.torque} onChange={handleBikeChange} placeholder="Torque (e.g. 28 Nm)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="mileage" maxLength={40} value={bikeForm.mileage} onChange={handleBikeChange} placeholder="Mileage (e.g. 35 kmpl)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                  <input name="fuel_tank" maxLength={40} value={bikeForm.fuel_tank} onChange={handleBikeChange} placeholder="Fuel Type/Capacity (e.g. Petrol / 13L)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <input name="plate_number" maxLength={20} value={bikeForm.plate_number} onChange={handleBikeChange} placeholder="Plate Number (e.g. MH-12-AB-1234)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Bike Image (Upload to Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleDashboardBikeImageChange}
                    disabled={uploadingBikeImage}
                    style={{ fontSize: '13px', padding: '6px 0' }}
                  />
                  {uploadingBikeImage && <span style={{ fontSize: '12px', color: '#3b82f6' }}>Uploading to Cloudinary...</span>}
                  <input name="image_url" type="url" maxLength={2048} value={bikeForm.image_url} onChange={handleBikeChange} placeholder="Image URL (auto-filled on file upload)" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
                  {bikeForm.image_url && (
                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                      <img src={bikeForm.image_url} alt="Bike Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={bikeLoading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}>
                  {bikeLoading ? (editBikeId ? 'Updating...' : 'Adding...') : (editBikeId ? 'Update Bike' : 'Save Bike to Fleet')}
                </button>
              </form>
            </div>
          </div>
        )}

        {selectedViewBike && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedViewBike(null)}>
            <div style={{ background: '#fff', padding: '0', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ position: 'relative', height: '220px' }}>
                <BikeImage src={selectedViewBike.image_url} alt={selectedViewBike.bike_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setSelectedViewBike(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>×</button>
                <div style={{ position: 'absolute', bottom: '16px', left: '24px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedViewBike.bike_name}</h2>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>{selectedViewBike.brand} {selectedViewBike.model}</p>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Daily Rate</span>
                    <strong style={{ fontSize: '20px', color: '#0f172a' }}>₹{selectedViewBike.price_per_day}</strong><span style={{ fontSize: '14px', color: '#64748b' }}>/day</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</span>
                    <span style={{ background: selectedViewBike.availability === 'Available' ? '#dcfce7' : '#fee2e2', color: selectedViewBike.availability === 'Available' ? '#16a34a' : '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{selectedViewBike.availability}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Engine</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedViewBike.engine || 'N/A'}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Torque</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedViewBike.torque || 'N/A'}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Mileage</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedViewBike.mileage || 'N/A'}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Fuel/Tank</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedViewBike.fuel_tank || 'N/A'}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>License Plate</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedViewBike.plate_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPageTitle = () => {
    switch(activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'users': return 'User Management';
      case 'bookings': return 'Booking Management';
      case 'bikes': return 'Fleet Management';
      default: return 'Dashboard';
    }
  };

  if (loading && !stats) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Administrative Console...</div>;
  }

  return (
    <div className="dash-layout">
      {/* Left Sidebar */}
      <div className="dash-sidebar">
        <div className="dash-logo">
          <Cloud color="#fff" size={28} />
          <h2>Bike Rental</h2>
        </div>
        
        <div className="dash-nav">
          <button className={`dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <Home size={18} /> Overview
          </button>
          <button className={`dash-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} /> Users
          </button>
          <button className={`dash-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <ClipboardList size={18} /> Bookings
          </button>
          <button className={`dash-nav-item ${activeTab === 'bikes' ? 'active' : ''}`} onClick={() => setActiveTab('bikes')}>
            <Bike size={18} /> Bikes
          </button>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="dash-nav-item" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dash-main">
        {/* Top Header */}
        <div className="dash-header">
          <div>
            <h1>{getPageTitle()}</h1>
            <p>Welcome back {user?.name?.split(' ')[0] || 'Admin'} 👋</p>
          </div>
          <div className="dash-profile">
            <strong>{user?.name || 'Krushna'}</strong>
            <span>Admin</span>
          </div>
        </div>

        {/* Dynamic Content based on Active Tab */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'bikes' && renderBikes()}
      </div>
    </div>
  );
};

export default DashboardPage;

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  Users,
  Camera,
  Upload,
  Image as ImageIcon,
  Pencil
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  allUsers?: User[];
  onUserCreated?: () => void;
  onUserUpdated?: (user: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  currentUser, 
  allUsers = [], 
  onUserCreated, 
  onUserUpdated 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPhotoUser, setEditingPhotoUser] = useState<User | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Employee');
  const [newDept, setNewDept] = useState('Operations & Rolling Stock');
  const [newPass, setNewPass] = useState('Employee@123');
  const [newAvatar, setNewAvatar] = useState<string>('');

  const [editAvatarVal, setEditAvatarVal] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Enhanced File Upload Helper with Canvas Auto-Resize
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setter(optimizedDataUrl);
          } else {
            setter(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-role': currentUser.role,
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          department: newDept,
          password: newPass,
          avatar: newAvatar || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: `Success: Account provisioned for ${newName} as ${newRole} (${newEmail})` });
        setNewName('');
        setNewEmail('');
        setNewAvatar('');
        setShowCreateModal(false);
        if (onUserCreated) onUserCreated();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to create user account.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Server error creating user.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (targetUserId: string, avatarDataUrl: string) => {
    if (!avatarDataUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${targetUserId}/avatar`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-role': currentUser.role,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ avatar: avatarDataUrl }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Profile photo updated successfully!' });
        setEditingPhotoUser(null);
        setEditAvatarVal('');

        // Notify parent immediately so navbar top avatar and state reflect the change instantaneously
        if (onUserUpdated) {
          const target = (allUsers || []).find((u) => u.id === targetUserId);
          if (target) {
            onUserUpdated({ ...target, avatar: avatarDataUrl });
          } else if (currentUser.id === targetUserId) {
            onUserUpdated({ ...currentUser, avatar: avatarDataUrl });
          }
        }
        if (onUserCreated) onUserCreated();
      } else {
        const d = await res.json();
        setMsg({ type: 'error', text: d.error || 'Failed to update photo.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error updating profile photo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* Header Profile Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-5 relative">
        <div className="relative group shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-teal-600/30 shadow-md"
          />
          <button
            onClick={() => {
              setEditingPhotoUser(currentUser);
              setEditAvatarVal(currentUser.avatar || '');
            }}
            className="absolute -bottom-1 -right-1 p-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg shadow-md cursor-pointer transition-all flex items-center justify-center"
            title="Change My Photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center md:text-left space-y-1 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 rounded-full uppercase">
              {currentUser.role}
            </span>
          </div>

          <p className="text-xs text-slate-500">{currentUser.email} • {currentUser.department}</p>
          <p className="text-[11px] text-slate-400">Kochi Metro Rail Limited (KMRL) Staff Portal</p>
        </div>

        <button
          onClick={() => {
            setEditingPhotoUser(currentUser);
            setEditAvatarVal(currentUser.avatar || '');
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500" />
          Update Photo
        </button>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add Employee & Staff Management Section (Admin Only) */}
      {currentUser.role === 'Admin' && (
        <div className="p-6 bg-white border border-purple-200 rounded-2xl shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Add Employee & HR Staff Section</h3>
                <p className="text-xs text-slate-500">As Admin (Sujal), you can provision HR Officers & Employees and manage their profile photos</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCreateModal(true);
                setMsg(null);
              }}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + Add Employee or HR
            </button>
          </div>

          {/* User Accounts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Staff Photo & Name</th>
                  <th className="p-3">Official Email</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Photo Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3 font-medium text-slate-700">{u.department}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        u.role === 'HR' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setEditingPhotoUser(u);
                          setEditAvatarVal(u.avatar || '');
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-700" />
                        Update Photo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Employee / HR Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-700" />
                    Add Employee or HR Staff
                  </h4>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Staff Member Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gunjan, Tanisha, or Rohan"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. employee@kmrl.in"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Assign Role *</label>
                      <select
                        value={newRole}
                        onChange={(e) => {
                          const r = e.target.value as UserRole;
                          setNewRole(r);
                          if (r === 'HR') setNewPass('HR@123');
                          else if (r === 'Admin') setNewPass('Admin@123');
                          else setNewPass('Employee@123');
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="Employee">Employee</option>
                        <option value="HR">HR Officer</option>
                        <option value="Admin">System Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department *</label>
                      <select
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="Operations & Rolling Stock">Operations & Rolling Stock</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Procurement & Contracts">Procurement & Contracts</option>
                        <option value="IT & Security Systems">IT & Security Systems</option>
                      </select>
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-purple-700" />
                      Upload Staff Profile Photo
                    </label>

                    <div className="flex items-center gap-3">
                      {newAvatar ? (
                        <img src={newAvatar} alt="Preview" className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0 font-bold">
                          Photo
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <label className="px-3 py-1.5 bg-white border border-slate-300 hover:border-purple-500 rounded-xl font-bold text-[11px] text-slate-700 flex items-center gap-1.5 cursor-pointer w-fit shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-purple-700" />
                          <span>Choose Image File...</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewAvatar)}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">Supports JPG, PNG or WebP up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
                    <input
                      type="text"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {loading ? 'Adding Employee to System...' : 'Add Employee / HR Member'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Photo Modal for Admin or Self */}
      {editingPhotoUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-700" />
                Update Profile Photo for {editingPhotoUser.name}
              </h4>
              <button
                onClick={() => {
                  setEditingPhotoUser(null);
                  setEditAvatarVal('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={editAvatarVal || editingPhotoUser.avatar}
                  alt={editingPhotoUser.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-teal-500/30 shadow-md mb-2"
                />
                <span className="font-bold text-slate-900">{editingPhotoUser.name}</span>
                <span className="text-[11px] text-slate-500">{editingPhotoUser.role} • {editingPhotoUser.email}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">1-Click Sample Photo Avatars or Upload Custom</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                  ].map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatarVal(url)}
                      className={`p-1 rounded-xl border transition-all cursor-pointer ${
                        editAvatarVal === url ? 'ring-2 ring-teal-600 border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-12 h-12 rounded-lg object-cover mx-auto" />
                    </button>
                  ))}
                </div>

                <label className="w-full p-2.5 bg-white border border-dashed border-slate-300 hover:border-teal-500 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                  <Upload className="w-4 h-4 text-teal-700" />
                  <span>Upload Photo File from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setEditAvatarVal)}
                  />
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Or Paste Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editAvatarVal}
                  onChange={(e) => setEditAvatarVal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhotoUser(null);
                    setEditAvatarVal('');
                  }}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || !editAvatarVal}
                  onClick={() => handleUpdateAvatar(editingPhotoUser.id, editAvatarVal)}
                  className="w-1/2 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving Photo...' : 'Save New Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

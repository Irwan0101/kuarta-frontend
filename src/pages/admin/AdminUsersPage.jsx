// src/pages/admin/AdminUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserX, Edit2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { useConfirm } from '@/hooks/useConfirm';
import {
    PageHeader, Card, CardHead, Btn, Badge, Input, Spinner, ErrorBox,
    Modal, FormGroup, FormRow, TableHead, EmptyRow, ORG, RED, GREEN, BLUE,
} from './adminUtils';

const ROLE_COLORS = { admin: RED, mentor: '#8B5CF6', premium: '#F59E0B', user: '#3B82F6', free: '#6b7280' };

export default function AdminUsersPage() {
    const { T } = useTheme();
    const { confirm, modal: confirmModal } = useConfirm();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [editUser, setEditUser] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user', plan: 'free' });
    const [saving, setSaving] = useState(false);
    const PER = 10;

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await adminApi.getUsers({ page, limit: PER, search });
            setUsers(res.users ?? []);
            setTotal(res.total ?? 0);
        } catch (e) { setError(e?.message || 'Gagal memuat users.'); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { load(); }, [load]);

    const handleBan = async (id) => {
        if (!(await confirm('Yakin ban user ini?'))) return;
        try { await adminApi.banUser(id); load(); }
        catch (e) { toast.error(e?.message || 'Gagal ban user.'); }
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await adminApi.updateUser(editUser.id, { name: editUser.name, role: editUser.role });
            setEditUser(null); load();
        } catch (e) { toast.error(e?.message || 'Gagal update user.'); }
        finally { setSaving(false); }
    };

    const handleCreate = async () => {
        if (!createForm.name || !createForm.email || !createForm.password) {
            toast.error('Nama, email, dan password wajib diisi');
            return;
        }
        setSaving(true);
        try {
            await adminApi.createUser(createForm);
            setCreateOpen(false);
            setCreateForm({ name: '', email: '', password: '', role: 'user', plan: 'free' });
            load();
        } catch (e) { toast.error(e?.message || 'Gagal membuat user.'); }
        finally { setSaving(false); }
    };

    const totalPages = Math.max(1, Math.ceil(total / PER));

    return (
        <div>
            <PageHeader
                title="👥 Manajemen Users"
                subtitle={`${total} pengguna terdaftar`}
            />

            <Card>
                <CardHead
                    title="Daftar Pengguna"
                    action={
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Btn size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Tambah User</Btn>
                            <div style={{ position: 'relative', width: 220 }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: .4 }} />
                                <input
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Cari nama / email..."
                                    style={{ width: '100%', padding: '8px 12px 8px 30px', fontSize: 12, borderRadius: 8, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    }
                />

                {error && <div style={{ padding: 16 }}><ErrorBox msg={error} /></div>}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <TableHead cols={['#', 'Nama', 'Email', 'Role', 'Terdaftar', { label: 'Aksi', right: true }]} />
                        <tbody>
                            {loading
                                ? <tr><td colSpan={6}><Spinner /></td></tr>
                                : users.length === 0
                                    ? <EmptyRow cols={6} msg="Tidak ada pengguna ditemukan." />
                                    : users.map((u, i) => (
                                        <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                                            <td style={{ padding: '11px 16px', fontSize: 12, color: T.text4 }}>{(page - 1) * PER + i + 1}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: ORG + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ORG, flexShrink: 0 }}>
                                                        {u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{u.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '11px 16px', fontSize: 12, color: T.text3 }}>{u.email}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <Badge label={u.role ?? 'free'} color={ROLE_COLORS[u.role] ?? '#6b7280'} />
                                            </td>
                                            <td style={{ padding: '11px 16px', fontSize: 12, color: T.text4 }}>
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                    <Btn size="sm" variant="outline" color={BLUE} onClick={() => setEditUser({ ...u })}>
                                                        <Edit2 size={12} /> Edit
                                                    </Btn>
                                                    <Btn size="sm" variant="outline" color={RED} onClick={() => handleBan(u.id)}>
                                                        <UserX size={12} /> Ban
                                                    </Btn>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: T.text4 }}>
                        Hal {page} dari {totalPages} ({total} total)
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" variant="outline" color={T.text4} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft size={13} />
                        </Btn>
                        <Btn size="sm" variant="outline" color={T.text4} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight size={13} />
                        </Btn>
                    </div>
                </div>
            </Card>

            {/* Edit modal */}
            {editUser && (
                <Modal title="Edit Pengguna" onClose={() => setEditUser(null)}>
                    <FormRow>
                        <FormGroup label="Nama">
                            <input value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', boxSizing: 'border-box' }} />
                        </FormGroup>
                        <FormGroup label="Role">
                            <select value={editUser.role ?? 'free'} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none' }}>
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </FormGroup>
                    </FormRow>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                        <Btn variant="outline" color={T.text4} onClick={() => setEditUser(null)}>Batal</Btn>
                        <Btn onClick={handleSaveEdit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
                    </div>
                </Modal>
            )}

            {/* Create modal */}
            {createOpen && (
                <Modal title="Tambah User" onClose={() => setCreateOpen(false)}>
                    <FormRow>
                        <FormGroup label="Nama">
                            <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', boxSizing: 'border-box' }} />
                        </FormGroup>
                        <FormGroup label="Email">
                            <input value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} type="email"
                                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', boxSizing: 'border-box' }} />
                        </FormGroup>
                    </FormRow>
                    <FormRow>
                        <FormGroup label="Password">
                            <input value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} type="password"
                                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', boxSizing: 'border-box' }} />
                        </FormGroup>
                        <FormGroup label="Role">
                            <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none' }}>
                                <option value="user">User</option>
                                <option value="premium">Premium</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </FormGroup>
                    </FormRow>
                    <FormGroup label="Plan">
                        <select value={createForm.plan} onChange={e => setCreateForm(f => ({ ...f, plan: e.target.value }))}
                            style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none' }}>
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="vip">VIP</option>
                        </select>
                    </FormGroup>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                        <Btn variant="outline" color={T.text4} onClick={() => setCreateOpen(false)}>Batal</Btn>
                        <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Menyimpan...' : 'Buat User'}</Btn>
                    </div>
                </Modal>
            )}
            {confirmModal}
        </div>
    );
}
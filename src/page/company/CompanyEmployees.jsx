import React, { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { getEmployees, createEmployee, updateEmployee } from '../../api/employeeAndAdminApi';
import { fetchRoles } from '../../api/rolePermissionsApi';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
];

const EditIcon = <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.915L8.5 19.68l-4 1 1-4 13.362-13.193Z" /></svg>;
const ToggleIcon = <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-8-8v8m13-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

const CompanyEmployees = () => {
  const { user } = useAuth();
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [rowToToggle, setRowToToggle] = useState(null);

  const initialFields = { name: '', email: '', phone: '', role: '', password: '', avatar: '' };
  const [modalFields, setModalFields] = useState(initialFields);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchKey, setSearchKey] = useState('name');
  const [status, setStatus] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await getEmployees({ page, limit: pageSize, search: searchText, status, company: user._id });
      const items = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setValues(items);
      setTotal(data.total || items.length);
    } catch (_) {
      setValues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, pageSize, searchText, status]);

  const loadSelectData = async () => {
    const [r] = await Promise.allSettled([
      fetchRoles({ limit: 100 }),
    ]);
    if (r.status === 'fulfilled') {
      const items = Array.isArray(r.value.data) ? r.value.data : (Array.isArray(r.value) ? r.value : []);
      setRoles(items);
    }
  };

  const handleAdd = () => {
    setEditData(null);
    setModalFields(initialFields);
    loadSelectData();
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setModalFields({
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      role: row.role?._id || row.role || '',
      password: '',
      avatar: row.avatar || '',
    });
    loadSelectData();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setModalLoading(true);
    try {
      const payload = { ...modalFields, company: user._id };
      if (editData) {
        delete payload.password;
        await updateEmployee(editData._id, payload);
      } else {
        await createEmployee(payload);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!rowToToggle) return;
    setLoading(true);
    try {
      await updateEmployee(rowToToggle._id, { status: rowToToggle.status === 1 ? 0 : 1 });
    } finally {
      setConfirmModalOpen(false);
      setRowToToggle(null);
      load();
    }
  };

  const f = (k) => (e) => setModalFields(p => ({ ...p, [k]: e.target.value }));

  const tableHeaders = [
    { key: 'avatar', label: '', type: 'avatar', nameKey: 'name' },
    { key: 'name', label: 'Name', searchable: true },
    { key: 'email', label: 'Email', searchable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role', label: 'Role',
      render: v => v?.name
        ? <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">{v.name}</span>
        : <span className="text-xs text-gray-400">—</span>
    },
    {
      key: 'status', label: 'Status', type: 'status', valueMap: { 0: 'Inactive', 1: 'Active' },
      filter: { options: statusOptions, value: status, onChange: setStatus },
    },
    { key: 'createdAt', label: 'Created', format: 'date' },
  ];

  const actions = [
    { key: 'edit', label: 'Edit', icon: EditIcon, onClick: handleEdit },
    { key: 'status', label: 'Toggle Status', icon: ToggleIcon, onClick: row => { setRowToToggle(row); setConfirmModalOpen(true); } },
  ];

  const roleOptions = roles.map(r => ({ value: r._id, label: r.name }));

  return (
    <div className="p-2">
      <PageHeader
        title="Employees"
        subtitle="Manage your team members."
        actions={
          <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm font-medium" onClick={handleAdd}>
            Add Employee
          </button>
        }
      />

      <Table
        headers={tableHeaders} values={values} total={total} page={page} pageSize={pageSize}
        searchKeys={tableHeaders.filter(h => h.searchable).map(h => h.key)}
        searchKey={searchKey} onSearchKeyChange={setSearchKey}
        searchText={searchText} onSearchTextChange={setSearchText}
        loading={loading} onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        actions={actions}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editData ? 'Edit Employee' : 'Add Employee'}
        footer={
          !modalLoading && (
            <div className="flex justify-end gap-3">
              <button type="button" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" form="employee-form" className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                {editData ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          )
        }
      >
        {modalLoading
          ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
          : (
            <form id="employee-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" name="name" placeholder="John Doe" value={modalFields.name} onChange={f('name')} required />
                <Input label="Email" name="email" type="email" placeholder="john@example.com" value={modalFields.email} onChange={f('email')} required />
                <Input label="Phone" name="phone" placeholder="+1 555 000 0000" value={modalFields.phone} onChange={f('phone')} />
                {!editData && (
                  <Input label="Password" name="password" type="password" placeholder="••••••••" value={modalFields.password} onChange={f('password')} required />
                )}
                <Input label="Role" name="role" type="select" value={modalFields.role} onChange={f('role')} options={roleOptions} required />
              </div>
              <Input label="Avatar URL" name="avatar" placeholder="https://..." value={modalFields.avatar} onChange={f('avatar')} />
            </form>
          )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setRowToToggle(null); }}
        onConfirm={handleToggleStatus}
        title="Change Status"
        message={<>Change status for <span className="font-semibold text-gray-800">"{rowToToggle?.name}"</span>?</>}
        confirmLabel="Confirm"
      />
    </div>
  );
};

export default CompanyEmployees;

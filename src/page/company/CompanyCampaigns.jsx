import React, { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { createCampaign, updateCampaign, getCampaignsByCompany } from '../../api/campigneAndLeadApi';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'Started' },
  { value: 3, label: 'Completed' },
  { value: 4, label: 'Cancelled' },
];

const STATUS_LABELS = { 1: 'Active', 2: 'Started', 3: 'Completed', 4: 'Cancelled' };
const STATUS_COLORS = {
  1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  2: 'bg-blue-100 text-blue-700 border-blue-200',
  3: 'bg-gray-100 text-gray-600 border-gray-200',
  4: 'bg-red-100 text-red-700 border-red-200',
};

const FIELD_TYPES = ['text', 'email', 'number', 'date', 'textarea', 'dropdown', 'radio', 'checkbox'];

const EditIcon = <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.915L8.5 19.68l-4 1 1-4 13.362-13.193Z" /></svg>;
const ToggleIcon = <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-8-8v8m13-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

const CompanyCampaigns = () => {
  const { user } = useAuth();
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [rowToToggle, setRowToToggle] = useState(null);

  const initialFields = { title: '', description: '', formStructure: [] };
  const [modalFields, setModalFields] = useState(initialFields);

  const emptyField = { name: '', label: '', type: 'text', isRequired: false, placeholder: '', options: '' };
  const [newField, setNewField] = useState(emptyField);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchKey, setSearchKey] = useState('title');
  const [status, setStatus] = useState('');

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaignsByCompany(user._id, { page, limit: pageSize, search: searchText, status });
      const items = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setValues(items);
      setTotal(data.total || items.length);
    } catch (_) {
      setValues([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, [page, pageSize, searchText, status]);

  const handleAddField = () => {
    if (!newField.name.trim() || !newField.label.trim()) return;
    const field = {
      name: newField.name.trim(),
      label: newField.label.trim(),
      type: newField.type,
      isRequired: newField.isRequired,
      placeholder: newField.placeholder.trim(),
      options: ['dropdown', 'radio', 'checkbox'].includes(newField.type)
        ? newField.options.split(',').map(o => o.trim()).filter(Boolean)
        : [],
    };
    setModalFields(p => ({ ...p, formStructure: [...p.formStructure, field] }));
    setNewField(emptyField);
  };

  const handleSubmit = async () => {
    setModalLoading(true);
    try {
      const payload = { ...modalFields, company: user._id };
      if (editData) {
        await updateCampaign(editData._id, payload);
      } else {
        await createCampaign(payload);
      }
      setModalOpen(false);
      loadCampaigns();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save campaign');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!rowToToggle) return;
    setLoading(true);
    try {
      await updateCampaign(rowToToggle._id, { status: rowToToggle.status === 1 ? 0 : 1 });
    } finally {
      setConfirmModalOpen(false);
      setRowToToggle(null);
      loadCampaigns();
    }
  };

  const tableHeaders = [
    { key: 'title', label: 'Title', searchable: true },
    { key: 'description', label: 'Description', render: v => <span className="text-xs text-gray-500">{v || '—'}</span> },
    {
      key: 'formStructure', label: 'Fields',
      render: v => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {Array.isArray(v) ? v.length : 0} fields
        </span>
      ),
    },
    {
      key: 'status', label: 'Status',
      filter: { options: STATUS_OPTIONS, value: status, onChange: setStatus },
      render: v => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {STATUS_LABELS[v] || v || '—'}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', format: 'date' },
  ];

  const actions = [
    {
      key: 'edit', label: 'Edit', icon: EditIcon,
      onClick: row => {
        setEditData(row);
        setModalFields({ title: row.title || '', description: row.description || '', formStructure: row.formStructure || [] });
        setNewField(emptyField);
        setModalOpen(true);
      },
    },
    { key: 'status', label: 'Toggle Status', icon: ToggleIcon, onClick: row => { setRowToToggle(row); setConfirmModalOpen(true); } },
  ];

  return (
    <div className="p-2">
      <PageHeader
        title="Campaigns"
        subtitle="Manage your lead capture campaigns."
        actions={
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm font-medium"
            onClick={() => {
              setEditData(null);
              setModalFields(initialFields);
              setNewField(emptyField);
              setModalOpen(true);
            }}
          >
            New Campaign
          </button>
        }
      />

      <Table
        headers={tableHeaders} values={values} total={total} page={page} pageSize={pageSize}
        searchKeys={['title']} searchKey={searchKey} onSearchKeyChange={setSearchKey}
        searchText={searchText} onSearchTextChange={setSearchText}
        loading={loading} onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        actions={actions}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editData ? 'Edit Campaign' : 'Create Campaign'}
        size="lg"
        footer={
          !modalLoading && (
            <div className="flex justify-end gap-3">
              <button type="button" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" form="campaign-form" className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                {editData ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          )
        }
      >
        {modalLoading
          ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
          : (
            <form id="campaign-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Campaign Title" name="title" placeholder="e.g. Q1 Lead Drive" value={modalFields.title} onChange={e => setModalFields(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <Input label="Description" name="description" type="textarea" placeholder="What is this campaign about?" value={modalFields.description} onChange={e => setModalFields(p => ({ ...p, description: e.target.value }))} />

              {/* Form Builder */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Lead Capture Form Fields</h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                  {/* New field inputs */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input label="Field Key" name="fname" placeholder="e.g. phone_number" value={newField.name} onChange={e => setNewField(p => ({ ...p, name: e.target.value }))} />
                    <Input label="Display Label" name="flabel" placeholder="e.g. Phone Number" value={newField.label} onChange={e => setNewField(p => ({ ...p, label: e.target.value }))} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Field Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={newField.type} onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}>
                        {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Input label="Placeholder" name="fplaceholder" placeholder="Optional hint" value={newField.placeholder} onChange={e => setNewField(p => ({ ...p, placeholder: e.target.value }))} />
                    {['dropdown', 'radio', 'checkbox'].includes(newField.type) && (
                      <Input label="Options (comma-separated)" name="foptions" placeholder="Yes, No, Maybe" value={newField.options} onChange={e => setNewField(p => ({ ...p, options: e.target.value }))} />
                    )}
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" id="isReq" checked={newField.isRequired} onChange={e => setNewField(p => ({ ...p, isRequired: e.target.checked }))} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <label htmlFor="isReq" className="text-sm text-gray-700 cursor-pointer select-none">Required</label>
                    </div>
                  </div>
                  <button type="button" onClick={handleAddField} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors">
                    + Add Field
                  </button>

                  {/* Field list */}
                  {modalFields.formStructure.length > 0 && (
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                      {modalFields.formStructure.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded shrink-0">{field.type}</span>
                            <span className="text-sm font-medium text-gray-800 truncate">{field.label}</span>
                            <span className="text-xs text-gray-400 hidden sm:inline truncate">{field.name}</span>
                            {field.isRequired && <span className="text-xs text-red-500 font-medium shrink-0">*</span>}
                          </div>
                          <button type="button" onClick={() => setModalFields(p => ({ ...p, formStructure: p.formStructure.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 ml-2 shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {modalFields.formStructure.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No fields added yet.</p>
                  )}
                </div>
              </div>
            </form>
          )}
      </Modal>

      {/* Confirm modal */}
      <ConfirmDialog
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setRowToToggle(null); }}
        onConfirm={handleToggleStatus}
        title="Change Status"
        message={<>Change status for <span className="font-semibold">"{rowToToggle?.title}"</span>?</>}
        confirmLabel="Confirm"
      />
    </div>
  );
};

export default CompanyCampaigns;


import React, { useEffect, useState } from 'react';

import Table from '../../components/common/Table';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from '../../api/rolePermissionsApi';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
];

const Permissions = () => {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToToggle, setRowToToggle] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [editData, setEditData] = useState(null);
  const [modalFields, setModalFields] = useState({ name: '', meta: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchKey, setSearchKey] = useState('name');
  const [status, setStatus] = useState('');

  // Form validation state
  const [touched, setTouched] = useState({ name: false, meta: false });
  const [formError, setFormError] = useState({ name: '', meta: '' });

  // Reset validation state when modal opens/closes
  useEffect(() => {
    if (modalOpen) {
      setTouched({ name: false, meta: false });
      setFormError({ name: '', meta: '' });
    }
  }, [modalOpen]);

  const getPermissions = async (params = {}) => {
    try {
      setLoading(true);
      const data = await fetchPermissions({
        page,
        pageSize,
        search: searchText,
        status,
        ...params,
      });
      // Assume API returns { data: [], total: number }
      const items = Array.isArray(data.data) ? data.data : data;
      setValues(items.map(item => ({ ...item, time: item.createdAt })));
      setTotal(data.total || items.length);
    } catch (err) {
      setError('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPermissions();
    // eslint-disable-next-line
  }, [page, pageSize, searchText, status]);

  const handleAdd = () => {
    setEditData(null);
    setModalFields({ name: '', meta: '' });
    setModalOpen(true);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setModalFields((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormError((prev) => ({ ...prev, [name]: value ? '' : 'Required' }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const newTouched = { name: true, meta: true };
    setTouched(newTouched);
    const newError = {
      name: modalFields.name ? '' : 'Required',
      meta: modalFields.meta ? '' : 'Required',
    };
    setFormError(newError);
    if (!modalFields.name || !modalFields.meta) return;

    setModalLoading(true);
    try {
      if (editData) {
        await updatePermission(editData._id, modalFields);
      } else {
        await createPermission(modalFields);
      }
      setModalOpen(false);
      getPermissions();
    } catch (e) {
      alert('Failed to save permission');
    } finally {
      setModalLoading(false);
    }
  };


  // Table row actions
  const handleRowAction = async (action, row) => {
    if (action === 'edit') {
      setEditData(row);
      setModalFields({ name: row.name || '', meta: row.meta || '' });
      setModalOpen(true);
    } else if (action === 'delete') {
      setRowToDelete(row);
      setDeleteConfirmOpen(true);
    } else if (action === 'status') {
      setLoading(true);
      await updatePermission(row._id, { status: row.status === 1 ? 0 : 1 });
      getPermissions();
    }
  };

  // Table headers with filter for status and searchable keys
  const tableHeaders = [
    { key: 'name', label: 'Name', searchable: true },
    { key: 'meta', label: 'Meta', searchable: true },
    {
      key: 'status',
      label: 'Status',
      filter: {
        options: statusOptions,
        value: status,
        onChange: setStatus,
      },
      searchable: true,
      type: 'status', // use built-in status renderer
      valueMap: { 0: 'Inactive', 1: 'Active' },
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value) => (
        <span style={{ color: '#059669' }}>{new Date(value).toLocaleString()}</span>
      ),
    },
  ];

  // Action icons
  const EditIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.915L8.5 19.68l-4 1 1-4 13.362-13.193Z" />
    </svg>
  );
  const DeleteIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <path stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a3 3 0 0 1 6 0v2m-9 0v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
    </svg>
  );
  const actions = [
    {
      key: 'edit',
      label: 'Edit',
      icon: EditIcon,
      onClick: row => handleRowAction('edit', row),
    },
    {
      key: 'status',
      label: 'Toggle Status',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-8-8v8m13-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      onClick: row => {
        setRowToToggle(row);
        setConfirmModalOpen(true);
      },
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: DeleteIcon,
      variant: 'danger',
      onClick: row => handleRowAction('delete', row),
    }
  ];

  const handleConfirmToggle = () => {
    if (rowToToggle) {
      handleRowAction('status', rowToToggle);
    }
    setConfirmModalOpen(false);
    setRowToToggle(null);
  };

  const handleCancelToggle = () => {
    setConfirmModalOpen(false);
    setRowToToggle(null);
  };

  const handleConfirmDelete = async () => {
    if (rowToDelete) {
      setLoading(true);
      await deletePermission(rowToDelete._id);
      getPermissions();
    }
    setDeleteConfirmOpen(false);
    setRowToDelete(null);
  };


  return (
    <div className="p-2">
      <PageHeader
        title="Permissions"
        actions={<button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium cursor-pointer" onClick={handleAdd}>Add Permission</button>}
      />
      <Table
        headers={tableHeaders}
        values={values}
        total={total}
        page={page}
        pageSize={pageSize}
        searchKeys={tableHeaders.filter(h => h.searchable).map(h => h.key)}
        searchKey={searchKey}
        onSearchKeyChange={setSearchKey}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        actions={actions}
        onRowAction={handleRowAction}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editData ? 'Edit Permission' : 'Add New Permission'}
        footer={
          !modalLoading && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all cursor-pointer"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="permission-form"
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition-all shadow-sm cursor-pointer"
              >
                {editData ? 'Save Changes' : 'Create Permission'}
              </button>
            </div>
          )
        }
      >
        {modalLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : (
          <form id="permission-form" onSubmit={handleModalSubmit} className="space-y-2">
            <Input
              label="Permission Name"
              name="name"
              placeholder="e.g. read_users"
              value={modalFields.name || ''}
              onChange={handleFieldChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              error={touched.name && formError.name ? formError.name : ''}
              required
            />
            <Input
              label="Meta Description"
              name="meta"
              type="textarea"
              placeholder="Describe what this permission allows..."
              value={modalFields.meta || ''}
              onChange={handleFieldChange}
              onBlur={() => setTouched((prev) => ({ ...prev, meta: true }))}
              error={touched.meta && formError.meta ? formError.meta : ''}
              required
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmModalOpen}
        onClose={handleCancelToggle}
        onConfirm={handleConfirmToggle}
        title="Change Status"
        message={<>Are you sure you want to change the status for <span className="font-semibold text-gray-800">"{rowToToggle?.name}"</span>?</>}
        confirmLabel="Confirm Update"
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setRowToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Permission"
        message={<>Are you sure you want to delete <span className="font-semibold text-gray-800">"{rowToDelete?.name}"</span>? This action cannot be undone.</>}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Permissions;

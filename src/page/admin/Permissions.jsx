
import React, { useEffect, useState } from 'react';

import Table from '../../components/common/Table';
import Model from '../../components/common/Model';
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
  const [rowToToggle, setRowToToggle] = useState(null);
  const [editData, setEditData] = useState(null);
  const [modalFields, setModalFields] = useState({ name: '', meta: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchKey, setSearchKey] = useState('name');
  const [status, setStatus] = useState('');


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

  // Add/edit both name and meta fields using modal
  const handleModalSubmit = async (fields) => {
    setModalLoading(true);
    try {
      if (editData) {
        await updatePermission(editData._id, fields);
      } else {
        await createPermission(fields);
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
      if (window.confirm('Are you sure you want to delete this permission?')) {
        setLoading(true);
        await deletePermission(row._id);
        getPermissions();
      }
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


  return (
    <div className="p-2">
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          onClick={handleAdd}
        >
          Add Permission
        </button>
      </div>
      <Table
        // title="Permissions"
        // subtitle="Manage permissions for your team"
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
      <Model
        open={modalOpen}
        loading={modalLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        fields={modalFields}
        setFields={setModalFields}
        editData={editData}
      />

      {/* Custom Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl outline-none overflow-hidden max-w-md w-full p-6 text-center transform transition-all">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-8-8v8m13-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold leading-6 text-gray-900 mb-2">Change Status</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to change the status for <span className="font-semibold text-gray-800">"{rowToToggle?.name}"</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                onClick={handleCancelToggle}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm sm:w-auto transition-colors bg-emerald-600 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                onClick={handleConfirmToggle}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;

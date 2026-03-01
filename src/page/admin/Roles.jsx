import React, { useEffect, useState } from 'react';

import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import {
  fetchRoles,
  createRole,
  updateRole,
  fetchPermissions,
} from '../../api/rolePermissionsApi';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
];

const Roles = () => {
  const [values, setValues] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [editData, setEditData] = useState(null);
  const [rowToToggle, setRowToToggle] = useState(null);
  const [modalFields, setModalFields] = useState({ name: '', permissions: [] });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchKey, setSearchKey] = useState('name');
  const [status, setStatus] = useState('');

  // 1. Fetch available permissions for the Multiselect dropdown
  const loadPermissions = async () => {
    try {
      // Fetch all permissions (you might need to adjust pagination to get all if there are many)
      const data = await fetchPermissions({ page: 1, pageSize: 100, status: 1 });
      const items = Array.isArray(data.data) ? data.data : data;
      // Map them into the format our Multiselect logic supports: { label, value }
      const formattedOptions = items.map(p => ({
        label: p.name,
        value: p._id
      }));
      setPermissionsList(formattedOptions);
    } catch (err) {
      console.error('Failed to load permissions list:', err);
    }
  };

  // 2. Fetch the Roles table data
  const getRoles = async (params = {}) => {
    try {
      setLoading(true);
      const data = await fetchRoles({
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
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    getRoles();
    // eslint-disable-next-line
  }, [page, pageSize, searchText, status]);

  const handleAdd = () => {
    setEditData(null);
    setModalFields({ name: '', permissions: [] });
    setModalOpen(true);
  };

  const handleModalSubmit = async (fields) => {
    setModalLoading(true);
    try {
      if (editData) {
        await updateRole(editData._id, fields);
      } else {
        await createRole(fields);
      }
      setModalOpen(false);
      getRoles();
    } catch (e) {
      alert('Failed to save role');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRowAction = async (action, row) => {
    if (action === 'edit') {
      setEditData(row);
      // Ensure permissions is map to an array of Object IDs for the multiselect
      const selectedPerms = row.permissions
        ? row.permissions.map(p => typeof p === 'object' ? p._id : p)
        : [];
      setModalFields({ name: row.name || '', permissions: selectedPerms });
      setModalOpen(true);
    } else if (action === 'status') {
      setLoading(true);
      await updateRole(row._id, { status: row.status === 1 ? 0 : 1 });
      getRoles();
    }
  };

  const handleConfirmToggle = () => {
    if (rowToToggle) handleRowAction('status', rowToToggle);
    setConfirmModalOpen(false);
    setRowToToggle(null);
  };

  const handleCancelToggle = () => {
    setConfirmModalOpen(false);
    setRowToToggle(null);
  };

  const tableHeaders = [
    { key: 'name', label: 'Role Name', searchable: true },
    {
      key: 'permissions',
      label: 'Permissions Count',
      render: (perms) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {Array.isArray(perms) ? perms.length : 0} Assigned
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      filter: {
        options: statusOptions,
        value: status,
        onChange: setStatus,
      },
      searchable: true,
      type: 'status',
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

  const EditIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.915L8.5 19.68l-4 1 1-4 13.362-13.193Z" />
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

  return (
    <div className="p-2">
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
          onClick={handleAdd}
        >
          Add Role
        </button>
      </div>

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
      />

      {/* Reusing Your Modal Component BUT wrapping our inputs manually to bypass it's strict generic structure if needed.
          Wait, Model accepts fields, setFields, and onSubmit out of the box. We will modify Model.jsx momentarily 
          to support more dynamic children OR just render our own Inputs inside Roles for full control. 
          Actually, let's keep it simple: We will pass a prop to Model to render children, or adjust Model to accept an array of config.
          For this instruction, we will just conditionally render our exact UI inside a custom duplicate modal for Roles OR update Model. */}

      {/* We will just create a dedicated modal here specifically for roles using our brand new Input since Model.jsx has hardcoded "name" and "meta". */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-800">
                {editData ? 'Edit Role' : 'Add New Role'}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2 focus:outline-none"
                onClick={() => setModalOpen(false)}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="text-emerald-600">Loading...</span>
                </div>
              ) : (
                <>
                  <form id="role-form" onSubmit={(e) => { e.preventDefault(); handleModalSubmit(modalFields); }} className="space-y-4">
                    <Input
                      label="Role Name"
                      name="name"
                      placeholder="e.g. Support Admin"
                      value={modalFields.name}
                      onChange={(e) => setModalFields({ ...modalFields, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Assign Permissions"
                      name="permissions"
                      type="multiselect"
                      placeholder="Select permissions..."
                      options={permissionsList}
                      value={modalFields.permissions}
                      onChange={(e) => setModalFields({ ...modalFields, permissions: e.target.value })}
                    />
                  </form>
                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="role-form"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition-all shadow-sm"
                    >
                      {editData ? 'Save Changes' : 'Create Role'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

export default Roles;

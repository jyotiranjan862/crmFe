import React, { useEffect, useState } from 'react';

import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import {
  fetchCompanies,
  createCompany,
  updateCompany,
} from '../../api/companyAndPackageApi';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
];

const VerifiedBadge = ({ isVerified }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {isVerified ? (
        <>
          <svg className="w-3 h-3 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </>
      ) : (
        'Unverified'
      )}
    </span>
  );
};

const Companies = () => {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [editData, setEditData] = useState(null);
  const [rowToToggle, setRowToToggle] = useState(null);

  const initialFields = {
    name: '', email: '', address: '', phone: '', logo: '',
    instagram: '', facebook: '', twitter: '', linkedin: '',
    isVerified: false
  };
  const [modalFields, setModalFields] = useState(initialFields);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchKey, setSearchKey] = useState('name');
  const [status, setStatus] = useState('');

  const getCompanies = async (params = {}) => {
    try {
      setLoading(true);
      const data = await fetchCompanies({
        page,
        pageSize,
        search: searchText,
        status,
        ...params,
      });
      const items = Array.isArray(data.data) ? data.data : data;
      setValues(items.map(item => ({ ...item, time: item.createdAt })));
      setTotal(data.total || items.length);
    } catch (err) {
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanies();
    // eslint-disable-next-line
  }, [page, pageSize, searchText, status]);

  const handleAdd = () => {
    setEditData(null);
    setModalFields(initialFields);
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    setModalLoading(true);
    try {
      if (editData) {
        await updateCompany(editData._id, modalFields);
      } else {
        await createCompany(modalFields);
      }
      setModalOpen(false);
      getCompanies();
    } catch (e) {
      alert('Failed to save company information');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRowAction = async (action, row) => {
    if (action === 'edit') {
      setEditData(row);
      setModalFields({
        name: row.name || '',
        email: row.email || '',
        address: row.address || '',
        phone: row.phone || '',
        logo: row.logo || '',
        instagram: row.instagram || '',
        facebook: row.facebook || '',
        twitter: row.twitter || '',
        linkedin: row.linkedin || '',
        isVerified: row.isVerified || false
      });
      setModalOpen(true);
    } else if (action === 'status') {
      setLoading(true);
      await updateCompany(row._id, { status: row.status === 1 ? 0 : 1 });
      getCompanies();
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
    { key: 'logo', label: '', type: 'image' }, // Visual only Column
    { key: 'name', label: 'Company Name', searchable: true },
    { key: 'email', label: 'Email', searchable: true },
    { key: 'phone', label: 'Phone', searchable: true },
    {
      key: 'isVerified',
      label: 'Verification',
      render: (isVerified) => <VerifiedBadge isVerified={isVerified} />
    },
    {
      key: 'status',
      label: 'Status',
      filter: {
        options: statusOptions,
        value: status,
        onChange: setStatus,
      },
      searchable: false,
      type: 'status',
      valueMap: { 0: 'Inactive', 1: 'Active' },
    },
    {
      key: 'createdAt',
      label: 'Added On',
      format: 'date'
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
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Companies directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage onboarded companies and verify profiles.</p>
        </div>
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          onClick={handleAdd}
        >
          Add Company
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

      {/* Add / Edit Company Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h2 className="text-xl font-bold text-gray-800">
                {editData ? 'Edit Company Profile' : 'Register New Company'}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-700 transition-colors bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-2 focus:outline-none"
                onClick={() => setModalOpen(false)}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <form id="company-form" onSubmit={(e) => { e.preventDefault(); handleModalSubmit(); }} className="space-y-6">

                  {/* Profile Registration */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Core Identity</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1">
                        <Input
                          label="Company Logo URL"
                          name="logo"
                          type="image" // Use our visual image preview fallback if string given
                          value={modalFields.logo}
                          onChange={(e) => setModalFields({ ...modalFields, logo: e.target.value })}
                        />
                      </div>
                      <div className="lg:col-span-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Company Name"
                            name="name"
                            placeholder="e.g. Acme Corp"
                            value={modalFields.name}
                            onChange={(e) => setModalFields({ ...modalFields, name: e.target.value })}
                            required
                          />
                          <Input
                            label="Contact Email"
                            name="email"
                            type="email"
                            placeholder="admin@acme.com"
                            value={modalFields.email}
                            onChange={(e) => setModalFields({ ...modalFields, email: e.target.value.toLowerCase() })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Phone Number"
                            name="phone"
                            placeholder="+1 (555) 000-0000"
                            value={modalFields.phone}
                            onChange={(e) => setModalFields({ ...modalFields, phone: e.target.value })}
                          />
                          <div className="flex items-center h-full pt-6">
                            <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                <input type="checkbox" className="sr-only" checked={modalFields.isVerified} onChange={(e) => setModalFields({ ...modalFields, isVerified: e.target.checked })} />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${modalFields.isVerified ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${modalFields.isVerified ? 'transform translate-x-6' : ''}`}></div>
                              </div>
                              <div className="ml-3 font-medium text-sm text-gray-700">Account Verified</div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Physical Address"
                      name="address"
                      type="textarea"
                      placeholder="123 Corporate Blvd, Suite 400..."
                      value={modalFields.address}
                      onChange={(e) => setModalFields({ ...modalFields, address: e.target.value })}
                    />
                  </div>

                  {/* Social Profiles */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Social Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <Input
                        label="LinkedIn URL"
                        name="linkedin"
                        placeholder="linkedin.com/company/acme"
                        value={modalFields.linkedin}
                        onChange={(e) => setModalFields({ ...modalFields, linkedin: e.target.value })}
                        className="mb-0"
                      />
                      <Input
                        label="Twitter / X"
                        name="twitter"
                        placeholder="twitter.com/acme"
                        value={modalFields.twitter}
                        onChange={(e) => setModalFields({ ...modalFields, twitter: e.target.value })}
                        className="mb-0"
                      />
                      <Input
                        label="Instagram"
                        name="instagram"
                        placeholder="instagram.com/acme"
                        value={modalFields.instagram}
                        onChange={(e) => setModalFields({ ...modalFields, instagram: e.target.value })}
                        className="mb-0"
                      />
                      <Input
                        label="Facebook"
                        name="facebook"
                        placeholder="facebook.com/acme"
                        value={modalFields.facebook}
                        onChange={(e) => setModalFields({ ...modalFields, facebook: e.target.value })}
                        className="mb-0"
                      />
                    </div>
                  </div>

                </form>
              )}
            </div>

            {!modalLoading && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                <button
                  type="button"
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="company-form"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition-all shadow-sm"
                >
                  {editData ? 'Save Changes' : 'Register Company'}
                </button>
              </div>
            )}
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

export default Companies;

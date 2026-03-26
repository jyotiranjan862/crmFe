import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { getEmployees } from '../../api/employeeAndAdminApi';
import { getCampaignsByCompany, getLeads, getClients } from '../../api/campigneAndLeadApi';

const STATUS_COLORS = {
  created: 'bg-blue-100 text-blue-700',
  not_responsed: 'bg-yellow-100 text-yellow-700',
  not_intrested: 'bg-red-100 text-red-700',
  intrested_but_later: 'bg-orange-100 text-orange-700',
  intrested: 'bg-green-100 text-green-700',
  coustomer: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS = {
  created: 'Created',
  not_responsed: 'No Response',
  not_intrested: 'Not Interested',
  intrested_but_later: 'Later',
  intrested: 'Interested',
  coustomer: 'Customer',
  lost: 'Lost',
};

const StatCard = ({ label, value, icon, bgColor, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
    <div className={`p-3 rounded-xl shrink-0 ${bgColor}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {loading
        ? <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mt-1" />
        : <p className="text-3xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
      }
    </div>
  </div>
);

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [empRes, campRes, leadRes, clientRes] = await Promise.allSettled([
          getEmployees({ company: user._id, page: 1, limit: 1 }),
          getCampaignsByCompany(user._id, { page: 1, limit: 1 }),
          getLeads({ company: user._id, page: 1, limit: 5 }),
          getClients({ company: user._id, page: 1, limit: 1 }),
        ]);
        setStats({
          employees: empRes.status === 'fulfilled' ? (empRes.value.total ?? empRes.value.data?.length ?? 0) : '—',
          campaigns: campRes.status === 'fulfilled' ? (campRes.value.total ?? campRes.value.data?.length ?? 0) : '—',
          leads: leadRes.status === 'fulfilled' ? (leadRes.value.total ?? leadRes.value.data?.length ?? 0) : '—',
          customers: clientRes.status === 'fulfilled' ? (clientRes.value.total ?? clientRes.value.data?.length ?? 0) : '—',
        });
        if (leadRes.status === 'fulfilled') {
          const items = Array.isArray(leadRes.value.data) ? leadRes.value.data : (Array.isArray(leadRes.value) ? leadRes.value : []);
          setRecentLeads(items.slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id]);

  const cards = [
    {
      label: 'Total Employees', value: stats.employees, bgColor: 'bg-blue-50',
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      label: 'Active Campaigns', value: stats.campaigns, bgColor: 'bg-yellow-50',
      icon: <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>,
    },
    {
      label: 'Total Leads', value: stats.leads, bgColor: 'bg-purple-50',
      icon: <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    },
    {
      label: 'Converted Customers', value: stats.customers, bgColor: 'bg-emerald-50',
      icon: <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
    },
  ];

  return (
    <div className="p-2">
      <PageHeader
        title="Company Dashboard"
        subtitle="Overview of your company's CRM data."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>

      {/* Recent Leads */}
      <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Leads</h2>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                <div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/3" /><div className="h-2 bg-gray-100 rounded w-1/5" /></div>
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No leads yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLeads.map(lead => {
              const name = lead.leadData?.name || lead.leadData?.email || `Lead #${lead._id?.slice(-6)}`;
              return (
                <div key={lead._id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                    {(name || 'L')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {lead.campigne?.title || '—'} · {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABELS[lead.status] || lead.status || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;

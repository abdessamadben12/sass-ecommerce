import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';
import Card from '../../../components/ui/card';
import CardDeposit from '../../../components/ui/CardDeposit';
import { getDashboardOverview } from '../../../services/ServicesAdmin/ServicesDashbord';
import { getCsrfToken } from '../../../services/ConfigueAxios';
import TransactionsReport from '../../../components/ui/charts/TransactionsChart';
import TopProductsDashboardCharts from '../../../components/ui/charts/TopProductsDashboardCharts';
import Loading from '../../../components/ui/loading';
import NotifyError from '../../../components/ui/NotifyError';

const IconRenderer = ({ iconName, size = 24, color = 'black' }) => {
  const LucideIcon = LucideIcons[iconName];
  if (!LucideIcon) return <span>Unknown icon: {iconName}</span>;
  return <LucideIcon size={size} color={color} />;
};

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState([]);
  const [deposit, setDeposit] = useState([]);
  const [withdrawal, setWithdrawal] = useState([]);
  const [viewGlobal, setViewGlobal] = useState([]);
  const [profits, setProfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getCsrfToken();
        const overview = await getDashboardOverview();
        setUserInfo(overview?.users || []);
        setDeposit(overview?.deposits || []);
        setWithdrawal(overview?.withdrawals || []);
        setViewGlobal(overview?.global || []);
        setProfits(overview?.profits || []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard overview.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of marketplace performance and activity.</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">User Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {userInfo?.map((user, key) => (
              <Card
                key={key}
                title={user.title}
                value={user.value}
                icon={<IconRenderer iconName={user.icon} size={28} color={user.colorIcon} />}
                bgColor={user.bgColor}
                borderColor={user.borderColor}
              />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Deposit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deposit?.map((item, key) => (
                <CardDeposit
                  key={key}
                  title={item.title}
                  bgColor={item.bgColor}
                  value={item.value}
                  icon={<IconRenderer size={28} iconName={item.icon} color={item.iconColor} />}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Withdrawals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {withdrawal?.map((item, key) => (
                <CardDeposit
                  key={key}
                  title={item.title}
                  value={item.value}
                  icon={<IconRenderer iconName={item.icon} color={item.iconColor} size={28} />}
                  bgColor={item.bgColor}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Global KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {viewGlobal?.map((item, key) => (
              <CardDeposit
                key={key}
                title={item.title}
                value={item.value}
                icon={<IconRenderer iconName={item.icon} color={item.colorIcon} size={28} />}
                bgColor={item.bgColor}
              />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Profit Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {profits?.map((item, key) => (
              <CardDeposit
                key={key}
                title={item.title}
                value={item.value}
                icon={<IconRenderer iconName={item.icon} color={item.iconColor} size={28} />}
                bgColor={item.bgColor}
              />
            ))}
          </div>
        </section>

        <section>
          <TransactionsReport />
        </section>

        <section>
          <TopProductsDashboardCharts />
        </section>
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </>
  );
}


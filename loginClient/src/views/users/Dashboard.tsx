import { useState, useEffect } from "react";
import type { ApiConfig } from "../../services/ApiService";
import { useApiStruct } from "../../context/ApiStructContext";
import GenericDataTable from "../../Components/GenericDataTable";
import { apiService } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setApiStruct } = useApiStruct();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Set up response structure for the data table
    setApiStruct({
      dataSrc: "data",
      limit: "meta.limit",
      skip: "meta.skip",
      total: "meta.total",
      sortBy: "meta.sortBy",
      sortOrder: "meta.sortOrder",
      searchParam: "search",
    });

    // Test the dashboard endpoint
    const testDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiService({
          url: "/users/dashboard",
          method: "GET"
        });
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    testDashboard();
  }, [navigate, setApiStruct]);

  const columns = [
    { title: "ID", dataIndex: "_id", sort: true },
    { title: "Username", dataIndex: "username", sort: true },
    { title: "Name", dataIndex: "name", sort: true },
    { title: "Email", dataIndex: "email", sort: true },
    { title: "Created At", dataIndex: "createdAt", sort: true },
  ];

  const api: ApiConfig = {
    url: "/users/dashboard",
    method: "GET",
    data: {
      limit: 10,
    },
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-glass p-6 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-secondary">Directory</p>
            <h2 className="text-lg font-semibold text-primary">User directory snapshot</h2>
            <p className="text-sm text-secondary">Search, sort and analyse the latest users pulled from the API.</p>
          </div>
        </div>
        {error ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 text-sm text-red-100 shadow-elevated">
            {error}
          </div>
        ) : (
          <div className="rounded-2xl border border-strong bg-layer">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-12 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <GenericDataTable
                serial
                columns={columns}
                api={api}
                pagination
                searchDebounce={1000}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
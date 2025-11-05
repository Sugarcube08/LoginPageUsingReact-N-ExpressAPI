import { useState, useEffect } from "react";
import type { ApiConfig } from "../../services/ApiService";
import { apiService } from "../../services/ApiService";
import PageCard from "../../components/PageCard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const navigate = useNavigate();


  const api: ApiConfig = {
    url: "/users/notebook",
    method: "GET",
  };

  // get all the notebooks for the user, from the server
  useEffect(() => {
    apiService(api)
      .then((data) => {
        console.log(data)
        setNotebooks(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "Failed to fetch notebooks");
      });
  }, []);

  const handleCreateNotebook = (name: string) => {
    if (!name) {
      setError("Notebook name cannot be empty");
      return;
    }

    setLoading(true);
    apiService({
      ...api,
      method: "POST",
      data: {
        title: name
      },
    })
      .then(() => {
        setLoading(false);
        navigate("/notebooks");
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "Failed to create notebook");
      });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <PageCard isAdd onClick={handleCreateNotebook} />
      {notebooks.map((notebook) => (
        <PageCard
          key={notebook.id}
          title={notebook.title}
          onClick={() => navigate(`/notebooks/${notebook.id}`)}
        />
      ))}
    </div>
  );
};

export default Dashboard;
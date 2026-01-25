
import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const repartition = [
  { name: "Pédagogique", tasks: 15 },
  { name: "Orientation", tasks: 10 },
  { name: "Planification", tasks: 12 },
  { name: "Financiers", tasks: 5 },
];

// barData will be created inside the component from `repartitionState` so it can be dynamic

// doughnutData will be computed inside the component so it can use dynamic values from the API

const barOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#212121',
      padding: 12,
      titleFont: { size: 13, weight: '600' },
      bodyFont: { size: 12 },
      cornerRadius: 4,
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { 
        font: { size: 11, weight: '500' },
        color: '#616161'
      }
    },
    y: {
      grid: { color: '#f5f5f5' },
      ticks: { 
        font: { size: 11 },
        color: '#757575'
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#212121',
      padding: 12,
      titleFont: { size: 13, weight: '600' },
      bodyFont: { size: 12 },
      cornerRadius: 4,
    }
  }
};

const Dashboard = () => {
  const [totalTasks, setTotalTasks] = useState(repartition.reduce((sum, r) => sum + r.tasks, 0));
  const [loadingCount, setLoadingCount] = useState(false);
  const [countError, setCountError] = useState(null);

  const [remuneratedCount, setRemuneratedCount] = useState(18);
  const [nonRemuneratedCount, setNonRemuneratedCount] = useState(24);

  const [repartitionState, setRepartitionState] = useState(repartition);

  const remuneratedPercent = (remuneratedCount + nonRemuneratedCount)
    ? Math.round((remuneratedCount / (remuneratedCount + nonRemuneratedCount)) * 100)
    : 0;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchCount() {
      setLoadingCount(true);
      setCountError(null);
      try {
        const res = await fetch("http://localhost:5000/api/tasks/count", { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && typeof data.count === 'number') {
          setTotalTasks(data.count);
        }
        if (data && typeof data.countRemuneree === 'number') {
          setRemuneratedCount(data.countRemuneree);
        }
        if (data && typeof data.countNonRemuneree === 'number') {
          setNonRemuneratedCount(data.countNonRemuneree);
        }

        // If API provides counts by type, map them into repartitionState
        if (data && data.countsByType && typeof data.countsByType === 'object') {
          const c = data.countsByType;
          const newRepartition = [
            { name: 'Pédagogique', tasks: Number(c['pédagogique'] ?? c['pedagogique'] ?? repartition[0].tasks) || 0 },
            { name: 'Orientation', tasks: Number(c['orientation'] ?? repartition[1].tasks) || 0 },
            { name: 'Planification', tasks: Number(c['planification'] ?? repartition[2].tasks) || 0 },
            { name: 'Financiers', tasks: Number(c['services_financiers'] ?? c['services-financiers'] ?? repartition[3].tasks) || 0 },
          ];
          setRepartitionState(newRepartition);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching task count:', err);
          setCountError(err.message || 'Erreur');
        }
      } finally {
        setLoadingCount(false);
      }
    }

    fetchCount();

    return () => controller.abort();
  }, []);

  const doughnutData = {
    labels: ["Rémunérées", "Non rémunérées"],
    datasets: [
      {
        data: [remuneratedCount, nonRemuneratedCount],
        backgroundColor: ["#2563eb", "#e8e8e8"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: repartitionState.map(r => r.name),
    datasets: [
      {
        label: "Tâches",
        data: repartitionState.map(r => r.tasks),
        backgroundColor: ["#2563eb", "#22c55e", "#f59e42", "#ef4444"],
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>TABLEAU DE BORD</h1>
        <p className="dashboard-subtitle">Vue d'ensemble des tâches et statistiques</p>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi">
        <div className="kpi-card">
          <div className="kpi-label">Total tâches</div>
          <div className="kpi-value">
            {loadingCount ? '...' : countError ? 'Erreur' : totalTasks}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Rémunérées</div>
          <div className="kpi-value">{loadingCount ? '...' : countError ? 'Erreur' : remuneratedCount}</div>
          <div className="kpi-percent">{remuneratedPercent}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Non rémunérées</div>
          <div className="kpi-value">{loadingCount ? '...' : countError ? 'Erreur' : nonRemuneratedCount}</div>
          <div className="kpi-percent">{100 - remuneratedPercent}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Spécialités</div>
          <div className="kpi-value">{repartitionState.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Répartition des tâches</h2>
            <span className="chart-subtitle">Par spécialité</span>
          </div>
          <div className="chart-content">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Tâches rémunérées</h2>
            <span className="chart-subtitle">Distribution globale</span>
          </div>
          <div className="chart-content">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="dashboard-summary">
        <h2>Détail par spécialité</h2>
        <table className="summary-table">
          <thead>
            <tr>
              <th>SPÉCIALITÉ</th>
              <th>NOMBRE DE TÂCHES</th>
              <th>POURCENTAGE</th>
            </tr>
          </thead>
          <tbody>
            {repartitionState.map((item) => {
              const percentage = totalTasks ? Math.round((item.tasks / totalTasks) * 100) : 0;
              return (
                <tr key={item.name}>
                  <td className="specialty-name">{item.name}</td>
                  <td className="task-count">{item.tasks}</td>
                  <td>
                    <div className="percentage-bar">
                      <div 
                        className="percentage-fill"
                        style={{ '--percentage': `${percentage}%` }}
                      />
                      <span className="percentage-text">
                        {percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default Dashboard;

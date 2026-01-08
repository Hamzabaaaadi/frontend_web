
import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const repartition = [
  { name: "Pédagogique", tasks: 15 },
  { name: "Orientation", tasks: 10 },
  { name: "Planification", tasks: 12 },
  { name: "Financiers", tasks: 5 },
];

const barData = {
  labels: repartition.map(r => r.name),
  datasets: [
    {
      label: "Tâches",
      data: repartition.map(r => r.tasks),
      backgroundColor: ["#2563eb", "#22c55e", "#f59e42", "#ef4444"],
      borderRadius: 4,
    },
  ],
};

const doughnutData = {
  labels: ["Rémunérées", "Non rémunérées"],
  datasets: [
    {
      data: [18, 24],
      backgroundColor: ["#2563eb", "#e8e8e8"],
      borderWidth: 0,
    },
  ],
};

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
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        font: { size: 12, weight: '500' },
        color: '#424242',
        usePointStyle: true,
        pointStyle: 'rect',
      }
    },
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
  const totalTasks = repartition.reduce((sum, r) => sum + r.tasks, 0);
  const remunerated = 18;
  const notRemunerated = 24;
  const remuneratedPercent = Math.round((remunerated / (remunerated + notRemunerated)) * 100);

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
          <div className="kpi-value">{totalTasks}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Rémunérées</div>
          <div className="kpi-value">{remunerated}</div>
          <div className="kpi-percent">{remuneratedPercent}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Non rémunérées</div>
          <div className="kpi-value">{notRemunerated}</div>
          <div className="kpi-percent">{100 - remuneratedPercent}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Spécialités</div>
          <div className="kpi-value">{repartition.length}</div>
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
            {repartition.map((item) => {
              const percentage = Math.round((item.tasks / totalTasks) * 100);
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

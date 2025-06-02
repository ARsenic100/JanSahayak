import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: function(context) {
          return `Issues: ${context.raw}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        precision: 0,
        color: '#64748b',
      },
      suggestedMax: function(context) {
        const max = context.chart.data.datasets[0].data.reduce((a, b) => Math.max(a, b), 0);
        return Math.ceil(max * 1.2); // Add 20% padding to the top
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
        font: {
          weight: '500'
        }
      }
    }
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart'
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  layout: {
    padding: {
      bottom: 10
    }
  }
};

export default function BarChart({ data }) {
  return (
    <div className="w-full h-[580px]">
      <Bar data={data} options={options} />
    </div>
  );
} 
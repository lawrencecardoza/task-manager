import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { taskService } from "../services/api";

Chart.register(
  ArcElement,
  DoughnutController,
  BarElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

const cardStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
  borderRadius: "16px",
  padding: "20px",
};

const canvasWrapStyle = {
  position: "relative",
  height: "260px",
};

const buildLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
};

const DashboardCharts = () => {
  const [tasks, setTasks] = useState([]);

  const doughnutRef = useRef(null);
  const barRef = useRef(null);
  const lineRef = useRef(null);

  const doughnutInstance = useRef(null);
  const barInstance = useRef(null);
  const lineInstance = useRef(null);

  const destroyCharts = () => {
    if (doughnutInstance.current) {
      doughnutInstance.current.destroy();
      doughnutInstance.current = null;
    }
    if (barInstance.current) {
      barInstance.current.destroy();
      barInstance.current = null;
    }
    if (lineInstance.current) {
      lineInstance.current.destroy();
      lineInstance.current = null;
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getAll();
        setTasks(data);
      } catch (err) {
        console.error("Failed to load dashboard chart data:", err);
      }
    };

    fetchTasks();
  }, []);

  const chartData = useMemo(() => {
    const statusCounts = { todo: 0, inProgress: 0, done: 0 };
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    const dayBuckets = buildLast7Days().map((date) => ({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString([], { weekday: "short" }),
      count: 0,
    }));

    const bucketMap = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]));

    tasks.forEach((task) => {
      if (task.status === "Completed") statusCounts.done += 1;
      else if (task.status === "In Progress") statusCounts.inProgress += 1;
      else statusCounts.todo += 1;

      if (task.priority === "High") priorityCounts.high += 1;
      else if (task.priority === "Low") priorityCounts.low += 1;
      else priorityCounts.medium += 1;

      if (task.status === "Completed" && task.created_at) {
        const dateKey = new Date(task.created_at).toISOString().slice(0, 10);
        const bucket = bucketMap.get(dateKey);
        if (bucket) bucket.count += 1;
      }
    });

    return {
      status: statusCounts,
      priority: priorityCounts,
      completionTrend: dayBuckets,
    };
  }, [tasks]);

  useEffect(() => {
    if (!doughnutRef.current || !barRef.current || !lineRef.current) {
      return undefined;
    }

    destroyCharts();

    doughnutInstance.current = new Chart(doughnutRef.current, {
      type: "doughnut",
      data: {
        labels: ["To Do", "In Progress", "Done"],
        datasets: [
          {
            data: [chartData.status.todo, chartData.status.inProgress, chartData.status.done],
            backgroundColor: ["#64748b", "#0b6bff", "#14ae5c"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });

    barInstance.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            label: "Tasks",
            data: [chartData.priority.high, chartData.priority.medium, chartData.priority.low],
            backgroundColor: ["#e5484d", "#f59e0b", "#0ea5e9"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    lineInstance.current = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: chartData.completionTrend.map((item) => item.label),
        datasets: [
          {
            label: "Completed tasks",
            data: chartData.completionTrend.map((item) => item.count),
            borderColor: "#14ae5c",
            backgroundColor: "rgba(20, 174, 92, 0.2)",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: "bottom" } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    return () => {
      destroyCharts();
    };
  }, [chartData]);

  return (
    <section style={{ marginBottom: "80px" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "24px" }}>Insights</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "12px", fontSize: "1rem" }}>Task Status</h3>
          <div style={canvasWrapStyle}>
            <canvas ref={doughnutRef} />
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "12px", fontSize: "1rem" }}>Task Priority</h3>
          <div style={canvasWrapStyle}>
            <canvas ref={barRef} />
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "12px", fontSize: "1rem" }}>Completed Last 7 Days</h3>
          <div style={canvasWrapStyle}>
            <canvas ref={lineRef} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardCharts;

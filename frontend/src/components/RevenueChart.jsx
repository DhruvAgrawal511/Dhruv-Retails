import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
        <h3>Orders by Date</h3>
        <p style={{ textAlign: "center", color: "#999" }}>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Orders by Date</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="date" style={{ fontSize: 12 }} />
          <YAxis style={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px' }}
            formatter={(value) => `₹${value.toFixed(2)}`}
          />
          <Line 
            type="monotone" 
            dataKey="totalRevenue" 
            stroke="#667eea" 
            strokeWidth={2}
            dot={{ fill: '#667eea', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

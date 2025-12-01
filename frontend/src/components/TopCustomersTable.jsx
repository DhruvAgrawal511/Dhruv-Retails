import "./TopCustomersTable.css";

export default function TopCustomersTable({ customers }) {
  if (!customers || customers.length === 0) {
    return <p style={{ textAlign: "center", color: "#999" }}>No customer data available</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total Spend</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={i}>
              <td className="name-cell">{c.name || "Unknown"}</td>
              <td className="email-cell">{c.email || "-"}</td>
              <td className="spend-cell">₹{Number(c.totalSpend).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="order-cell">{c.orderCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

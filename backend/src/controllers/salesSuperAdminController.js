import { db } from "../config/db.js";

/*
  Controller: salesSuperAdminController

  Purpose: Provide KPI values for SuperAdmin dashboards.

  Tables used (please confirm these exist in your schema):
  - `transactions` (required): expected columns -> `total_amount` (DECIMAL/NUMERIC), `status` (VARCHAR), `created_at` (DATETIME/TIMESTAMP), `branch_id` (INT)
  - `branches` (optional): for branch metadata if needed (`id`, `name`)
  - `transaction_items` (optional): for item-level KPIs (not used here)

  Endpoint: GET /api/sales-superadmin/kpis
  Query params (optional): `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD)
  Defaults: month-to-date when no dates provided
*/

export async function getKpis(req, res) {
  try {
    const { startDate, endDate, branchId } = req.query;

    // Default to month-to-date
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = now;

    const parseDate = (d) => {
      if (!d) return null;
      // expect YYYY-MM-DD
      return new Date(d + 'T00:00:00');
    };

    const start = startDate ? parseDate(startDate) : defaultStart;
    const end = endDate ? parseDate(endDate) : defaultEnd;

    // normalize bounds for SQL (inclusive)
    const startSql = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')} 00:00:00`;
    const endSql = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')} 23:59:59`;

    // Build WHERE clause: always filter by date and status; optionally by branch
    const whereClause = branchId && branchId !== 'all' 
      ? `status = 'Completed' AND created_at BETWEEN ? AND ? AND branch_id = ?`
      : `status = 'Completed' AND created_at BETWEEN ? AND ?`;
    
    const params = branchId && branchId !== 'all' 
      ? [startSql, endSql, parseInt(branchId)]
      : [startSql, endSql];

    // 1) Total sales (filtered by branch if selected)
    const [totalRows] = await db.execute(
      `SELECT IFNULL(SUM(total_amount), 0) AS total_sales FROM transactions WHERE ${whereClause}`,
      params
    );

    // 2) Total transactions (filtered by branch if selected)
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS transaction_count FROM transactions WHERE ${whereClause}`,
      params
    );

    // 3) Average order value (filtered by branch if selected)
    const [avgRows] = await db.execute(
      `SELECT IFNULL(AVG(total_amount), 0) AS avg_order_value FROM transactions WHERE ${whereClause}`,
      params
    );

    // 4) Active branches (ALWAYS unfiltered - shows all branches with activity)
    const [branchRows] = await db.execute(
      `SELECT COUNT(DISTINCT branch_id) AS active_branches FROM transactions WHERE status = 'Completed' AND created_at BETWEEN ? AND ?`,
      [startSql, endSql]
    );

    const totalSales = Number(totalRows[0].total_sales || 0);
    const transactionCount = Number(countRows[0].transaction_count || 0);
    const avgOrderValue = Number(avgRows[0].avg_order_value || 0);
    const activeBranches = Number(branchRows[0].active_branches || 0);

    // compute average transactions per day
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.round((end - start) / msPerDay) + 1);
    const avgTransactionsPerDay = transactionCount / days;

    // month-to-date days (useful for UI)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthToDateDays = Math.floor((now - startOfMonth) / msPerDay) + 1;

    return res.json({
      total_sales: totalSales,
      transaction_count: transactionCount,
      avg_order_value: Number(avgOrderValue.toFixed(2)),
      active_branches: activeBranches,
      avg_transactions_per_day: Number(avgTransactionsPerDay.toFixed(2)),
      month_to_date_days: monthToDateDays,
      start: startSql,
      end: endSql,
    });
  } catch (err) {
    console.error('getKpis error', err);
    return res.status(500).json({ message: 'Failed to fetch KPIs', error: err.message });
  }
}

export default {
  getKpis,
  getBranches,
};

export async function getBranches(req, res) {
  try {
    console.log('getBranches called - user:', req.user);
    const [branches] = await db.execute(`SELECT branch_id, branch_name FROM branches ORDER BY branch_name ASC`);
    console.log('Branches fetched successfully:', branches);
    return res.json(branches || []);
  } catch (err) {
    console.error('getBranches error:', err.message, err.code, err.sql);
    return res.status(500).json({ message: 'Failed to fetch branches', error: err.message });
  }
}

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not set. PostgreSQL connection will fail until it is configured.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

const INSERT_ID_COLUMNS = {
  activity_logs: "log_id",
  branches: "branch_id",
  categories: "category_id",
  chat_room_members: "id",
  chat_rooms: "room_id",
  inventory: "inventory_id",
  login_logs: "login_log_id",
  message_status: "id",
  messages: "message_id",
  orders: "order_id",
  order_items: "order_item_id",
  password_reset_tokens: "pass_reset_token_id",
  portions: "portion_id",
  products: "product_id",
  raw_items: "raw_item_id",
  recovery_attempts: "recovery_attempt_id",
  refunds: "refund_id",
  roles: "role_id",
  transaction_items: "transaction_item_id",
  transaction_logs: "transaction_log_id",
  transactions: "transaction_id",
  users: "user_id",
  voids: "void_id",
};

function convertPlaceholders(sql) {
  let paramIndex = 0;
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const prev = index > 0 ? sql[index - 1] : "";

    if (char === "'" && prev !== "\\" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      result += char;
      continue;
    }

    if (char === '"' && prev !== "\\" && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      result += char;
      continue;
    }

    if (char === "?" && !inSingleQuote && !inDoubleQuote) {
      paramIndex += 1;
      result += `$${paramIndex}`;
      continue;
    }

    result += char;
  }

  return result;
}

function appendReturningForInsert(sql) {
  if (!/^\s*insert\s+into\s+/i.test(sql) || /\breturning\b/i.test(sql)) {
    return sql;
  }

  const match = sql.match(/^\s*insert\s+into\s+(?:public\.)?([a-z_][a-z0-9_]*)/i);
  if (!match) {
    return sql;
  }

  const tableName = match[1].toLowerCase();
  const idColumn = INSERT_ID_COLUMNS[tableName];
  if (!idColumn) {
    return sql;
  }

  return `${sql.trim()} RETURNING ${idColumn}`;
}

function normalizeResult(sql, queryResult) {
  if (/^\s*select\b/i.test(sql) || /^\s*with\b/i.test(sql)) {
    return [queryResult.rows];
  }

  if (/^\s*insert\b/i.test(sql)) {
    const firstRow = queryResult.rows[0] || {};
    const insertId = Object.values(firstRow)[0] ?? null;

    return [
      {
        insertId,
        affectedRows: queryResult.rowCount,
        rowCount: queryResult.rowCount,
        rows: queryResult.rows,
      },
    ];
  }

  return [
    {
      affectedRows: queryResult.rowCount,
      rowCount: queryResult.rowCount,
      rows: queryResult.rows,
    },
  ];
}

async function runQuery(executor, sql, params = []) {
  const convertedSql = appendReturningForInsert(convertPlaceholders(sql));
  const result = await executor.query(convertedSql, params);
  return normalizeResult(convertedSql, result);
}

function createConnection(client) {
  return {
    query(sql, params = []) {
      return runQuery(client, sql, params);
    },
    execute(sql, params = []) {
      return runQuery(client, sql, params);
    },
    async beginTransaction() {
      await client.query("BEGIN");
    },
    async commit() {
      await client.query("COMMIT");
    },
    async rollback() {
      await client.query("ROLLBACK");
    },
    release() {
      client.release();
    },
  };
}

export const db = {
  query(sql, params = []) {
    return runQuery(pool, sql, params);
  },
  execute(sql, params = []) {
    return runQuery(pool, sql, params);
  },
  async getConnection() {
    const client = await pool.connect();
    return createConnection(client);
  },
};

// 🚀 TEST CONNECTION IMMEDIATELY
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
  }
})();
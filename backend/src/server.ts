
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "MiniLedger API is running!" });
});

// Test PostgreSQL connection
app.get("/api/health/db", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS time"
    );

    res.json({
      status: "connected",
      database: result.rows[0].database,
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error);

    res.status(500).json({
      status: "error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get all loans
app.get("/api/loans", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        l.id,
        f.name AS friend_name,
        l.amount,
        l.due_date,
        l.status,
        l.created_at,
        l.repaid_at
      FROM public.loans l
      JOIN public.friends f ON l.friend_id = f.id
      ORDER BY l.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET LOANS ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch loans",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Add a loan
app.post("/api/loans", async (req, res) => {
  const { friendName, amount, dueDate } = req.body;

  const numericAmount = Number(amount);

  if (
    typeof friendName !== "string" ||
    !friendName.trim() ||
    amount === "" ||
    amount === null ||
    amount === undefined ||
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    typeof dueDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
    Number.isNaN(Date.parse(`${dueDate}T00:00:00Z`))
  ) {
    return res.status(400).json({
      error:
        "Provide a friendName, positive amount, and valid dueDate (YYYY-MM-DD).",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const friendResult = await client.query(
      `INSERT INTO public.friends (name)
       VALUES ($1)
       RETURNING id, name`,
      [friendName.trim()]
    );

    const friendId = friendResult.rows[0].id;

    const loanResult = await client.query(
      `INSERT INTO public.loans (friend_id, amount, due_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [friendId, numericAmount, dueDate]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Loan added successfully",
      loan: {
        ...loanResult.rows[0],
        friend_name: friendResult.rows[0].name,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ADD LOAN ERROR:", error);

    res.status(500).json({
      error: "Failed to add loan",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    client.release();
  }
});

// Mark a loan as repaid
app.patch("/api/loans/:id/repay", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid loan ID" });
  }

  try {
    const result = await pool.query(
      `UPDATE public.loans
       SET status = 'repaid',
           repaid_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Pending loan not found. It may already be repaid.",
      });
    }

    res.json({
      message: "Loan marked as repaid",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("REPAY LOAN ERROR:", error);

    res.status(500).json({
      error: "Failed to mark loan as repaid",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get loan summary
app.get("/api/summary", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS total_lent,
        COALESCE(
          SUM(amount) FILTER (WHERE status = 'repaid'),
          0
        ) AS total_repaid,
        COALESCE(
          SUM(amount) FILTER (
            WHERE status = 'pending'
              AND due_date < CURRENT_DATE
          ),
          0
        ) AS overdue_amount
      FROM public.loans
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("SUMMARY API ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch summary",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// In-memory mock OTP store (for assignment/demo purposes only)
const otpStore = new Map<
  string,
  { otp: string; expiresAt: number }
>();

// Generate mock OTP
app.post("/api/auth/send-otp", (req, res) => {
  const { phone } = req.body;

  if (
    typeof phone !== "string" ||
    !/^\+?[0-9]{10,15}$/.test(phone)
  ) {
    return res.status(400).json({
      error: "Enter a valid phone number with 10–15 digits.",
    });
  }

  const otp = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Assignment requirement: print OTP in server terminal
  console.log(`Mock OTP for ${phone}: ${otp}`);

  res.json({
    message: "Mock OTP generated. Check the backend terminal.",
  });
});

// Verify mock OTP
app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  const saved =
    typeof phone === "string" ? otpStore.get(phone) : undefined;

  if (
    !saved ||
    saved.expiresAt < Date.now() ||
    typeof otp !== "string" ||
    saved.otp !== otp
  ) {
    return res.status(401).json({
      error: "Invalid or expired OTP",
    });
  }

  otpStore.delete(phone);

  res.json({ message: "OTP verified successfully" });
});

// Start server
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`MiniLedger API running at http://localhost:${port}`);
});

/* Practice for the BI track — written as SQL on purpose.
 *
 * The bi lessons are about tools and judgement, so the obvious reading is that
 * they cannot carry graded practice at all. That is wrong, and it is worth
 * saying why: a dashboard tile IS a query. "Sales per person, biggest first"
 * is one visual on a screen and one GROUP BY underneath it, and the thing a BI
 * job actually tests — getting the data, at the right grain, as a ratio rather
 * than a total — is exactly what SQL makes you say out loud.
 *
 * ONE SCHEMA, THE SAME ONE THE SQL TRACK USES. Imported rather than copied, so
 * a student arriving here already knows the tables, and there is one place to
 * change if they ever move.
 *
 * ⚠️ A PROPERTY OF THIS DATA THAT THE KPI LESSON LEANS ON, MEASURED NOT ASSUMED:
 * every one of the four sellers made exactly TWO sales, and their totals run
 * from 11,500 to 39,000. So the count separates nobody and the ratio separates
 * everybody — which is the lesson's whole argument, sitting in the seed data by
 * luck. Do not "fix" the data to give people different sale counts.
 *
 * Also measured: every sale in this database belongs to department 2 (Sales),
 * so grouping by department yields a single row. Problems here are at the
 * EMPLOYEE grain for that reason, not by preference.
 */
import { SQL_DB } from "./sql-problems.mjs";

const BQ = (lessonSlug, difficulty, order, slug, title, desc, examples, starter, solution, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "sql",
  descriptionMd: desc, tagsCsv: tags.join(","), examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, sqlSetup: SQL_DB,
  functionName: "", testsJson: "[]",
  hintsJson: JSON.stringify(hints), xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

const biProblems = [
  /* ---------- bi-intro: a dashboard tile is a query ---------- */
  BQ("bi-intro", "Easy", 1, "bi-sales-per-person", "The First Tile",
    "Every dashboard starts as one of these. Show each seller's **name** and their **total sales**, biggest first.\n\nJoin `employees` to `sales`, add the amounts up per person, and order the result.\n\nName the total column `total`.",
    [{ input: "employees + sales", output: "4 rows · name, total — Saanvi Gupta 39000 first" }],
    "SELECT e.name\nFROM employees e\n",
    "SELECT e.name, SUM(s.amount) AS total\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\nORDER BY total DESC;",
    ["Join on `s.emp_id = e.id`, then `GROUP BY e.name`.",
     "SUM(s.amount) AS total, and ORDER BY total DESC."],
    ["bi", "join", "group-by"]),

  BQ("bi-intro", "Medium", 2, "bi-above-target", "Only the Ones Worth Chasing",
    "A dashboard built for a **decision** shows fewer rows, not more. The target is 20,000.\n\nShow the **name** and **total** of only the sellers whose total is **above 20000**, biggest first.\n\nThe filter is on a value you have added up, so `WHERE` will not reach it — that is what `HAVING` is for.",
    [{ input: "total > 20000", output: "2 rows · Saanvi Gupta 39000, Ananya Iyer 27000" }],
    "SELECT e.name, SUM(s.amount) AS total\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\n",
    "SELECT e.name, SUM(s.amount) AS total\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\nHAVING SUM(s.amount) > 20000\nORDER BY total DESC;",
    ["`WHERE` filters rows before grouping; `HAVING` filters after.",
     "HAVING SUM(s.amount) > 20000"],
    ["bi", "having", "group-by"]),

  /* ---------- bi-tools: the model decides everything ---------- */
  BQ("bi-tools", "Medium", 3, "bi-fact-and-dimensions", "One Fact, Two Dimensions",
    "This is a star schema written out in SQL. `sales` is the **fact** table — one row per thing that happened — and `employees` and `departments` **describe** those events.\n\nShow each seller's **name**, their department's **city**, and their **total** sales, biggest first.\n\nName the total column `total`.",
    [{ input: "sales + employees + departments", output: "4 rows · name, city, total" }],
    "SELECT e.name, d.city\nFROM sales s\nJOIN employees e ON e.id = s.emp_id\n",
    "SELECT e.name, d.city, SUM(s.amount) AS total\nFROM sales s\nJOIN employees e ON e.id = s.emp_id\nJOIN departments d ON d.id = e.dept_id\nGROUP BY e.name, d.city\nORDER BY total DESC;",
    ["Two joins: sales to employees, then employees to departments.",
     "GROUP BY e.name, d.city — every non-aggregated column has to be grouped."],
    ["bi", "join", "star-schema"]),

  BQ("bi-tools", "Easy", 4, "bi-grain", "Count and Total Together",
    "A measure is computed at the **grain** you group by, and it is worth seeing two of them side by side.\n\nShow each seller's **name**, how many sales they made as `sales_count`, and their `total`, biggest total first.\n\nLook at the two columns when it runs — one of them separates the sellers and the other does not.",
    [{ input: "employees + sales", output: "4 rows · every sales_count is 2, totals differ" }],
    "SELECT e.name\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\n",
    "SELECT e.name, COUNT(*) AS sales_count, SUM(s.amount) AS total\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\nORDER BY total DESC;",
    ["`COUNT(*)` counts the rows in each group.",
     "COUNT(*) AS sales_count, SUM(s.amount) AS total"],
    ["bi", "aggregate", "grain"]),

  /* ---------- bi-kpis: ratios beat totals ---------- */
  BQ("bi-kpis", "Easy", 5, "bi-average-sale", "Average Sale Value",
    "The last problem showed that every seller made exactly **two** sales, so the count tells you nothing about them. The ratio does.\n\nShow each seller's **name** and their **average sale value** as `avg_sale`, largest first. Round it to 2 decimal places.\n\nThis is AOV — average order value — one of the metrics the lesson named.",
    [{ input: "employees + sales", output: "4 rows · Saanvi Gupta 19500.0 first" }],
    "SELECT e.name\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\n",
    "SELECT e.name, ROUND(AVG(s.amount), 2) AS avg_sale\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\nORDER BY avg_sale DESC;",
    ["`AVG()` is the aggregate you want, and `ROUND(x, 2)` tidies it.",
     "ROUND(AVG(s.amount), 2) AS avg_sale"],
    ["bi", "kpi", "ratio"]),

  BQ("bi-kpis", "Hard", 6, "bi-share-of-total", "Share of the Total",
    "A share is a ratio whose denominator is **everything** — which means the query has to work out the whole before it can express a part.\n\nShow each seller's **name** and their percentage of all sales as `pct`, largest first, rounded to 1 decimal place.\n\nThe total of every sale is a value on its own, so it belongs in a subquery: `(SELECT SUM(amount) FROM sales)`. Multiply by `100.0`, not `100`, or integer division will throw the decimals away.",
    [{ input: "each seller ÷ 95000", output: "4 rows · 41.1, 28.4, 18.4, 12.1" }],
    "SELECT e.name\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\n",
    "SELECT e.name,\n       ROUND(100.0 * SUM(s.amount) / (SELECT SUM(amount) FROM sales), 1) AS pct\nFROM employees e\nJOIN sales s ON s.emp_id = e.id\nGROUP BY e.name\nORDER BY pct DESC;",
    ["The denominator is the same for every row, so a subquery computes it once.",
     "ROUND(100.0 * SUM(s.amount) / (SELECT SUM(amount) FROM sales), 1) AS pct"],
    ["bi", "kpi", "ratio", "subquery"]),
];

export { biProblems };

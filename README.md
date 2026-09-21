# MarketingIQ — AI-Driven Campaign Effectiveness & Budget Optimization System

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://marketingiq-gold.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Production URL**: [https://marketingiq-gold.vercel.app/](https://marketingiq-gold.vercel.app/)  
> **Core Strategic Question**: *"Where should the next ₹1 crore of marketing budget go?"*

---

## 🎯 Executive Overview

**MarketingIQ** is an enterprise-grade, full-stack marketing intelligence and budget optimization system designed for B2B enterprise service lines (Tata Consultancy Services demo context across Cloud, Cyber, Cognitive AI, BFSI, Life Sciences, and Retail).

It replaces static spreadsheet reporting with an autonomous analytics and decision intelligence engine powered by:
- **Hill Equation S-Curve Marginal Returns Modeling**
- **Equimarginal KKT Budget Reallocation Solver**
- **K-Means++ Customer Segmentation**
- **9-Stage Conversion Funnel Bottleneck Diagnostics**
- **Dynamic Action Center with Automated Business Impact Scoring**
- **Live AI Marketing Analyst Chatbot** (4 explanation levels: Executive, Manager, Analyst, Beginner)

---

## 🚀 Key Modules & Capabilities

| Module | Purpose | Key Models & Algorithms |
| :--- | :--- | :--- |
| **Executive Overview** | C-suite pulse with 7 core KPIs and INR formatting (`₹`, `Lakh`, `Crore`). | Real-time aggregation, period-over-period delta cards. |
| **Action Center** | *"What Needs Your Attention?"* prioritized operational recommendations. | Business Impact Scoring (Severity, Confidence, Revenue at Risk, Effort). |
| **Live AI Analyst Chatbot** | Interactive multi-turn conversational intelligence with visual charts. | Intent classification, attribution waterfall, revenue decomposition, Explain Simply mode. |
| **Campaign Analytics** | Multi-dimensional campaign evaluation across 8 filters and 11 KPIs. | Composite Effectiveness Score (CES) with configurable parameter weights. |
| **Customer Intelligence** | Micro-segment discovery across deal size, engagement, and cycle time. | K-Means++ clustering with dynamic centroid-based persona synthesis. |
| **Conversion Funnel** | 9 enterprise pipeline stages with stage-by-stage drop-off analytics. | Bottleneck identification, conversion velocity, drop-off root cause detection. |
| **Revenue Analytics** | Attribution and decomposition across 6 dimensions. | Pareto 80/20 contribution curve, period-over-period waterfall analysis. |
| **Budget Optimizer** | Constrained nonlinear mathematical optimization for budget allocation. | Equimarginal return equalization with minimum/maximum spend constraints and channel locks. |
| **Scenario Simulator** | Interactive real-time budget reallocation sandbox with zero latency. | Live marginal revenue recalculation, efficiency curve positioning. |
| **AI Recommendations** | Algorithmic under-spending identification. | Under-Investment Opportunity Score (0–100 scale). |
| **Data Upload** | Schema-agnostic drag-and-drop CSV/XLSX ingestion. | Automated column inference, type detection, mapping validation, live engine re-indexing. |
| **Methodology** | Transparent academic & mathematical documentation. | Mathematical formulation of Hill curves, KKT conditions, causal inference caveats. |

---

## 📐 Mathematical Formulation

### 1. S-Curve Diminishing Returns (Hill Equation)
Every marketing channel follows a non-linear saturation curve:
$$R(x) = \frac{V_{\max} \cdot x^n}{K^n + x^n}$$

Where:
- $x$: Marketing spend in channel
- $V_{\max}$: Asymptotic maximum attainable revenue
- $K$: Half-saturation constant (spend level reaching $50\%$ of $V_{\max}$)
- $n$: Hill cooperativity coefficient ($n > 1$ represents threshold barrier, $n = 1$ is hyperbolic)

Marginal Return ($\text{MR}$):
$$\text{MR}(x) = \frac{dR}{dx} = \frac{n \cdot V_{\max} \cdot K^n \cdot x^{n-1}}{(K^n + x^n)^2}$$

### 2. Equimarginal Budget Reallocation
The optimal allocation satisfies the Karush-Kuhn-Tucker (KKT) conditions:
$$\max_{\{x_i\}} \sum_{i=1}^M R_i(x_i) \quad \text{subject to} \quad \sum_{i=1}^M x_i = B, \quad L_i \le x_i \le U_i$$

At the interior optimum, marginal returns across unconstrained channels are equalized:
$$\text{MR}_1(x_1^*) = \text{MR}_2(x_2^*) = \dots = \text{MR}_k(x_k^*) = \lambda$$

---

## 💻 Tech Stack

- **Framework**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: Vanilla Tailwind CSS 3.4 (custom corporate palette: Iceberg `#0284C7`, Slate `#0F172A`, Emerald `#10B981`, Amber `#F59E0B`)
- **Visualizations**: Recharts 2.12 + Lucide React
- **Hosting & Serverless**: Vercel Git Integration

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/harshavardhankosuri2002-source/marketingiq.git
cd marketingiq

# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript checking & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Production Deployment

- **Hosting Platform**: Vercel
- **Production URL**: [https://marketingiq-gold.vercel.app/](https://marketingiq-gold.vercel.app/)
- **Configuration**: `vercel.json` (Vite SPA rewrites)
- **Environment**: Deterministic Analytics Mode runs without requiring external API keys.

---

## 📄 License & Attribution

Tata Consultancy Services (TCS) enterprise context is used as a realistic B2B industry demonstration dataset (2,500 generated records across 6 enterprise business units and 6 marketing channels).

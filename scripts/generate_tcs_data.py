"""
Python Data Generator and Analytics Benchmarking Script for MarketingIQ
Generates a realistic 2,500-record B2B dataset for Tata Consultancy Services (TCS)
and exports it to 'tcs_marketing_demo_dataset.csv'.
"""

import os
import random
import csv
from datetime import datetime, timedelta

def generate_tcs_dataset(output_path, row_count=2500):
    random.seed(1337)

    channels = [
        {"name": "LinkedIn Enterprise", "base_ctr": 0.026, "click_to_lead": 0.09, "lead_to_mql": 0.65, "mql_to_sql": 0.52, "sql_to_opp": 0.65, "opp_to_prop": 0.75, "prop_to_contract": 0.38, "avg_deal": 4800000, "spend_range": (18000, 65000)},
        {"name": "Google Search", "base_ctr": 0.038, "click_to_lead": 0.075, "lead_to_mql": 0.58, "mql_to_sql": 0.44, "sql_to_opp": 0.58, "opp_to_prop": 0.68, "prop_to_contract": 0.32, "avg_deal": 3200000, "spend_range": (22000, 75000)},
        {"name": "Executive Events & Roundtables", "base_ctr": 0.015, "click_to_lead": 0.12, "lead_to_mql": 0.70, "mql_to_sql": 0.35, "sql_to_opp": 0.45, "opp_to_prop": 0.58, "prop_to_contract": 0.28, "avg_deal": 7500000, "spend_range": (45000, 140000)},
        {"name": "Account-Based Email", "base_ctr": 0.042, "click_to_lead": 0.085, "lead_to_mql": 0.68, "mql_to_sql": 0.55, "sql_to_opp": 0.68, "opp_to_prop": 0.78, "prop_to_contract": 0.42, "avg_deal": 4200000, "spend_range": (8000, 28000)},
        {"name": "Tech Analyst Webinars", "base_ctr": 0.022, "click_to_lead": 0.065, "lead_to_mql": 0.52, "mql_to_sql": 0.40, "sql_to_opp": 0.52, "opp_to_prop": 0.62, "prop_to_contract": 0.30, "avg_deal": 2900000, "spend_range": (12000, 42000)},
        {"name": "Industry Display & Media", "base_ctr": 0.009, "click_to_lead": 0.035, "lead_to_mql": 0.42, "mql_to_sql": 0.28, "sql_to_opp": 0.40, "opp_to_prop": 0.50, "prop_to_contract": 0.22, "avg_deal": 2400000, "spend_range": (15000, 50000)},
    ]

    service_categories = [
        "Cloud & Infrastructure Transformation",
        "Cognitive AI & Enterprise Automation",
        "Cyber Defense & Risk Governance",
        "BFSI Core Modernization",
        "Healthcare & Life Sciences Digital Labs",
        "Retail Omnichannel & Supply Chain",
    ]

    geographies = ["North America", "Europe & UK", "APAC & Australia", "India & Middle East", "Nordics & Benelux"]
    industries = ["Banking & Capital Markets", "Healthcare & Life Sciences", "Manufacturing & Auto", "Retail & CPG", "Telecom & Media", "Energy & Utilities"]
    segments = ["Enterprise High-Value", "Strategic Growth Accounts", "Nurture / Mid-Market", "Emerging Tier / High-CAC"]
    objectives = ["Pipeline Generation", "Strategic Account Penetration", "Executive Engagement", "Brand Authority & MQLs"]

    prefixes = [
        "Q1 Cloud Scale", "GenAI Catalyst", "CyberShield 360", "BFSI Resiliency",
        "NextGen CX", "Global Horizon", "SAP S/4 Hana Accelerated", "Zero Trust Enterprise",
        "Cognitive Ops 2.0", "Life Sciences DataHub", "OmniCommerce Edge", "Sustainable Tech Suite"
    ]

    months = [
        "2025-10", "2025-11", "2025-12",
        "2026-01", "2026-02", "2026-03",
        "2026-04", "2026-05", "2026-06",
        "2026-07", "2026-08", "2026-09"
    ]

    headers = [
        "id", "campaign_name", "channel", "date", "month", "spend", "impressions",
        "clicks", "leads", "mqls", "sqls", "opportunities", "proposals", "contracts",
        "revenue", "customer_segment", "industry", "geography", "service_category",
        "campaign_type", "campaign_objective", "deal_value", "sales_cycle_days"
    ]

    rows = []
    total_spend = 0
    total_rev = 0

    for i in range(row_count):
        ch = random.choice(channels)
        service = random.choice(service_categories)
        geo = random.choice(geographies)
        ind = random.choice(industries)
        seg = random.choice(segments)
        month = random.choice(months)
        obj = random.choice(objectives)
        prefix = random.choice(prefixes)

        spend = round(random.uniform(*ch["spend_range"]))
        cpm = random.uniform(120, 240) if "Display" in ch["name"] else random.uniform(800, 1600) if "Event" in ch["name"] else random.uniform(300, 700)
        impressions = max(100, round((spend / cpm) * 1000 * random.uniform(0.85, 1.15)))
        
        ctr = ch["base_ctr"] * random.uniform(0.8, 1.25)
        clicks = max(5, round(impressions * ctr))

        click_to_lead = ch["click_to_lead"] * random.uniform(0.75, 1.25)
        leads = max(1, round(clicks * click_to_lead))

        lead_to_mql = ch["lead_to_mql"] * random.uniform(0.8, 1.2)
        mqls = max(0, min(leads, round(leads * lead_to_mql)))

        mql_to_sql = ch["mql_to_sql"] * random.uniform(0.8, 1.2)
        sqls = max(0, min(mqls, round(mqls * mql_to_sql)))

        sql_to_opp = ch["sql_to_opp"] * random.uniform(0.8, 1.15)
        opps = max(0, min(sqls, round(sqls * sql_to_opp)))

        opp_to_prop = ch["opp_to_prop"] * random.uniform(0.8, 1.15)
        proposals = max(0, min(opps, round(opps * opp_to_prop)))

        prop_to_contract = ch["prop_to_contract"] * random.uniform(0.7, 1.3)
        contracts = max(0, min(proposals, round(proposals * prop_to_contract)))

        seg_mult = 2.1 if seg == "Enterprise High-Value" else 1.3 if seg == "Strategic Growth Accounts" else 0.8 if seg == "Nurture / Mid-Market" else 0.45
        deal_value = round(ch["avg_deal"] * seg_mult * random.uniform(0.85, 1.2))
        revenue = contracts * deal_value if contracts > 0 else 0

        day = f"{random.randint(1, 28):02d}"
        date = f"{month}-{day}"
        sales_cycle_days = round(random.uniform(50, 160) * (1.3 if seg == "Enterprise High-Value" else 0.9))

        total_spend += spend
        total_rev += revenue

        rows.append([
            f"TCS-CMP-{i+1:05d}",
            f"{prefix} - {service.split()[0]}",
            ch["name"],
            date,
            month,
            spend,
            impressions,
            clicks,
            leads,
            mqls,
            sqls,
            opps,
            proposals,
            contracts,
            revenue,
            seg,
            ind,
            geo,
            service,
            "Experiential" if "Event" in ch["name"] else "Outbound ABM" if "Email" in ch["name"] else "Digital Inbound",
            obj,
            deal_value,
            sales_cycle_days
        ])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    roi = total_rev / total_spend if total_spend > 0 else 0
    print(f"Generated {len(rows)} records in {output_path}")
    print(f"Total Spend: INR {total_spend:,} | Total Closed Revenue: INR {total_rev:,} | Portfolio ROI: {roi:.2f}x")

if __name__ == "__main__":
    out_csv = os.path.join(os.path.dirname(__file__), "..", "public", "tcs_marketing_demo_dataset.csv")
    generate_tcs_dataset(out_csv, 2500)

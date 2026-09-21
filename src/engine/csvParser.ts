import { CampaignRecord, UploadColumnMapping } from './types';

export interface ParsedDataSummary {
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  missingValuesCount: Record<string, number>;
  duplicateRowsCount: number;
  inferredTypes: Record<string, 'number' | 'string' | 'date'>;
  suggestedMapping: UploadColumnMapping;
  rawText: string;
}

export function parseCSVText(csvContent: string): ParsedDataSummary {
  const lines = csvContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('The uploaded file is empty.');
  }

  // Parse header
  const headerLine = lines[0];
  const delimiter = headerLine.includes('\t') ? '\t' : ',';
  const headers = parseLine(headerLine, delimiter);

  const totalRows = lines.length - 1;
  const sampleRows: Record<string, string>[] = [];
  const missingValuesCount: Record<string, number> = {};
  headers.forEach(h => { missingValuesCount[h] = 0; });

  const seenRows = new Set<string>();
  let duplicateRowsCount = 0;

  const typeCounts: Record<string, { numbers: number; dates: number; strings: number }> = {};
  headers.forEach(h => {
    typeCounts[h] = { numbers: 0, dates: 0, strings: 0 };
  });

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (seenRows.has(rawLine)) {
      duplicateRowsCount++;
    } else {
      seenRows.add(rawLine);
    }

    const values = parseLine(rawLine, delimiter);
    const rowObj: Record<string, string> = {};

    headers.forEach((header, idx) => {
      const val = values[idx] !== undefined ? values[idx].trim() : '';
      rowObj[header] = val;

      if (!val || val === 'null' || val === 'NA' || val === 'NaN') {
        missingValuesCount[header]++;
      } else {
        // Detect type
        const cleanNum = val.replace(/[₹$,]/g, '');
        if (!isNaN(Number(cleanNum)) && cleanNum !== '') {
          typeCounts[header].numbers++;
        } else if (!isNaN(Date.parse(val)) && (val.includes('-') || val.includes('/'))) {
          typeCounts[header].dates++;
        } else {
          typeCounts[header].strings++;
        }
      }
    });

    if (sampleRows.length < 10) {
      sampleRows.push(rowObj);
    }
  }

  // Inferred types
  const inferredTypes: Record<string, 'number' | 'string' | 'date'> = {};
  headers.forEach(h => {
    const counts = typeCounts[h];
    if (counts.numbers > counts.strings && counts.numbers > counts.dates) {
      inferredTypes[h] = 'number';
    } else if (counts.dates > counts.strings && counts.dates > counts.numbers) {
      inferredTypes[h] = 'date';
    } else {
      inferredTypes[h] = 'string';
    }
  });

  // Suggest mappings by fuzzy match
  const suggestedMapping = suggestMappings(headers);

  return {
    headers,
    sampleRows,
    totalRows,
    missingValuesCount,
    duplicateRowsCount,
    inferredTypes,
    suggestedMapping,
    rawText: csvContent
  };
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

function suggestMappings(headers: string[]): UploadColumnMapping {
  const findMatch = (candidates: string[]): string => {
    for (const cand of candidates) {
      const found = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cand.toLowerCase().replace(/[^a-z0-9]/g, '')));
      if (found) return found;
    }
    return '';
  };

  return {
    campaignName: findMatch(['campaign', 'campaign_name', 'campaignname', 'ad_name', 'name']) || headers[0] || '',
    channel: findMatch(['channel', 'platform', 'source', 'medium', 'network']) || headers[1] || '',
    date: findMatch(['date', 'day', 'month', 'timestamp', 'created_at']) || headers[2] || '',
    spend: findMatch(['spend', 'cost', 'marketing_spend', 'budget', 'amount']) || headers[3] || '',
    revenue: findMatch(['revenue', 'sales', 'conversion_value', 'deal_value', 'income']) || headers[4] || '',
    impressions: findMatch(['impression', 'views', 'imps']),
    clicks: findMatch(['click', 'clicks', 'visits']),
    leads: findMatch(['lead', 'leads', 'inquiries', 'contacts']),
    mqls: findMatch(['mql', 'mqls', 'marketing_qualified']),
    sqls: findMatch(['sql', 'sqls', 'sales_qualified']),
    opportunities: findMatch(['opportunity', 'opportunities', 'opps', 'deals']),
    conversions: findMatch(['conversion', 'conversions', 'contract', 'contracts', 'wins', 'purchases']),
    customerSegment: findMatch(['segment', 'customer_segment', 'tier', 'account_type']),
    industry: findMatch(['industry', 'sector', 'vertical']),
    geography: findMatch(['geography', 'region', 'country', 'geo']),
    dealValue: findMatch(['deal_value', 'deal_size', 'avg_deal', 'contract_value']),
  };
}

export function transformUploadedData(
  rawCSV: string,
  mapping: UploadColumnMapping
): CampaignRecord[] {
  const lines = rawCSV.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = parseLine(lines[0], delimiter);

  const getIdx = (colName?: string) => colName ? headers.indexOf(colName) : -1;

  const idxCampaign = getIdx(mapping.campaignName);
  const idxChannel = getIdx(mapping.channel);
  const idxDate = getIdx(mapping.date);
  const idxSpend = getIdx(mapping.spend);
  const idxRevenue = getIdx(mapping.revenue);
  const idxImps = getIdx(mapping.impressions);
  const idxClicks = getIdx(mapping.clicks);
  const idxLeads = getIdx(mapping.leads);
  const idxMqls = getIdx(mapping.mqls);
  const idxSqls = getIdx(mapping.sqls);
  const idxOpps = getIdx(mapping.opportunities);
  const idxConversions = getIdx(mapping.conversions);
  const idxSeg = getIdx(mapping.customerSegment);
  const idxInd = getIdx(mapping.industry);
  const idxGeo = getIdx(mapping.geography);
  const idxDeal = getIdx(mapping.dealValue);

  const cleanNum = (val: string, fallback: number = 0) => {
    if (!val) return fallback;
    const n = Number(val.replace(/[₹$, ]/g, ''));
    return isNaN(n) ? fallback : n;
  };

  const records: CampaignRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i], delimiter);
    if (vals.length < 2) continue;

    const spend = idxSpend !== -1 ? cleanNum(vals[idxSpend], 0) : 0;
    const revenue = idxRevenue !== -1 ? cleanNum(vals[idxRevenue], 0) : 0;
    const conversions = idxConversions !== -1 ? cleanNum(vals[idxConversions], 0) : (revenue > 0 ? 1 : 0);
    const leads = idxLeads !== -1 ? cleanNum(vals[idxLeads], Math.max(1, conversions * 6)) : Math.max(1, conversions * 6);
    const clicks = idxClicks !== -1 ? cleanNum(vals[idxClicks], leads * 10) : leads * 10;
    const imps = idxImps !== -1 ? cleanNum(vals[idxImps], clicks * 40) : clicks * 40;
    const mqls = idxMqls !== -1 ? cleanNum(vals[idxMqls], Math.round(leads * 0.6)) : Math.round(leads * 0.6);
    const sqls = idxSqls !== -1 ? cleanNum(vals[idxSqls], Math.round(mqls * 0.5)) : Math.round(mqls * 0.5);
    const opps = idxOpps !== -1 ? cleanNum(vals[idxOpps], Math.round(sqls * 0.6)) : Math.round(sqls * 0.6);

    const dateVal = idxDate !== -1 && vals[idxDate] ? vals[idxDate] : '2026-01-15';
    const month = dateVal.length >= 7 ? dateVal.substring(0, 7) : '2026-01';

    records.push({
      id: `USER-${i.toString().padStart(5, '0')}`,
      campaignName: idxCampaign !== -1 && vals[idxCampaign] ? vals[idxCampaign] : `Campaign ${i}`,
      channel: idxChannel !== -1 && vals[idxChannel] ? vals[idxChannel] : 'General Channel',
      date: dateVal,
      month,
      spend,
      impressions: imps,
      clicks,
      leads,
      mqls,
      sqls,
      opportunities: opps,
      proposals: Math.max(conversions, Math.round(opps * 0.7)),
      contracts: conversions,
      revenue,
      customerSegment: idxSeg !== -1 && vals[idxSeg] ? vals[idxSeg] : 'Standard Segment',
      industry: idxInd !== -1 && vals[idxInd] ? vals[idxInd] : 'Cross-Industry',
      geography: idxGeo !== -1 && vals[idxGeo] ? vals[idxGeo] : 'Global',
      serviceCategory: 'Enterprise Services',
      campaignType: 'Omnichannel',
      campaignObjective: 'Revenue Growth',
      dealValue: idxDeal !== -1 ? cleanNum(vals[idxDeal], conversions > 0 ? Math.round(revenue / conversions) : revenue) : (conversions > 0 ? Math.round(revenue / conversions) : revenue),
      salesCycleDays: 60,
    });
  }

  return records;
}

import React, { useState, useRef } from 'react';
import { CampaignRecord, UploadColumnMapping } from '../engine/types';
import { parseCSVText, transformUploadedData, ParsedDataSummary } from '../engine/csvParser';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Database,
  FileText,
  Table,
  Sparkles,
  Download
} from 'lucide-react';

interface DataUploadViewProps {
  onDatasetLoaded: (records: CampaignRecord[], datasetName: string) => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({ onDatasetLoaded }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedSummary, setParsedSummary] = useState<ParsedDataSummary | null>(null);
  const [mappings, setMappings] = useState<UploadColumnMapping | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const summary = parseCSVText(text);
        setParsedSummary(summary);
        setMappings(summary.suggestedMapping);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse file. Ensure it is a valid CSV or TSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleMappingChange = (field: keyof UploadColumnMapping, value: string) => {
    if (!mappings) return;
    setMappings({
      ...mappings,
      [field]: value
    });
  };

  const applyUploadedData = () => {
    if (!parsedSummary || !mappings) return;

    try {
      const records = transformUploadedData(parsedSummary.rawText, mappings);
      if (records.length === 0) {
        setErrorMsg('Zero valid records could be extracted with the selected column mapping.');
        return;
      }

      onDatasetLoaded(records, fileName || 'Custom Uploaded Data');
      setSuccessMsg(`Successfully loaded ${records.length} records into MarketingIQ! All analytical engines recomputed.`);
    } catch (err: any) {
      setErrorMsg(`Transformation error: ${err.message}`);
    }
  };

  const loadSampleCustomCSV = () => {
    const sampleCSV = `campaign_name,channel,date,spend,revenue,leads,mqls,sqls,contracts,customer_segment,industry,geography
Q1 Global FinTech Scaling,Google Search,2026-02-10,45000,180000,52,32,18,3,Enterprise High-Value,Banking & Capital Markets,North America
NextGen Cloud Horizon,LinkedIn Enterprise,2026-02-12,58000,320000,48,34,22,5,Strategic Growth Accounts,Retail & CPG,Europe & UK
Cyber Defense Executive Dinner,Executive Events & Roundtables,2026-02-15,120000,480000,35,28,14,2,Enterprise High-Value,Healthcare & Life Sciences,North America
Cognitive Ops Account Nurture,Account-Based Email,2026-02-18,18000,140000,64,48,32,4,Strategic Growth Accounts,Manufacturing & Auto,APAC & Australia
AI Modernization Live Forum,Tech Analyst Webinars,2026-02-20,32000,95000,58,35,16,2,Nurture / Mid-Market,Energy & Utilities,India & Middle East
Enterprise Brand Authority,Industry Display & Media,2026-02-25,38000,65000,40,18,8,1,Emerging Tier / High-CAC,Telecom & Media,North America`;

    setFileName('sample_b2b_marketing_data.csv');
    const summary = parseCSVText(sampleCSV);
    setParsedSummary(summary);
    setMappings(summary.suggestedMapping);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-iceberg-50 text-iceberg-700 text-xs font-semibold mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Universal Schema Ingestion Engine</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Upload Custom Marketing & Attribution Dataset
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Replace the default Tata Consultancy Services demo data with your company's CSV or Excel exports. MarketingIQ automatically detects columns, validates types, flags missing entries, and maps schema fields.
            </p>
          </div>

          <button
            onClick={loadSampleCustomCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-iceberg-600" />
            <span>Load Quick Sample CSV</span>
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dropzone Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
          dragActive
            ? 'border-iceberg-500 bg-iceberg-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-iceberg-400 hover:bg-slate-50/50 shadow-2xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-iceberg-50 text-iceberg-600 flex items-center justify-center mb-4 shadow-sm">
          <Upload className="w-7 h-7" />
        </div>

        <h4 className="text-base font-bold text-slate-900 mb-1">
          {fileName ? `Loaded: ${fileName}` : 'Drop your marketing CSV or XLSX file here'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Supports standard exports from Google Ads, LinkedIn Campaign Manager, Salesforce, HubSpot, or internal data warehouses.
        </p>
        <span className="px-4 py-2 rounded-lg bg-iceberg-600 hover:bg-iceberg-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-iceberg-600/30">
          Browse Files
        </span>
      </div>

      {/* Parsed Summary & Data Health Check (Requirement 22) */}
      {parsedSummary && mappings && (
        <div className="space-y-6">
          {/* Health Check Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dataset Health & Profiling Summary</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Rows</span>
                <div className="text-lg font-extrabold text-slate-900">{parsedSummary.totalRows.toLocaleString()} rows</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Detected Columns</span>
                <div className="text-lg font-extrabold text-slate-900">{parsedSummary.headers.length} headers</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Duplicate Rows</span>
                <div className={`text-lg font-extrabold ${parsedSummary.duplicateRowsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {parsedSummary.duplicateRowsCount} duplicates
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Data Quality Status</span>
                <div className="text-lg font-extrabold text-emerald-600">Valid Schema</div>
              </div>
            </div>
          </div>

          {/* Suggested & Manual Column Mapping Grid (Requirement 22) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Schema Field Mapping</h4>
                <p className="text-xs text-slate-500">
                  Verify or manually re-map your uploaded columns to MarketingIQ internal metrics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { field: 'campaignName' as keyof UploadColumnMapping, label: 'Campaign Name *', req: true },
                { field: 'channel' as keyof UploadColumnMapping, label: 'Channel / Platform *', req: true },
                { field: 'date' as keyof UploadColumnMapping, label: 'Date / Period *', req: true },
                { field: 'spend' as keyof UploadColumnMapping, label: 'Spend / Cost (₹) *', req: true },
                { field: 'revenue' as keyof UploadColumnMapping, label: 'Closed Revenue (₹) *', req: true },
                { field: 'leads' as keyof UploadColumnMapping, label: 'Leads / Inquiries', req: false },
                { field: 'sqls' as keyof UploadColumnMapping, label: 'Qualified Leads (SQL)', req: false },
                { field: 'conversions' as keyof UploadColumnMapping, label: 'Deals Won / Contracts', req: false },
                { field: 'customerSegment' as keyof UploadColumnMapping, label: 'Customer Segment', req: false },
              ].map(f => (
                <div key={f.field} className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-700">
                    {f.label}
                  </label>
                  <select
                    value={mappings[f.field] || ''}
                    onChange={(e) => handleMappingChange(f.field, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:ring-1 focus:ring-iceberg-500"
                  >
                    <option value="">-- None / Auto Derive --</option>
                    {parsedSummary.headers.map(h => (
                      <option key={h} value={h}>
                        {h} ({parsedSummary.inferredTypes[h]})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={applyUploadedData}
                className="px-6 py-2.5 rounded-xl bg-iceberg-600 hover:bg-iceberg-500 text-white font-bold text-xs shadow-md shadow-iceberg-600/30 transition-all flex items-center gap-2"
              >
                <span>Validate & Activate Dataset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* First 10 Rows Preview Table (Requirement 22) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Data Preview (First 10 Sample Rows)</h4>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-semibold sticky top-0">
                  <tr>
                    {parsedSummary.headers.map(h => (
                      <th key={h} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {parsedSummary.sampleRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/60">
                      {parsedSummary.headers.map(h => (
                        <td key={h} className="py-2.5 px-3 whitespace-nowrap">{row[h] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

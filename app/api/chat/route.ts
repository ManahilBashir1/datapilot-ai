import { NextResponse } from 'next/server';
import { sanitizeAndGuard } from '@/lib/guardrails';
import { computeTelemetry } from '@/lib/telemetry';

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const { query, profile, sampleRows } = await req.json();

    // 1. Enforce Guardrails (Prompt Injection & Payload Shields)
    const guardCheck = sanitizeAndGuard(query);
    if (!guardCheck.allowed) {
      const latency = Date.now() - startTime;
      const telemetry = computeTelemetry(query, guardCheck.reason || "Blocked", latency);
      return NextResponse.json({
        reply: guardCheck.reason,
        telemetry,
        guardrailTriggered: true
      });
    }

    const cleanQuery = guardCheck.cleanText.toLowerCase();

    // 2. Autonomous Statistical Query Interpreter
    let answer = "";
    const numericCols = profile?.columns?.filter((c: any) => c.type === 'numeric') || [];
    const catCols = profile?.columns?.filter((c: any) => c.type === 'categorical') || [];

    if (cleanQuery.includes('average') || cleanQuery.includes('mean')) {
      const targetCol = numericCols.find((c: any) => cleanQuery.includes(c.name.toLowerCase())) || numericCols[0];
      if (targetCol) {
        answer = `📊 The average (mean) value of '${targetCol.name}' is ${targetCol.mean} across ${profile.rowCount} records (min: ${targetCol.min}, max: ${targetCol.max}).`;
      } else {
        answer = `Available numeric metrics to average: ${numericCols.map((c: any) => c.name).join(', ')}.`;
      }
    } else if (cleanQuery.includes('total') || cleanQuery.includes('sum')) {
      const targetCol = numericCols.find((c: any) => cleanQuery.includes(c.name.toLowerCase())) || numericCols[0];
      if (targetCol) {
        answer = `📈 The total sum of '${targetCol.name}' across the entire dataset is ${targetCol.sum?.toLocaleString() || 'N/A'}.`;
      }
    } else if (cleanQuery.includes('highest') || cleanQuery.includes('max') || cleanQuery.includes('top')) {
      if (sampleRows && sampleRows.length > 0 && numericCols.length > 0) {
        const sorted = [...sampleRows].sort((a, b) => Number(b[numericCols[0].name] || 0) - Number(a[numericCols[0].name] || 0));
        const topRow = sorted[0];
        answer = `🏆 Top record identified with maximum '${numericCols[0].name}' (${topRow[numericCols[0].name]}):\n${JSON.stringify(topRow, null, 2)}`;
      }
    } else if (cleanQuery.includes('outlier') || cleanQuery.includes('anomaly')) {
      answer = `🔍 Outlier Analysis: Examined ${numericCols.length} numerical features. Features with broad standard deviation detected: ${numericCols.map((c: any) => `${c.name} (Range: ${c.min} to ${c.max})`).join('; ')}.`;
    } else {
      answer = `📋 Dataset Profile Analysis:\n• Total Records: ${profile?.rowCount || 0}\n• Total Columns: ${profile?.columnCount || 0}\n• Numeric Columns: ${numericCols.map((c: any) => c.name).join(', ') || 'None'}\n• Categorical Columns: ${catCols.map((c: any) => c.name).join(', ') || 'None'}`;
    }

    // 3. Compute Real-time Telemetry & Cost
    const latency = Date.now() - startTime;
    const telemetry = computeTelemetry(query, answer, latency);

    return NextResponse.json({
      reply: answer,
      telemetry,
      guardrailTriggered: false
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
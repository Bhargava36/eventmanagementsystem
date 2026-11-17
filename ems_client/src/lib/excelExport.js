import JSZip from 'jszip';

/**
 * Escapes characters for XML attributes and text nodes.
 */
function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .split('')
    .filter(char => {
      const code = char.charCodeAt(0);
      return code >= 32 || code === 9 || code === 10 || code === 13;
    })
    .join('');
}

/**
 * Convert 1-based column number to Excel column letter (1 -> A, 27 -> AA, etc.).
 */
function colToLetter(colIndex) {
  let temp;
  let letter = '';
  let col = colIndex;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    col = Math.floor((col - temp - 1) / 26);
  }
  return letter;
}

/**
 * Generates OpenXML styles for professional AYOJAN branding:
 * Emerald headers, clean fonts, borders, zebra striping, and colored status badges.
 */
function generateStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="8">
    <!-- 0: Normal Text (Calibri 10pt Slate) -->
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/><family val="2"/></font>
    <!-- 1: Table Header (Calibri 10pt Bold White) -->
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
    <!-- 2: Event Title (Calibri 15pt Bold White) -->
    <font><b/><sz val="15"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
    <!-- 3: Subtitle Meta (Calibri 10pt Soft Mint) -->
    <font><sz val="10"/><color rgb="FFD1FAE5"/><name val="Calibri"/><family val="2"/></font>
    <!-- 4: Virtual Badge Text (Calibri 9pt Bold Dark Emerald) -->
    <font><b/><sz val="9"/><color rgb="FF065F46"/><name val="Calibri"/><family val="2"/></font>
    <!-- 5: Physical Badge Text (Calibri 9pt Bold Dark Amber) -->
    <font><b/><sz val="9"/><color rgb="FF92400E"/><name val="Calibri"/><family val="2"/></font>
    <!-- 6: KPI Number (Calibri 14pt Bold Emerald) -->
    <font><b/><sz val="14"/><color rgb="FF047857"/><name val="Calibri"/><family val="2"/></font>
    <!-- 7: Leader Role Bold (Calibri 10pt Bold Dark Slate) -->
    <font><b/><sz val="10"/><color rgb="FF047857"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="10">
    <!-- 0: None -->
    <fill><patternFill patternType="none"/></fill>
    <!-- 1: Gray125 -->
    <fill><patternFill patternType="gray125"/></fill>
    <!-- 2: Primary Emerald Banner (#047857) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF047857"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 3: Dark Emerald Table Header (#064E3B) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF064E3B"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 4: Alternating Row Soft Mint (#F0FDF4) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFF0FDF4"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 5: Virtual Badge Mint Tint (#D1FAE5) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFD1FAE5"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 6: Physical Badge Amber Tint (#FEF3C7) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 7: KPI Box Emerald (#ECFDF5) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFECFDF5"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 8: Subheader Slate Tint (#F8FAFC) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 9: Section Divider Emerald (#E0F2FE) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFE0F2FE"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <!-- 0: None -->
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <!-- 1: Subtle Slate Thin Border (#E2E8F0) -->
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
    <!-- 2: Medium Header Border -->
    <border>
      <left style="thin"><color rgb="FF047857"/></left>
      <right style="thin"><color rgb="FF047857"/></right>
      <top style="thin"><color rgb="FF047857"/></top>
      <bottom style="medium"><color rgb="FF064E3B"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="15">
    <!-- 0: Normal Left -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <!-- 1: Banner Title -->
    <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
    <!-- 2: Banner Subtitle -->
    <xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
    <!-- 3: Table Header Center -->
    <xf numFmtId="0" fontId="1" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <!-- 4: Table Header Left -->
    <xf numFmtId="0" fontId="1" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <!-- 5: Zebra Row Left -->
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <!-- 6: Normal Center -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 7: Zebra Row Center -->
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 8: Track Virtual Badge -->
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 9: Track Physical Badge -->
    <xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 10: Role Leader Badge -->
    <xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 11: Role Leader Badge Zebra -->
    <xf numFmtId="0" fontId="7" fillId="4" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 12: KPI Value Box -->
    <xf numFmtId="0" fontId="6" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 13: KPI Label Box -->
    <xf numFmtId="0" fontId="0" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 14: Section Header Box -->
    <xf numFmtId="0" fontId="7" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
  </cellXfs>
</styleSheet>`;
}

/**
 * Builds an XML worksheet string with header banner, KPI metrics, styled data table, and column formatting.
 */
function buildWorksheetXml({
  title,
  subtitle,
  meta,
  kpis = [],
  columns = [],
  rows = []
}) {
  const colCount = Math.max(columns.length, 11);
  const endColLetter = colToLetter(colCount);

  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n';

  // Define column widths
  xml += '  <cols>\n';
  columns.forEach((col, idx) => {
    const width = col.width || 18;
    xml += `    <col min="${idx + 1}" max="${idx + 1}" width="${width}" customWidth="1"/>\n`;
  });
  xml += '  </cols>\n';

  xml += '  <sheetData>\n';
  let currentRow = 1;

  // Row 1: Main Banner Title
  xml += `    <row r="${currentRow}" ht="36" customHeight="1">\n`;
  for (let c = 1; c <= colCount; c++) {
    const rRef = `${colToLetter(c)}${currentRow}`;
    const val = c === 1 ? escapeXml(title) : '';
    xml += `      <c r="${rRef}" s="1" t="inlineStr"><is><t>${val}</t></is></c>\n`;
  }
  xml += '    </row>\n';
  currentRow++;

  // Row 2: Subtitle / Event Parameters
  xml += `    <row r="${currentRow}" ht="24" customHeight="1">\n`;
  for (let c = 1; c <= colCount; c++) {
    const rRef = `${colToLetter(c)}${currentRow}`;
    const val = c === 1 ? escapeXml(subtitle) : '';
    xml += `      <c r="${rRef}" s="2" t="inlineStr"><is><t>${val}</t></is></c>\n`;
  }
  xml += '    </row>\n';
  currentRow++;

  // Row 3: Meta & Generation Timestamp
  xml += `    <row r="${currentRow}" ht="20" customHeight="1">\n`;
  for (let c = 1; c <= colCount; c++) {
    const rRef = `${colToLetter(c)}${currentRow}`;
    const val = c === 1 ? escapeXml(meta) : '';
    xml += `      <c r="${rRef}" s="2" t="inlineStr"><is><t>${val}</t></is></c>\n`;
  }
  xml += '    </row>\n';
  currentRow++;

  // Row 4: Empty buffer
  xml += `    <row r="${currentRow}" ht="14" customHeight="1"/>\n`;
  currentRow++;

  // Rows 5-6: KPI Stat Boxes (if provided)
  const merges = [
    `A1:${endColLetter}1`,
    `A2:${endColLetter}2`,
    `A3:${endColLetter}3`
  ];

  if (kpis.length > 0) {
    const kpiRowValue = currentRow;
    const kpiRowLabel = currentRow + 1;

    xml += `    <row r="${kpiRowValue}" ht="26" customHeight="1">\n`;
    kpis.forEach((kpi, idx) => {
      const startC = idx * 3 + 1;
      const endC = startC + 1;
      const r1 = `${colToLetter(startC)}${kpiRowValue}`;
      const r2 = `${colToLetter(endC)}${kpiRowValue}`;
      xml += `      <c r="${r1}" s="12" t="inlineStr"><is><t>${escapeXml(kpi.value)}</t></is></c>\n`;
      xml += `      <c r="${r2}" s="12" t="inlineStr"><is><t></t></is></c>\n`;
      merges.push(`${colToLetter(startC)}${kpiRowValue}:${colToLetter(endC)}${kpiRowValue}`);
    });
    xml += '    </row>\n';

    xml += `    <row r="${kpiRowLabel}" ht="18" customHeight="1">\n`;
    kpis.forEach((kpi, idx) => {
      const startC = idx * 3 + 1;
      const endC = startC + 1;
      const r1 = `${colToLetter(startC)}${kpiRowLabel}`;
      const r2 = `${colToLetter(endC)}${kpiRowLabel}`;
      xml += `      <c r="${r1}" s="13" t="inlineStr"><is><t>${escapeXml(kpi.label)}</t></is></c>\n`;
      xml += `      <c r="${r2}" s="13" t="inlineStr"><is><t></t></is></c>\n`;
      merges.push(`${colToLetter(startC)}${kpiRowLabel}:${colToLetter(endC)}${kpiRowLabel}`);
    });
    xml += '    </row>\n';

    currentRow += 2;
    // Buffer row
    xml += `    <row r="${currentRow}" ht="14" customHeight="1"/>\n`;
    currentRow++;
  }

  // Row: Table Headers
  const tableHeaderRow = currentRow;
  xml += `    <row r="${tableHeaderRow}" ht="28" customHeight="1">\n`;
  columns.forEach((col, idx) => {
    const cellRef = `${colToLetter(idx + 1)}${tableHeaderRow}`;
    const styleId = col.align === 'left' ? '4' : '3';
    xml += `      <c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t>${escapeXml(col.label)}</t></is></c>\n`;
  });
  xml += '    </row>\n';
  currentRow++;

  // Data Rows
  rows.forEach((row, rIdx) => {
    const isZebra = rIdx % 2 === 1;
    xml += `    <row r="${currentRow}" ht="22" customHeight="1">\n`;

    columns.forEach((col, cIdx) => {
      const cellRef = `${colToLetter(cIdx + 1)}${currentRow}`;
      const rawVal = row[col.key];
      const valStr = rawVal === null || rawVal === undefined ? '' : String(rawVal);

      // Determine style based on content type and zebra striping
      let styleId = '0'; // default normal left
      if (col.type === 'track') {
        const lower = valStr.toLowerCase();
        if (lower.includes('virtual')) {
          styleId = '8'; // mint badge
        } else if (lower.includes('physical')) {
          styleId = '9'; // amber badge
        } else {
          styleId = isZebra ? '7' : '6';
        }
      } else if (col.type === 'role') {
        const lower = valStr.toLowerCase();
        if (lower.includes('leader') || lower.includes('lead')) {
          styleId = isZebra ? '11' : '10'; // emerald leader bold
        } else {
          styleId = isZebra ? '7' : '6';
        }
      } else if (col.align === 'center') {
        styleId = isZebra ? '7' : '6';
      } else {
        styleId = isZebra ? '5' : '0';
      }

      xml += `      <c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t>${escapeXml(valStr)}</t></is></c>\n`;
    });

    xml += '    </row>\n';
    currentRow++;
  });

  xml += '  </sheetData>\n';

  // Merge Cells
  if (merges.length > 0) {
    xml += `  <mergeCells count="${merges.length}">\n`;
    merges.forEach((m) => {
      xml += `    <mergeCell ref="${m}"/>\n`;
    });
    xml += '  </mergeCells>\n';
  }

  xml += '</worksheet>';
  return xml;
}

/**
 * Builds an Event Summary & Statistics sheet XML.
 */
function buildSummaryWorksheetXml({ event, summary, teams = [] }) {
  const colCount = 6;
  const endColLetter = colToLetter(colCount);

  const eventName = event?.EventName || 'AYOJAN Event';
  const eventType = event?.EventType || 'Hackathon';
  const mode = event?.HackathonMode || 'Virtual & Physical';
  const dates = `${event?.StartDate || 'TBA'} to ${event?.EndDate || 'TBA'}`;
  const location = event?.Location || 'AYOJAN Hub Campus';

  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n';

  xml += '  <cols>\n';
  xml += '    <col min="1" max="1" width="6" customWidth="1"/>\n';
  xml += '    <col min="2" max="2" width="28" customWidth="1"/>\n';
  xml += '    <col min="3" max="3" width="34" customWidth="1"/>\n';
  xml += '    <col min="4" max="4" width="20" customWidth="1"/>\n';
  xml += '    <col min="5" max="5" width="24" customWidth="1"/>\n';
  xml += '    <col min="6" max="6" width="20" customWidth="1"/>\n';
  xml += '  </cols>\n';

  xml += '  <sheetData>\n';
  let cur = 1;

  // Banner
  xml += `    <row r="${cur}" ht="36" customHeight="1">\n`;
  for (let c = 1; c <= colCount; c++) {
    xml += `      <c r="${colToLetter(c)}${cur}" s="1" t="inlineStr"><is><t>${c === 1 ? escapeXml(`${eventName} — Event Summary & Telemetry`) : ''}</t></is></c>\n`;
  }
  xml += '    </row>\n';
  cur++;

  xml += `    <row r="${cur}" ht="24" customHeight="1">\n`;
  for (let c = 1; c <= colCount; c++) {
    xml += `      <c r="${colToLetter(c)}${cur}" s="2" t="inlineStr"><is><t>${c === 1 ? escapeXml(`Mode: ${mode}  |  Category: ${eventType}  |  Schedule: ${dates}`) : ''}</t></is></c>\n`;
  }
  xml += '    </row>\n';
  cur++;

  // Buffer
  xml += `    <row r="${cur}" ht="16" customHeight="1"/>\n`;
  cur++;

  // Section 1 Header
  xml += `    <row r="${cur}" ht="26" customHeight="1">\n`;
  xml += `      <c r="A${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="B${cur}" s="14" t="inlineStr"><is><t>1. EVENT SPECIFICATIONS &amp; CONFIGURATION</t></is></c>\n`;
  xml += `      <c r="C${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="D${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="E${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="F${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += '    </row>\n';
  cur++;

  const specs = [
    ['Event Title', eventName],
    ['Event ID', `#EVT-${event?.Id || 'N/A'}`],
    ['Event Type', eventType],
    ['Execution Mode', mode],
    ['Campus / Venue', location],
    ['Event Schedule', dates],
    ['Configured Team Size', event?.TeamSize || '2 - 4 Members'],
    ['Export Timestamp', new Date().toLocaleString('en-IN', { timeZoneName: 'short' })]
  ];

  specs.forEach(([param, val], idx) => {
    const isZebra = idx % 2 === 1;
    xml += `    <row r="${cur}" ht="22" customHeight="1">\n`;
    xml += `      <c r="A${cur}" s="${isZebra ? '7' : '6'}" t="inlineStr"><is><t>${idx + 1}</t></is></c>\n`;
    xml += `      <c r="B${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t>${escapeXml(param)}</t></is></c>\n`;
    xml += `      <c r="C${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>\n`;
    xml += `      <c r="D${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t></t></is></c>\n`;
    xml += `      <c r="E${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t></t></is></c>\n`;
    xml += `      <c r="F${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t></t></is></c>\n`;
    xml += '    </row>\n';
    cur++;
  });

  // Buffer
  xml += `    <row r="${cur}" ht="16" customHeight="1"/>\n`;
  cur++;

  // Section 2: Registration Statistics
  xml += `    <row r="${cur}" ht="26" customHeight="1">\n`;
  xml += `      <c r="A${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="B${cur}" s="14" t="inlineStr"><is><t>2. REGISTRATION TELEMETRY &amp; BREAKDOWN</t></is></c>\n`;
  xml += `      <c r="C${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="D${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="E${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += `      <c r="F${cur}" s="14" t="inlineStr"><is><t></t></is></c>\n`;
  xml += '    </row>\n';
  cur++;

  const metrics = [
    ['Total Registered Teams', summary?.totalTeams || teams.length],
    ['Total Registered Participants', summary?.totalMembers || 0],
    ['Virtual Track Teams', summary?.virtualTeams || 0],
    ['Virtual Track Participants', summary?.virtualMembers || 0],
    ['Physical On-Campus Teams', summary?.physicalTeams || 0],
    ['Physical On-Campus Participants', summary?.physicalMembers || 0]
  ];

  metrics.forEach(([stat, val], idx) => {
    const isZebra = idx % 2 === 1;
    xml += `    <row r="${cur}" ht="22" customHeight="1">\n`;
    xml += `      <c r="A${cur}" s="${isZebra ? '7' : '6'}" t="inlineStr"><is><t>${idx + 1}</t></is></c>\n`;
    xml += `      <c r="B${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t>${escapeXml(stat)}</t></is></c>\n`;
    xml += `      <c r="C${cur}" s="${isZebra ? '7' : '6'}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>\n`;
    xml += `      <c r="D${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t></t></is></c>\n`;
    xml += `      <c r="E${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t></t></is></c>\n`;
    xml += `      <c r="F${cur}" s="${isZebra ? '5' : '0'}" t="inlineStr"><is><t></t></is></c>\n`;
    xml += '    </row>\n';
    cur++;
  });

  xml += '  </sheetData>\n';

  const merges = [
    `A1:${endColLetter}1`,
    `A2:${endColLetter}2`
  ];

  xml += `  <mergeCells count="${merges.length}">\n`;
  merges.forEach((m) => {
    xml += `    <mergeCell ref="${m}"/>\n`;
  });
  xml += '  </mergeCells>\n';

  xml += '</worksheet>';
  return xml;
}

/**
 * Normalizes member rows from teams data to ensure every member detail is present line-wise.
 */
export function normalizeRegistrationRows(teams = [], members = []) {
  const flat = [];
  let counter = 1;

  // If teams are provided, iterate team by team and list all members line-wise
  if (Array.isArray(teams) && teams.length > 0) {
    teams.forEach((t) => {
      const teamId = t.Id || t.TeamId || 'N/A';
      const teamName = t.TeamName || 'Unnamed Team';
      const track = (t.ParticipationMode || 'Physical').toUpperCase();
      const regDate = t.RegistrationDate || t.CreatedAt
        ? new Date(t.RegistrationDate || t.CreatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Registered';
      const probTitle = t.ProblemTitle || 'Not Selected';
      const accom = t.AccommodationRequested ? 'Requested' : 'Not Needed';
      const food = t.FoodAccepted ? 'Opted' : 'Not Opted';

      let teamMembers = Array.isArray(t.members) && t.members.length > 0
        ? [...t.members]
        : [];

      // If no members array on team, check if global members list has them
      if (teamMembers.length === 0 && Array.isArray(members) && members.length > 0) {
        teamMembers = members.filter(m => String(m.TeamId) === String(teamId));
      }

      // If still empty, add team leader as primary member
      if (teamMembers.length === 0) {
        teamMembers = [
          {
            Name: t.LeaderName || t.UserName || 'Team Leader',
            Email: t.LeaderEmail || t.Email || '',
            Mobile: t.LeaderMobile || t.Mobile || '',
            Role: 'Team Leader',
            IsLeader: true,
            College: t.College || '',
            State: t.State || '',
            Gender: t.Gender || 'Not Specified'
          }
        ];
      }

      // Sort so Team Leader is always first row for the team
      teamMembers.sort((a, b) => {
        const aLead = a.IsLeader || String(a.Role || '').toLowerCase().includes('lead');
        const bLead = b.IsLeader || String(b.Role || '').toLowerCase().includes('lead');
        if (aLead && !bLead) return -1;
        if (!aLead && bLead) return 1;
        return 0;
      });

      teamMembers.forEach((m) => {
        const roleLower = String(m.Role || '').toLowerCase();
        const isLeader = m.IsLeader || roleLower.includes('lead') || roleLower === 'teamlead';
        flat.push({
          sno: String(counter++).padStart(2, '0'),
          teamId: `TM-${teamId}`,
          teamName,
          track,
          role: isLeader ? 'Team Leader' : (m.Role || 'Team Member'),
          name: m.Name || m.MemberName || m.UserName || (isLeader ? t.LeaderName : 'Member'),
          email: m.Email || m.MemberEmail || (isLeader ? t.LeaderEmail : ''),
          mobile: m.Mobile || m.MemberMobile || m.PhoneNumber || (isLeader ? t.LeaderMobile : '') || 'N/A',
          gender: m.Gender || m.MemberGender || 'Not Specified',
          college: m.College || m.MemberCollege || t.College || 'N/A',
          state: m.State || m.MemberState || t.State || 'N/A',
          registeredOn: regDate,
          problemTitle: probTitle,
          accommodation: accom,
          foodChoice: food
        });
      });
    });

    return flat;
  }

  // Fallback: If only raw members array is provided
  if (Array.isArray(members) && members.length > 0) {
    return members.map((m, idx) => ({
      sno: String(idx + 1).padStart(2, '0'),
      teamId: `TM-${m.TeamId || 'N/A'}`,
      teamName: m.TeamName || 'Unnamed Team',
      track: (m.ParticipationMode || 'Physical').toUpperCase(),
      role: m.Role || (m.IsLeader ? 'Team Leader' : 'Team Member'),
      name: m.Name || m.MemberName || 'Member',
      email: m.Email || m.MemberEmail || 'N/A',
      mobile: m.Mobile || m.MemberMobile || m.PhoneNumber || 'N/A',
      gender: m.Gender || m.MemberGender || 'Not Specified',
      college: m.College || m.MemberCollege || 'N/A',
      state: m.State || m.MemberState || 'N/A',
      registeredOn: m.RegistrationDate ? new Date(m.RegistrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Registered',
      problemTitle: m.ProblemTitle || 'Not Selected',
      accommodation: m.AccommodationRequested ? 'Requested' : 'Not Needed',
      foodChoice: m.FoodAccepted ? 'Opted' : 'Not Opted'
    }));
  }

  return [];
}

/**
 * Standard table column configuration.
 */
function getStandardColumns(eventType = 'Hackathon') {
  const isSolo = ['workshop', 'webinar', 'seminar', 'conference'].includes(eventType.toLowerCase());
  return [
    { key: 'sno', label: '#', width: 6, align: 'center' },
    { key: 'teamId', label: isSolo ? 'Registration ID' : 'Team ID', width: 14, align: 'center' },
    { key: 'teamName', label: isSolo ? 'Organization / Institute' : 'Team Name', width: 26, align: 'left' },
    { key: 'track', label: isSolo ? 'Pass Format' : 'Track', width: 14, align: 'center', type: 'track' },
    { key: 'role', label: 'Role / Designation', width: 16, align: 'center', type: 'role' },
    { key: 'name', label: isSolo ? 'Attendee Name' : 'Participant Name', width: 24, align: 'left' },
    { key: 'email', label: 'Email Address', width: 30, align: 'left' },
    { key: 'mobile', label: 'Mobile Number', width: 16, align: 'center' },
    { key: 'gender', label: 'Gender', width: 12, align: 'center' },
    { key: 'college', label: 'College / University', width: 32, align: 'left' },
    { key: 'state', label: 'State', width: 16, align: 'left' },
    { key: 'registeredOn', label: 'Registered On', width: 15, align: 'center' },
    { key: 'problemTitle', label: eventType.toLowerCase() === 'project expo' ? 'Project Title' : 'Problem Statement', width: 28, align: 'left' },
    { key: 'accommodation', label: 'Accommodation', width: 15, align: 'center' },
    { key: 'foodChoice', label: 'Food Option', width: 14, align: 'center' }
  ];
}

/**
 * Main export function:
 * Generates and downloads a styled multi-sheet OpenXML .xlsx file.
 *
 * @param {Object} options
 * @param {Object} options.event Event details
 * @param {Array} options.teams Array of teams
 * @param {Array} options.members Array of full member records
 * @param {Object} options.summary Summary counts
 * @param {string} options.filterMode 'all' | 'virtual' | 'physical' | 'current'
 * @param {string} options.customFilename Optional filename
 */
export async function downloadRegistrationsWorkbook({
  event = {},
  teams = [],
  members = [],
  summary = null,
  filterMode = 'all',
  customFilename = ''
}) {
  const eventName = event?.EventName || 'AYOJAN Event';
  const eventType = event?.EventType || 'Hackathon';
  const mode = event?.HackathonMode || 'Virtual & Physical';
  const dates = `${event?.StartDate || 'TBA'} - ${event?.EndDate || 'TBA'}`;
  const location = event?.Location || 'AYOJAN Hub Campus';
  const timestamp = new Date().toLocaleString('en-IN', { timeZoneName: 'short' });

  // Normalize full rows
  const allRows = normalizeRegistrationRows(teams, members);

  // Compute live summary if not provided
  const virtualRows = allRows.filter((r) => r.track.includes('VIRTUAL') || r.track.includes('BOTH') || r.track.includes('HYBRID'));
  const physicalRows = allRows.filter((r) => r.track.includes('PHYSICAL') || r.track.includes('BOTH') || r.track.includes('HYBRID'));

  const finalSummary = summary || {
    totalTeams: teams.length,
    totalMembers: allRows.length,
    virtualTeams: teams.filter((t) => String(t.ParticipationMode || '').toLowerCase().includes('virtual')).length,
    physicalTeams: teams.filter((t) => String(t.ParticipationMode || '').toLowerCase().includes('physical')).length,
    virtualMembers: virtualRows.length,
    physicalMembers: physicalRows.length
  };

  const columns = getStandardColumns(eventType);

  const zip = new JSZip();

  // Determine which sheets to build
  const sheetsToCreate = [];

  if (filterMode === 'all') {
    // 1. All Registrations Sheet
    sheetsToCreate.push({
      name: 'All Registrations',
      xml: buildWorksheetXml({
        title: `AYOJAN // ${eventName.toUpperCase()} — ALL CONFIRMED REGISTRATIONS`,
        subtitle: `Track: Universal (${mode})  |  Category: ${eventType}  |  Dates: ${dates}  |  Venue: ${location}`,
        meta: `Exported on ${timestamp}  |  Total Teams: ${finalSummary.totalTeams}  |  Total Participants: ${finalSummary.totalMembers}`,
        kpis: [
          { label: 'Total Teams', value: finalSummary.totalTeams },
          { label: 'Total Members', value: finalSummary.totalMembers },
          { label: 'Virtual Track', value: finalSummary.virtualTeams },
          { label: 'Physical Track', value: finalSummary.physicalTeams }
        ],
        columns,
        rows: allRows
      })
    });

    // 2. Virtual Track Sheet
    sheetsToCreate.push({
      name: 'Virtual Track',
      xml: buildWorksheetXml({
        title: `AYOJAN // ${eventName.toUpperCase()} — VIRTUAL TRACK DIRECTORY`,
        subtitle: `Track: Virtual Track (Online)  |  Category: ${eventType}  |  Live Platform Access Enabled`,
        meta: `Exported on ${timestamp}  |  Virtual Teams: ${finalSummary.virtualTeams}  |  Virtual Participants: ${finalSummary.virtualMembers}`,
        kpis: [
          { label: 'Virtual Teams', value: finalSummary.virtualTeams },
          { label: 'Virtual Delegates', value: finalSummary.virtualMembers }
        ],
        columns,
        rows: virtualRows
      })
    });

    // 3. Physical Track Sheet
    sheetsToCreate.push({
      name: 'Physical Track',
      xml: buildWorksheetXml({
        title: `AYOJAN // ${eventName.toUpperCase()} — PHYSICAL ON-CAMPUS DIRECTORY`,
        subtitle: `Track: Physical Track (On-Campus)  |  Venue: ${location}  |  Accommodation & Meals Tracked`,
        meta: `Exported on ${timestamp}  |  Physical Teams: ${finalSummary.physicalTeams}  |  On-Campus Participants: ${finalSummary.physicalMembers}`,
        kpis: [
          { label: 'Physical Teams', value: finalSummary.physicalTeams },
          { label: 'On-Campus Members', value: finalSummary.physicalMembers }
        ],
        columns,
        rows: physicalRows
      })
    });

    // 4. Event Summary Sheet
    sheetsToCreate.push({
      name: 'Event Summary',
      xml: buildSummaryWorksheetXml({ event, summary: finalSummary, teams })
    });
  } else if (filterMode === 'virtual') {
    sheetsToCreate.push({
      name: 'Virtual Track Registrations',
      xml: buildWorksheetXml({
        title: `AYOJAN // ${eventName.toUpperCase()} — VIRTUAL TRACK DIRECTORY`,
        subtitle: `Track: Virtual Track (Online)  |  Category: ${eventType}  |  Platform Access Enabled`,
        meta: `Exported on ${timestamp}  |  Virtual Teams: ${finalSummary.virtualTeams}  |  Virtual Participants: ${finalSummary.virtualMembers}`,
        kpis: [
          { label: 'Virtual Teams', value: finalSummary.virtualTeams },
          { label: 'Virtual Delegates', value: finalSummary.virtualMembers }
        ],
        columns,
        rows: virtualRows
      })
    });
    sheetsToCreate.push({
      name: 'Event Summary',
      xml: buildSummaryWorksheetXml({ event, summary: finalSummary, teams })
    });
  } else if (filterMode === 'physical') {
    sheetsToCreate.push({
      name: 'Physical Track Registrations',
      xml: buildWorksheetXml({
        title: `AYOJAN // ${eventName.toUpperCase()} — PHYSICAL ON-CAMPUS DIRECTORY`,
        subtitle: `Track: Physical Track (On-Campus)  |  Venue: ${location}  |  Accommodation & Food`,
        meta: `Exported on ${timestamp}  |  Physical Teams: ${finalSummary.physicalTeams}  |  On-Campus Participants: ${finalSummary.physicalMembers}`,
        kpis: [
          { label: 'Physical Teams', value: finalSummary.physicalTeams },
          { label: 'On-Campus Members', value: finalSummary.physicalMembers }
        ],
        columns,
        rows: physicalRows
      })
    });
    sheetsToCreate.push({
      name: 'Event Summary',
      xml: buildSummaryWorksheetXml({ event, summary: finalSummary, teams })
    });
  } else {
    // Current filtered view
    sheetsToCreate.push({
      name: 'Registrations',
      xml: buildWorksheetXml({
        title: `AYOJAN // ${eventName.toUpperCase()} — ACTIVE FILTERED REGISTRATIONS`,
        subtitle: `Event: ${eventName}  |  Category: ${eventType}  |  Schedule: ${dates}`,
        meta: `Exported on ${timestamp}  |  Matching Records: ${allRows.length}`,
        kpis: [
          { label: 'Exported Records', value: allRows.length }
        ],
        columns,
        rows: allRows
      })
    });
  }

  // 1. [Content_Types].xml
  let ctXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  ctXml += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n';
  ctXml += '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n';
  ctXml += '  <Default Extension="xml" ContentType="application/xml"/>\n';
  ctXml += '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\n';
  ctXml += '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>\n';
  sheetsToCreate.forEach((_, idx) => {
    ctXml += `  <Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n`;
  });
  ctXml += '</Types>';
  zip.file('[Content_Types].xml', ctXml);

  // 2. _rels/.rels
  zip.folder('_rels').file(
    '.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
    '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\n' +
    '</Relationships>'
  );

  // 3. xl/_rels/workbook.xml.rels
  let wbRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  wbRelsXml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';
  sheetsToCreate.forEach((_, idx) => {
    wbRelsXml += `  <Relationship Id="rIdSheet${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>\n`;
  });
  wbRelsXml += `  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;
  wbRelsXml += '</Relationships>';
  zip.folder('xl').folder('_rels').file('workbook.xml.rels', wbRelsXml);

  // 4. xl/workbook.xml
  let wbXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  wbXml += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';
  wbXml += '  <sheets>\n';
  sheetsToCreate.forEach((s, idx) => {
    wbXml += `    <sheet name="${escapeXml(s.name)}" sheetId="${idx + 1}" r:id="rIdSheet${idx + 1}"/>\n`;
  });
  wbXml += '  </sheets>\n</workbook>';
  zip.folder('xl').file('workbook.xml', wbXml);

  // 5. xl/styles.xml
  zip.folder('xl').file('styles.xml', generateStylesXml());

  // 6. xl/worksheets/sheet*.xml
  sheetsToCreate.forEach((s, idx) => {
    zip.folder('xl').folder('worksheets').file(`sheet${idx + 1}.xml`, s.xml);
  });

  // Generate binary package
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // Generate clean filename
  const cleanName = eventName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const trackSuffix = filterMode === 'virtual' ? '_Virtual_Track' : filterMode === 'physical' ? '_Physical_Track' : '_All_Registrations';
  const finalFilename = customFilename || `AYOJAN_${cleanName}${trackSuffix}_${dateStr}.xlsx`;

  // Trigger browser download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 300);

  return { success: true, filename: finalFilename, count: allRows.length };
}

/**
 * Downloads a professionally styled Demo Excel Template for Virtual Event
 * Themes and Problem Statements.
 */
export async function downloadPSTemplateWorkbook({ eventName = 'Hackathon' } = {}) {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
  zip.file('[Content_Types].xml', contentTypesXml);

  // 2. _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  zip.folder('_rels').file('.rels', rootRelsXml);

  // 3. xl/_rels/workbook.xml.rels
  const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdSheet1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rIdSheet2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  zip.folder('xl').folder('_rels').file('workbook.xml.rels', wbRelsXml);

  // 4. xl/workbook.xml
  const wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Problem Statements" sheetId="1" r:id="rIdSheet1"/>
    <sheet name="Themes" sheetId="2" r:id="rIdSheet2"/>
  </sheets>
</workbook>`;
  zip.folder('xl').file('workbook.xml', wbXml);

  // 5. xl/styles.xml
  zip.folder('xl').file('styles.xml', generateStylesXml());

  // Define Demo Sheets
  const psColumns = [
    { key: 'seq', label: '#', width: 6, align: 'center' },
    { key: 'problemCode', label: 'Problem Code *', width: 16, align: 'center' },
    { key: 'theme', label: 'Theme *', width: 30, align: 'left' },
    { key: 'title', label: 'Problem Statement Title *', width: 42, align: 'left' },
    { key: 'category', label: 'Category', width: 16, align: 'center' },
    { key: 'description', label: 'Description', width: 60, align: 'left' },
    { key: 'maxTeams', label: 'Max Teams', width: 12, align: 'center' }
  ];

  const psSampleRows = [
    {
      seq: 1,
      problemCode: 'AI-01',
      theme: 'Artificial Intelligence & ML',
      title: 'Automated Clinical Diagnostic Assistant',
      category: 'Software',
      description: 'Build an AI assistant that extracts clinical EHR data and aids triage decision-making with explainable predictions.',
      maxTeams: 5
    },
    {
      seq: 2,
      problemCode: 'AI-02',
      theme: 'Artificial Intelligence & ML',
      title: 'Real-Time Disaster Damage Assessment',
      category: 'Software',
      description: 'Analyze drone and satellite feeds to map collapsed structures, road closures, and flood zones during natural emergencies.',
      maxTeams: 5
    },
    {
      seq: 3,
      problemCode: 'BC-01',
      theme: 'Web3 & Blockchain',
      title: 'Decentralized Academic Credential Verification',
      category: 'Software',
      description: 'Issue tamper-proof university degrees and transcripts using zero-knowledge credentials and decentralized identities.',
      maxTeams: 4
    },
    {
      seq: 4,
      problemCode: 'IOT-01',
      theme: 'Smart Cities & IoT',
      title: 'Acoustic Pipeline Micro-Leak Detection System',
      category: 'Hardware',
      description: 'Deploy low-power LoRaWAN acoustic sensors across city pipelines to pinpoint underground potable water loss in real-time.',
      maxTeams: 3
    },
    {
      seq: 5,
      problemCode: 'FIN-01',
      theme: 'FinTech & Cybersecurity',
      title: 'Autonomous Graph Engine for Mule Account Detection',
      category: 'Software',
      description: 'Train graph neural networks on high-velocity transaction streams to uncover money laundering rings and synthetic identities.',
      maxTeams: 5
    },
    {
      seq: 6,
      problemCode: 'OPEN-01',
      theme: 'Open Innovation',
      title: 'Audio-Spatial Indoor Navigation for Visually Impaired',
      category: 'Software',
      description: 'Develop an edge-AI spatial audio guidance system enabling visually impaired individuals to navigate educational campuses.',
      maxTeams: 5
    }
  ];

  const themeColumns = [
    { key: 'seq', label: '#', width: 6, align: 'center' },
    { key: 'themeName', label: 'Theme Name *', width: 32, align: 'left' },
    { key: 'description', label: 'Theme Description', width: 65, align: 'left' },
    { key: 'displayOrder', label: 'Display Order', width: 14, align: 'center' }
  ];

  const themeSampleRows = [
    {
      seq: 1,
      themeName: 'Artificial Intelligence & ML',
      description: 'Machine learning, generative AI, computer vision, natural language processing, and autonomous agent systems.',
      displayOrder: 1
    },
    {
      seq: 2,
      themeName: 'Web3 & Blockchain',
      description: 'Decentralized protocols, smart contract security, zero-knowledge proofs, and digital identity infrastructure.',
      displayOrder: 2
    },
    {
      seq: 3,
      themeName: 'Smart Cities & IoT',
      description: 'Urban automation, edge IoT sensor networks, intelligent traffic systems, and sustainable municipal grids.',
      displayOrder: 3
    },
    {
      seq: 4,
      themeName: 'FinTech & Cybersecurity',
      description: 'Payment systems, automated compliance, threat intelligence, algorithmic fraud defense, and cryptographic key management.',
      displayOrder: 4
    },
    {
      seq: 5,
      themeName: 'Open Innovation',
      description: 'Cross-disciplinary moonshots, wildcard technologies, accessibility tools, and high-impact social engineering solutions.',
      displayOrder: 5
    }
  ];

  const psSheetXml = generateSheetXml({
    sheetName: 'Problem Statements',
    eventName,
    subtitle: 'PROBLEM STATEMENTS BULK UPLOAD TEMPLATE',
    columns: psColumns,
    rows: psSampleRows,
    kpis: [
      { label: 'SAMPLE STATEMENTS', value: String(psSampleRows.length) },
      { label: 'CATEGORIES', value: 'Software, Hardware' },
      { label: 'FORMAT', value: 'OpenXML (.xlsx)' }
    ]
  });

  const themeSheetXml = generateSheetXml({
    sheetName: 'Themes',
    eventName,
    subtitle: 'HACKATHON THEMES BULK UPLOAD TEMPLATE',
    columns: themeColumns,
    rows: themeSampleRows,
    kpis: [
      { label: 'SAMPLE THEMES', value: String(themeSampleRows.length) },
      { label: 'ORDERING', value: '1, 2, 3...' },
      { label: 'STATUS', value: 'Auto-Linked' }
    ]
  });

  zip.folder('xl').folder('worksheets').file('sheet1.xml', psSheetXml);
  zip.folder('xl').folder('worksheets').file('sheet2.xml', themeSheetXml);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const cleanName = eventName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AYOJAN_${cleanName}_Problem_Statements_and_Themes_Template.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 300);

  return { success: true, filename };
}

// Helper: Convert column letter to index: 'A' -> 0, 'Z' -> 25, 'AA' -> 26
function colLetterToIndex(col) {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx - 1;
}

// Parse cell reference like 'A1' -> { col: 0, row: 1 }
function parseCellRef(ref) {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return {
    col: colLetterToIndex(match[1]),
    row: parseInt(match[2], 10)
  };
}

/**
 * Parses an Excel (.xlsx) file using JSZip and extracts all sheets as arrays of row arrays.
 */
export async function parseXlsxWorkbook(arrayBufferOrBlob) {
  const zip = await JSZip.loadAsync(arrayBufferOrBlob);

  // 1. Shared Strings
  const sharedStrings = [];
  const sstFile = zip.file('xl/sharedStrings.xml');
  if (sstFile) {
    const sstXml = await sstFile.async('text');
    const siMatches = sstXml.match(/<si\b[^>]*>([\s\S]*?)<\/si>/g) || [];
    for (const si of siMatches) {
      const tMatches = si.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [];
      const text = tMatches
        .map(t => t.replace(/<t\b[^>]*>/, '').replace(/<\/t>/, ''))
        .join('')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      sharedStrings.push(text);
    }
  }

  // 2. Map sheet names
  const sheetMap = [];
  const wbFile = zip.file('xl/workbook.xml');
  const relsFile = zip.file('xl/_rels/workbook.xml.rels');
  const relMap = {};

  if (relsFile) {
    const relsXml = await relsFile.async('text');
    const relMatches = relsXml.match(/<Relationship\b[^>]*\/>/g) || [];
    for (const r of relMatches) {
      const idMatch = r.match(/Id="([^"]+)"/);
      const targetMatch = r.match(/Target="([^"]+)"/);
      if (idMatch && targetMatch) {
        let target = targetMatch[1];
        if (!target.startsWith('xl/')) {
          target = 'xl/' + target.replace(/^\//, '');
        }
        relMap[idMatch[1]] = target;
      }
    }
  }

  if (wbFile) {
    const wbXml = await wbFile.async('text');
    const sheetMatches = wbXml.match(/<sheet\b[^>]*\/>/g) || [];
    let idx = 1;
    for (const s of sheetMatches) {
      const nameMatch = s.match(/name="([^"]+)"/);
      const rIdMatch = s.match(/r:id="([^"]+)"/);
      const name = nameMatch ? nameMatch[1] : `Sheet${idx}`;
      let targetPath = rIdMatch ? relMap[rIdMatch[1]] : null;
      if (!targetPath) {
        targetPath = `xl/worksheets/sheet${idx}.xml`;
      }
      sheetMap.push({ name, path: targetPath });
      idx++;
    }
  }

  if (sheetMap.length === 0) {
    zip.forEach((path) => {
      if (path.startsWith('xl/worksheets/sheet') && path.endsWith('.xml')) {
        sheetMap.push({ name: path.replace('xl/worksheets/', '').replace('.xml', ''), path });
      }
    });
  }

  // 3. Parse each sheet
  const sheets = {};
  for (const sheet of sheetMap) {
    const file = zip.file(sheet.path);
    if (!file) continue;
    const xml = await file.async('text');
    const rowMatches = xml.match(/<row\b[^>]*>([\s\S]*?)<\/row>/g) || [];
    const rows = [];

    for (const rowXml of rowMatches) {
      const cellMatches = rowXml.match(/<c\b[^>]*>([\s\S]*?)<\/c>|<c\b[^>]*\/>/g) || [];
      const rowData = [];

      for (const cellXml of cellMatches) {
        const rMatch = cellXml.match(/r="([A-Z]+\d+)"/);
        const tMatch = cellXml.match(/t="([^"]+)"/);
        const vMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
        const isMatch = cellXml.match(/<is>([\s\S]*?)<\/is>/);

        const ref = rMatch ? rMatch[1] : null;
        const cellPos = ref ? parseCellRef(ref) : null;
        const type = tMatch ? tMatch[1] : 'n';

        let val = '';
        if (type === 's' && vMatch) {
          const sIdx = parseInt(vMatch[1], 10);
          val = sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : '';
        } else if (type === 'inlineStr' && isMatch) {
          const tMatches = isMatch[1].match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [];
          val = tMatches.map(t => t.replace(/<t\b[^>]*>/, '').replace(/<\/t>/, '')).join('');
        } else if (vMatch) {
          val = vMatch[1];
        }

        val = String(val)
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim();

        if (cellPos) {
          rowData[cellPos.col] = val;
        } else {
          rowData.push(val);
        }
      }

      for (let i = 0; i < rowData.length; i++) {
        if (rowData[i] === undefined) rowData[i] = '';
      }
      if (rowData.some(cell => cell !== '')) {
        rows.push(rowData);
      }
    }
    sheets[sheet.name] = rows;
  }

  return sheets;
}

/**
 * Parses CSV raw text into rows array.
 */
function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  return lines.map(line => {
    const row = [];
    let insideQuotes = false;
    let currentCell = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    return row;
  });
}

/**
 * Parses an uploaded file (.xlsx or .csv) and extracts themes & problem statements.
 */
export async function parsePSTemplateFile(file) {
  let sheets = {};
  const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel');

  if (isXlsx) {
    const arrayBuffer = await file.arrayBuffer();
    sheets = await parseXlsxWorkbook(arrayBuffer);
  } else {
    const text = await file.text();
    const rows = parseCsvText(text);
    sheets = { 'CSV Data': rows };
  }

  const themes = [];
  const problemStatements = [];
  const themeNamesSet = new Set();

  const normalizeKey = (k) => String(k || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [sheetName, rows] of Object.entries(sheets)) {
    if (!rows || rows.length === 0) continue;

    // Locate header row (first row with >= 2 non-empty values matching typical column names)
    let headerRowIdx = -1;
    let colMap = {};

    for (let r = 0; r < Math.min(rows.length, 12); r++) {
      const row = rows[r];
      const normCols = row.map(normalizeKey);

      const hasPsSignal = normCols.some(c => c.includes('problemcode') || c.includes('code') || c.includes('problemid')) &&
                          normCols.some(c => c.includes('title') || c.includes('problem') || c.includes('theme'));
      const hasThemeSignal = normCols.some(c => c.includes('themename') || (c.includes('theme') && !c.includes('statement')));

      if (hasPsSignal || hasThemeSignal || (normCols.includes('title') && normCols.includes('description'))) {
        headerRowIdx = r;
        normCols.forEach((col, idx) => {
          colMap[col] = idx;
        });
        break;
      }
    }

    if (headerRowIdx === -1) {
      // Fallback: use first row
      headerRowIdx = 0;
      rows[0].forEach((col, idx) => {
        colMap[normalizeKey(col)] = idx;
      });
    }

    const getVal = (row, keys, fallback = '') => {
      for (const k of keys) {
        for (const [colName, cIdx] of Object.entries(colMap)) {
          if (colName === k || colName.includes(k)) {
            if (row[cIdx] !== undefined && row[cIdx] !== '') {
              return String(row[cIdx]).trim();
            }
          }
        }
      }
      return fallback;
    };

    const isThemesSheet = normalizeKey(sheetName).includes('theme') && !normalizeKey(sheetName).includes('statement');

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || !row.some(c => c && String(c).trim() !== '')) continue;

      if (isThemesSheet) {
        const themeName = getVal(row, ['themename', 'theme', 'name', 'title']);
        const description = getVal(row, ['description', 'desc', 'overview']);
        const displayOrder = parseInt(getVal(row, ['displayorder', 'order', 'seq', 'id']), 10) || (themes.length + 1);

        if (themeName && !themeNamesSet.has(themeName.toLowerCase())) {
          themeNamesSet.add(themeName.toLowerCase());
          themes.push({
            ThemeName: themeName,
            Description: description,
            DisplayOrder: displayOrder
          });
        }
      } else {
        const title = getVal(row, ['title', 'problemtitlename', 'problemstatementtitle', 'problemstatement']);
        const problemCode = getVal(row, ['problemcode', 'code', 'pscode', 'id']);
        const theme = getVal(row, ['theme', 'themename', 'track', 'categoryname']);
        const category = getVal(row, ['category', 'type', 'tracktype'], 'Software');
        const description = getVal(row, ['description', 'desc', 'challenge', 'details']);
        const maxTeams = parseInt(getVal(row, ['maxteams', 'limit', 'maxteam']), 10) || 5;

        // Valid problem statement must have at least a Title or ProblemCode
        if (title || problemCode) {
          const finalCode = problemCode || `PS-${String(problemStatements.length + 1).padStart(2, '0')}`;
          const finalTitle = title || problemCode;
          const finalTheme = theme || 'General Innovation';

          problemStatements.push({
            ProblemCode: finalCode,
            Theme: finalTheme,
            Title: finalTitle,
            Category: category || 'Software',
            Description: description || '',
            MaxTeams: maxTeams > 0 ? maxTeams : 5,
            DisplayOrder: problemStatements.length + 1
          });

          // Auto-register theme if not present
          if (finalTheme && !themeNamesSet.has(finalTheme.toLowerCase())) {
            themeNamesSet.add(finalTheme.toLowerCase());
            themes.push({
              ThemeName: finalTheme,
              Description: `Innovation challenges under ${finalTheme}`,
              DisplayOrder: themes.length + 1
            });
          }
        }
      }
    }
  }

  return {
    themes,
    problemStatements,
    valid: themes.length > 0 || problemStatements.length > 0,
    summary: {
      themesCount: themes.length,
      psCount: problemStatements.length
    }
  };
}

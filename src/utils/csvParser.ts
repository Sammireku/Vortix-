import { InventoryItem, InventoryCategory, Employee } from '../types';

/**
 * Robust RFC 4180 compliant CSV line tokenizer.
 * Handles delimiters (comma, semicolon, tab), quotes, escaped quotes (""), and internal commas.
 */
export function tokenizeCsvLine(line: string, delimiter: string = ','): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  let insideQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        currentToken += '"';
        i += 2;
        continue;
      } else {
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    } else if (char === delimiter && !insideQuotes) {
      tokens.push(currentToken.trim());
      currentToken = '';
      i++;
      continue;
    } else {
      currentToken += char;
      i++;
    }
  }

  tokens.push(currentToken.trim());
  return tokens;
}

/**
 * Automatically detects whether CSV uses comma, semicolon, or tab as delimiter.
 */
export function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semiCount > commaCount && semiCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  return ',';
}

/**
 * Normalize and clean header strings to facilitate tolerant synonym mapping.
 */
export function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[\s\-_]+/g, '').trim();
}

export interface CsvParseResult<T> {
  validRecords: T[];
  errors: Array<{
    rowNumber: number;
    rawText: string;
    reason: string;
  }>;
  totalRows: number;
  validCount: number;
  errorCount: number;
}

/**
 * Robust Inventory CSV Parser
 */
export function parseInventoryCsv(csvText: string): CsvParseResult<InventoryItem> {
  const lines = csvText.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      validRecords: [],
      errors: [{ rowNumber: 1, rawText: csvText, reason: 'CSV must contain at least a header row and one data row.' }],
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = tokenizeCsvLine(lines[0], delimiter).map(normalizeHeader);

  // Map header index
  const getIndex = (synonyms: string[]) => {
    return headers.findIndex((h) => synonyms.some((syn) => h === normalizeHeader(syn)));
  };

  const skuIdx = getIndex(['sku', 'itemcode', 'code', 'partnumber', 'id']);
  const nameIdx = getIndex(['name', 'itemname', 'description', 'title', 'product']);
  const catIdx = getIndex(['category', 'type', 'group']);
  const qtyIdx = getIndex(['quantity', 'quantityonhand', 'qty', 'stock', 'onhand', 'count']);
  const minIdx = getIndex(['minsafetystock', 'safetystock', 'reorderpoint', 'min', 'minstock']);
  const unitIdx = getIndex(['unit', 'uom', 'measure']);
  const costIdx = getIndex(['unitcost', 'cost', 'price', 'rate']);
  const locIdx = getIndex(['warehouselocation', 'location', 'bin', 'shelf', 'warehouse']);
  const lotIdx = getIndex(['lotnumber', 'lot', 'batch', 'batchnumber']);
  const suppIdx = getIndex(['supplier', 'vendor', 'source']);

  const validRecords: InventoryItem[] = [];
  const errors: CsvParseResult<InventoryItem>['errors'] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const tokens = tokenizeCsvLine(rawLine, delimiter);
    const rowNumber = i + 1;

    // Check basic row structure
    if (tokens.length < 2) {
      errors.push({ rowNumber, rawText: rawLine, reason: 'Row does not contain sufficient columns.' });
      continue;
    }

    const sku = skuIdx >= 0 ? tokens[skuIdx] : tokens[0];
    const name = nameIdx >= 0 ? tokens[nameIdx] : tokens[1];

    if (!sku || sku.trim().length === 0) {
      errors.push({ rowNumber, rawText: rawLine, reason: 'Missing mandatory SKU / Item Code.' });
      continue;
    }

    if (!name || name.trim().length === 0) {
      errors.push({ rowNumber, rawText: rawLine, reason: 'Missing mandatory Item Name / Description.' });
      continue;
    }

    // Category mapping
    let category: InventoryCategory = 'raw_material';
    if (catIdx >= 0 && tokens[catIdx]) {
      const rawCat = tokens[catIdx].toLowerCase();
      if (rawCat.includes('wip') || rawCat.includes('progress')) {
        category = 'wip';
      } else if (rawCat.includes('finish') || rawCat.includes('product')) {
        category = 'finished_goods';
      } else if (rawCat.includes('tool') || rawCat.includes('supply')) {
        category = 'tooling_supplies';
      }
    }

    // Quantity validation
    const rawQty = qtyIdx >= 0 ? tokens[qtyIdx] : '0';
    const quantityOnHand = parseFloat(rawQty.replace(/[^0-9.-]+/g, ''));
    if (isNaN(quantityOnHand)) {
      errors.push({ rowNumber, rawText: rawLine, reason: `Invalid quantity number format: "${rawQty}".` });
      continue;
    }

    // Cost validation
    const rawCost = costIdx >= 0 ? tokens[costIdx] : '10.0';
    const unitCost = parseFloat(rawCost.replace(/[^0-9.-]+/g, ''));
    if (isNaN(unitCost)) {
      errors.push({ rowNumber, rawText: rawLine, reason: `Invalid unit cost number format: "${rawCost}".` });
      continue;
    }

    const rawMin = minIdx >= 0 ? tokens[minIdx] : '100';
    const minSafetyStock = Math.max(0, parseInt(rawMin.replace(/[^0-9-]+/g, ''), 10) || 50);

    const warehouseLocation = locIdx >= 0 && tokens[locIdx] ? tokens[locIdx] : 'Warehouse A - Bin 01';
    const lotNumber = lotIdx >= 0 && tokens[lotIdx] ? tokens[lotIdx] : `LOT-${Date.now().toString().slice(-6)}`;
    const supplier = suppIdx >= 0 && tokens[suppIdx] ? tokens[suppIdx] : 'Global Industrial Supply';
    const unit = unitIdx >= 0 && tokens[unitIdx] ? tokens[unitIdx] : 'Units';

    let status: 'optimal' | 'low_stock' | 'critical' | 'surplus' = 'optimal';
    if (quantityOnHand <= minSafetyStock * 0.5) {
      status = 'critical';
    } else if (quantityOnHand <= minSafetyStock) {
      status = 'low_stock';
    } else if (quantityOnHand > minSafetyStock * 4) {
      status = 'surplus';
    }

    validRecords.push({
      id: `inv-${sku.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${Date.now().toString().slice(-4)}`,
      sku: sku.trim(),
      name: name.trim(),
      category,
      quantityOnHand,
      minSafetyStock,
      unit,
      unitCost,
      warehouseLocation,
      lotNumber,
      lastRestocked: new Date().toISOString().split('T')[0],
      supplier,
      status,
    });
  }

  return {
    validRecords,
    errors,
    totalRows: lines.length - 1,
    validCount: validRecords.length,
    errorCount: errors.length,
  };
}

/**
 * Robust Employee CSV Parser
 */
export function parseEmployeeCsv(csvText: string): CsvParseResult<Employee> {
  const lines = csvText.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      validRecords: [],
      errors: [{ rowNumber: 1, rawText: csvText, reason: 'CSV must contain at least a header row and one data row.' }],
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = tokenizeCsvLine(lines[0], delimiter).map(normalizeHeader);

  const getIndex = (synonyms: string[]) => {
    return headers.findIndex((h) => synonyms.some((syn) => h === normalizeHeader(syn)));
  };

  const nameIdx = getIndex(['name', 'fullname', 'employeename']);
  const emailIdx = getIndex(['email', 'emailaddress', 'mail']);
  const phoneIdx = getIndex(['phone', 'telephone', 'mobile', 'cell']);
  const deptIdx = getIndex(['department', 'dept', 'division']);
  const roleIdx = getIndex(['roletitle', 'role', 'title', 'position', 'jobtitle']);
  const shiftIdx = getIndex(['shift', 'workshift']);
  const codeIdx = getIndex(['employeecode', 'code', 'badge', 'id']);
  const rateIdx = getIndex(['hourlyrate', 'rate', 'wage', 'salary']);
  const lineIdx = getIndex(['assignedlineorcell', 'assignedline', 'station', 'cell']);
  const skillsIdx = getIndex(['skills', 'competencies', 'tags']);

  const validRecords: Employee[] = [];
  const errors: CsvParseResult<Employee>['errors'] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const tokens = tokenizeCsvLine(rawLine, delimiter);
    const rowNumber = i + 1;

    if (tokens.length < 2) {
      errors.push({ rowNumber, rawText: rawLine, reason: 'Row does not contain sufficient columns.' });
      continue;
    }

    const name = nameIdx >= 0 ? tokens[nameIdx] : tokens[0];
    const email = emailIdx >= 0 ? tokens[emailIdx] : tokens[1];

    if (!name || name.trim().length === 0) {
      errors.push({ rowNumber, rawText: rawLine, reason: 'Missing employee name.' });
      continue;
    }

    if (!email || !emailRegex.test(email.trim())) {
      errors.push({ rowNumber, rawText: rawLine, reason: `Invalid email address format: "${email || 'EMPTY'}".` });
      continue;
    }

    // Department mapping
    let department: Employee['department'] = 'Assembly';
    if (deptIdx >= 0 && tokens[deptIdx]) {
      const rawDept = tokens[deptIdx].toLowerCase();
      if (rawDept.includes('cnc') || rawDept.includes('machin')) department = 'CNC Machining';
      else if (rawDept.includes('qual') || rawDept.includes('smt')) department = 'Quality & SMT';
      else if (rawDept.includes('maint')) department = 'Maintenance';
      else if (rawDept.includes('ware') || rawDept.includes('logis')) department = 'Warehouse & Logistics';
      else if (rawDept.includes('eng')) department = 'Engineering';
      else if (rawDept.includes('oper') || rawDept.includes('mgmt')) department = 'Operations Management';
    }

    // Shift mapping
    let shift: Employee['shift'] = 'Shift A (06:00 - 14:30)';
    if (shiftIdx >= 0 && tokens[shiftIdx]) {
      const rawShift = tokens[shiftIdx].toLowerCase();
      if (rawShift.includes('b') || rawShift.includes('afternoon')) shift = 'Shift B (14:00 - 22:30)';
      else if (rawShift.includes('c') || rawShift.includes('night')) shift = 'Shift C (22:00 - 06:30)';
    }

    const phone = phoneIdx >= 0 && tokens[phoneIdx] ? tokens[phoneIdx] : '+1 (555) 019-2831';
    const roleTitle = roleIdx >= 0 && tokens[roleIdx] ? tokens[roleIdx] : 'Shop Floor Technician';
    const employeeCode = codeIdx >= 0 && tokens[codeIdx] ? tokens[codeIdx] : `EMP-${100 + Math.floor(Math.random() * 899)}`;
    const assignedLineOrCell = lineIdx >= 0 && tokens[lineIdx] ? tokens[lineIdx] : 'Line 1 - Industrial Bay A';

    const rawRate = rateIdx >= 0 ? tokens[rateIdx] : '28.50';
    const hourlyRate = Math.max(15, parseFloat(rawRate.replace(/[^0-9.-]+/g, '')) || 28.5);

    let skills: string[] = ['OSHA Certified', 'Shop Safety'];
    if (skillsIdx >= 0 && tokens[skillsIdx]) {
      skills = tokens[skillsIdx].split(/[;,|]/).map((s) => s.trim()).filter(Boolean);
      if (skills.length === 0) skills = ['OSHA Certified'];
    }

    validRecords.push({
      id: `emp-csv-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      employeeCode,
      name: name.trim(),
      email: email.trim(),
      phone,
      department,
      roleTitle,
      shift,
      status: 'active_on_duty',
      assignedLineOrCell,
      hourlyRate,
      weeklyHoursLogged: 40,
      overtimeHours: 0,
      certifications: [
        {
          id: `cert-import-${Date.now()}`,
          name: 'Plant Safety Induction',
          issuedBy: 'Vortix EHS Dept',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'valid',
        },
      ],
      skills,
      safetyIncidentFreeDays: 180,
      emergencyContact: {
        name: 'Emergency Response Contact',
        relationship: 'HR Record',
        phone: '+1 (555) 911-0000',
      },
      hireDate: new Date().toISOString().split('T')[0],
    });
  }

  return {
    validRecords,
    errors,
    totalRows: lines.length - 1,
    validCount: validRecords.length,
    errorCount: errors.length,
  };
}

/**
 * Sample CSV template generators
 */
export function getSampleInventoryCsv(): string {
  return `sku,name,category,quantityOnHand,minSafetyStock,unitCost,warehouseLocation,lotNumber,supplier
RAW-ALUM-6061-02,Aerospace Aluminum Billets 6061-T6,raw_material,1850,200,48.50,Warehouse Bay A-12,LOT-882910,Alcoa Precision Metals
ELEC-MCU-STM32-05,ARM Cortex-M4 Microcontroller 120MHz,wip,4500,500,6.25,Cleanroom Rack C-04,LOT-771822,STMicroelectronics Global
FIN-ACTUATOR-SRV-9,Robotic High-Torque Servo Actuator Gen 3,finished_goods,320,50,285.00,Distribution Center DC-1,LOT-992019,Vortix Assembly Line 1
TOOL-CARB-END-6MM,Solid Carbide 4-Flute End Mill 6mm,tooling_supplies,640,100,24.00,Tool Crib Locker 3B,LOT-441029,Sandvik Coromant`;
}

export function getSampleEmployeeCsv(): string {
  return `name,email,phone,department,roleTitle,shift,employeeCode,hourlyRate,assignedLineOrCell,skills
Elena Rostova,elena.rostova@vortixmfg.com,+1 (555) 234-8891,CNC Machining,Senior 5-Axis CNC Specialist,Shift A (06:00 - 14:30),EMP-109,38.50,Line 1 - CNC Bay A,"DMG Mori Certified, Mastercam, GD&T Precision"
Liam Chen,liam.chen@vortixmfg.com,+1 (555) 782-1190,Quality & SMT,SMT Line Lead Technician,Shift A (06:00 - 14:30),EMP-110,34.00,Line 2 - SMT Cleanroom,"Fuji NXT III, AOI Inspection, IPC-A-610 Master"
Kofi Mensah,kofi.mensah@vortixmfg.com,+1 (555) 433-7721,Maintenance,Electro-Mechanical Specialist,Shift B (14:00 - 22:30),EMP-111,36.75,Plantwide Rapid Response,"Hydraulics, PLC Siemens S7, Vibration FFT"
Sarah Jenkins,sarah.jenkins@vortixmfg.com,+1 (555) 890-4412,Assembly,Robotic Cell Assembly Lead,Shift A (06:00 - 14:30),EMP-112,32.00,Line 3 - Assembly Bay,"KUKA KRL Programming, Lean Six Sigma, OSHA 30"`;
}

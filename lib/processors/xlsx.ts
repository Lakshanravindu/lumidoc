import * as XLSX from "xlsx";

export function extractFromXlsx(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  return workbook.SheetNames.map((name) => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
    return `## Sheet: ${name}\n${csv}`;
  }).join("\n\n");
}

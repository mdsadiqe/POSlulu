import XLSX from "xlsx";
import ExcelJS, { Worksheet } from "exceljs";
import { TESTDATA } from "../globals";


export const readExcelCell = (
  filePath: string,
  columnName: string,
  rowNumber: number,
  sheetName?: string
): any => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];

  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headers = data[1]; // second row
  const rows = data.slice(2); // from third row onward

  const colIndex = headers.indexOf(columnName);
  return colIndex !== -1 ? rows[rowNumber - 1]?.[colIndex] : undefined;
};

export function readExcelSheet(
  filePath: string,
  sheetName?: string
): any[][] {
  const workbook = XLSX.readFile(filePath);
  const targetSheet = sheetName || workbook.SheetNames[0];
  const sheet = workbook.Sheets[targetSheet];
  const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  return data.filter((row) => row.length > 0);
}

/**
 * Clears all cell colors (fills) from a workbook except header rows,
 * and clears all data from a specific column except headers.
 * 
 *
 * @param filePath Path to Excel file
 * @param headerRowsToKeep Number of top rows to keep unchanged (default: 2)
 * @param clearColumn Column letter (e.g. "E") to clear data from (default: M)
 */
export async function clearAllColorsAndColumnData(
  filePath: string,
  headerRowsToKeep = 2,
  clearColumns =[TESTDATA.productNoteColumn,TESTDATA.sizeNotesColumn,TESTDATA.priceNotesColumn,
    TESTDATA.colorNotesColumn,TESTDATA.imageNotesColumn]  // Comment column
        ) 
{
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  workbook.worksheets.forEach((worksheet) => {
    worksheet.eachRow((row, rowNumber) => {
      // Skip header rows
      if (rowNumber <= headerRowsToKeep) return;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Safely clear fill color (TypeScript-safe)
        (cell as any).fill = undefined;

        for(let clearColumn of clearColumns){
        // Clear data & comment in the specific column
        if (
          clearColumn &&
          (typeof clearColumn === "string"
            ? columnLetterToNumber(clearColumn) === colNumber
            : clearColumn === colNumber)
        ) {
          cell.value = undefined;
          if (typeof (cell as any).note !== "undefined") {
            (cell as any).note = undefined; // remove Excel note/comment if present
          }
        }}
      });

      row.commit();
    });
  });
  
  await workbook.xlsx.writeFile(filePath);

  console.log(
    `Cleared all colors (except first ${headerRowsToKeep} header rows) and cleared all data from column ${clearColumns}, except headers.`
  );
}



/**
 * Colors a given row based on test status and appends a comment to a specific column cell.
 */
export async function updateResultinExcel(
  filePath: string,
  rowNumber: number,
  commentColumn: string,   // default parameter Comment column
  commentText: string = "",
  fontBold: boolean,       // default value
  fontColor: boolean       // default value 
) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  console.log("Comment column index name -",commentColumn);
  const colCount = Math.max(worksheet.columnCount || 0, columnLetterToNumber(commentColumn));
  console.log("Column number -",colCount);
  console.log("Row number -",rowNumber);
  
   
  const commentCellAddress = `${commentColumn}${rowNumber}`;
  const commentCell = worksheet.getCell(commentCellAddress);

  // Handle ExcelJS .note or fallback
  let existingComment = "";

  if (typeof (commentCell as any).note !== "undefined" && (commentCell as any).note) {
    // ExcelJS note format
    const note = (commentCell as any).note;
    if (typeof note === "string") {
      existingComment = note;
    } else if (Array.isArray(note.texts)) {
      existingComment = note.texts.map((t: any) => t.text).join("");
    }
  } else if (commentCell.value && typeof commentCell.value === "string") {
    // Fallback: read from cell value if used for comments
    existingComment = commentCell.value;
  }

  const newComment =
    existingComment.trim().length > 0
      ? `${existingComment}\n---\n${commentText}`
      : commentText;

  // Write updated comment
  if (typeof (commentCell as any).note !== "undefined") {
    (commentCell as any).note = {
      texts: [{ text: newComment }],
      author: "Automated",
    };
  } else {
    commentCell.value = newComment;
  }
 //FONT COLOR
  // commentCell.font = { bold: true,
  //   color: { argb: 'FF0000' }
  //  };

  
  
   console.log('Comment updated to:', commentText);
   //Updating background color of MarkedDownPrice column

//   if (commentText.includes("MarkedDown") && commentText.includes("Passed")) {
//     console.log('Updating MarkedDown Price cell color...');
    
// }
await excelCosmecticChanges(worksheet, rowNumber, commentColumn, newComment, fontBold, fontColor);


  console.log('Saving data to excel file...'); //udpated the M2 column with newComment->message from the test
  
  await workbook.xlsx.writeFile(filePath);
  console.log(
    `Row ${rowNumber} updated with comment in ${commentCellAddress}`
  );
}

/**
 * Utility: convert column letter (e.g. "E") -> index (5)
 */
function columnLetterToNumber(letter: string): number {
    let num = 0;
    for (let i = 0; i < letter.length; i++) {
        const charCode = letter.charCodeAt(i);
        if (charCode < 65 || charCode > 90) { // 'A' to 'Z'
            throw new Error("Invalid column letter");
        }
        num = num * 26 + (charCode - 64);
    }
    return Math.min(num, 16384); // cap at Excel max column
}

async function excelCosmecticChanges(
  worksheet: any,
  rowNumber: number,
  commentColumn: string,   // default parameter Comment column
  commentText: string,     // default value
  boldFont: boolean = false,
  colorCell: boolean = false ) 
{
  if (boldFont) {
    const cellAddress = worksheet.getCell('E' + rowNumber);
    console.log(`Applying bold font to E4 cell...${rowNumber}`);
    cellAddress.style = {};
    cellAddress.font =  
      { bold: true}
  }
  if (colorCell) {
    const cellAddress = worksheet.getCell('H' + rowNumber);
    console.log(`Applying bold font to H4 cell...${rowNumber}`);
    cellAddress.style = {};
    worksheet.getCell('H'+rowNumber).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00FF00' }, // Light green
    }
  }
  
  console.log(`ROW_NUMBER: ${rowNumber}, COMMENT_COLUMN: ${commentColumn},
     COMMENT_TEXT: ${commentText}, BOLD_FONT: ${boldFont}, COLOR_CELL: ${colorCell}`);
  
}

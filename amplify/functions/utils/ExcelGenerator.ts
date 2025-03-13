/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import fs from 'fs';

export class ExcelGenerator {
    /**
     * Create an Excel file from an array of JSON objects
     * @param data Array of JSON objects to convert to Excel
     * @param sheetName Name of the worksheet (optional)
     * @returns Buffer containing the Excel file data
     */
    static createExcelBuffer(data: any[], sheetName: string = 'Sheet1'): Buffer {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert JSON data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return excelBuffer;
    }
    
    /**
     * Create an Excel file from an array of JSON objects and save to disk
     * @param data Array of JSON objects to convert to Excel
     * @param filePath Path where the file should be saved
     * @param sheetName Name of the worksheet (optional)
     * @returns Path to the saved file
     */
    static createExcelFile(data: any[], filePath: string, sheetName: string = 'Sheet1'): string {
      const excelBuffer = this.createExcelBuffer(data, sheetName);
      
      // Write buffer to file
      fs.writeFileSync(filePath, excelBuffer);
      
      return filePath;
    }
    
    /**
     * Create a Blob object containing Excel data (for browser environments)
     * @param data Array of JSON objects to convert to Excel
     * @param sheetName Name of the worksheet (optional)
     * @returns Blob containing the Excel file
     */
    static createExcelBlob(data: any[], sheetName: string = 'Sheet1'): Buffer {
      return this.createExcelBuffer(data, sheetName);
    }
  }
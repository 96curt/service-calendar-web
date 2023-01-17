import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpreadsheetComponent } from './spreadsheet.component';
import { DxDataGridModule } from 'devextreme-angular';



@NgModule({
  declarations: [SpreadsheetComponent],
  exports: [SpreadsheetComponent],
  imports: [
    CommonModule,
    DxDataGridModule
  ]
})
export class SpreadsheetModule { }

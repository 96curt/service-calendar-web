import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleModule } from './schedule/schedule.module';
import { SpreadsheetModule } from './spreadsheet/spreadsheet.module';
import { TechSchedulingComponent } from './tech-scheduling.component';
import { FilterModule } from 'app/shared/components/filter/filter.module';
import { DxButtonModule, DxSpeedDialActionModule } from 'devextreme-angular';



@NgModule({
  declarations: [TechSchedulingComponent],
  exports: [TechSchedulingComponent],
  imports: [
    CommonModule,
    ScheduleModule,
    SpreadsheetModule,
    FilterModule,
    DxSpeedDialActionModule,
    DxButtonModule
  ]
})
export class TechSchedulingModule { }

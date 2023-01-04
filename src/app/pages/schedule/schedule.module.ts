import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterModule } from 'app/shared/components/filter/filter.module';
import { DxButtonModule, DxDropDownBoxModule, DxFormModule, DxPopupModule, DxSchedulerModule, DxSelectBoxModule, DxSpeedDialActionModule, DxTemplateModule } from 'devextreme-angular';
import { ScheduleComponent } from './schedule.component';



@NgModule({
  declarations: [
    ScheduleComponent
  ],
  exports: [
    ScheduleComponent
  ],
  imports: [
    CommonModule,
    FilterModule,
    DxSchedulerModule,
    DxDropDownBoxModule,
    DxFormModule,
    DxSelectBoxModule,
    DxPopupModule,
    DxButtonModule,
    DxSpeedDialActionModule
  ]
})
export class ScheduleModule { }

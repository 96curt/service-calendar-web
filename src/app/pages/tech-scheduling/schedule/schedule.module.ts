import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterModule } from 'app/shared/components/filter/filter.module';
import { DxButtonModule, DxDropDownBoxModule, DxFormModule, DxListModule, DxPopupModule, DxSchedulerModule, DxSelectBoxModule, DxSpeedDialActionModule, DxTemplateModule, DxToolbarModule } from 'devextreme-angular';
import { ScheduleComponent } from './schedule.component';
import { AppointmentTypeService } from 'app/shared/services/appointmentType.service';
import { AppointmentFormModule } from 'app/shared/components/appointment-form/appointment-form.module';

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
    DxListModule,
    DxToolbarModule,
    AppointmentFormModule
  ],
  providers: [
    AppointmentTypeService
  ]
})
export class ScheduleModule { }

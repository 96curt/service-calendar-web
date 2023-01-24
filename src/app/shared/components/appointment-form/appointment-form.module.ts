import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentFormComponent } from './appointment-form.component';
import { DxButtonModule, DxCheckBoxModule, DxDateBoxModule, DxFormModule, DxPopupModule, DxScrollViewModule, DxSelectBoxModule, DxTagBoxModule, DxTextBoxModule } from 'devextreme-angular';



@NgModule({
  declarations: [
    AppointmentFormComponent
  ],
  exports: [AppointmentFormComponent],
  imports: [
    CommonModule,
    DxPopupModule,
    DxScrollViewModule,
    DxFormModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxButtonModule,
    DxTagBoxModule
  ]
})
export class AppointmentFormModule { }

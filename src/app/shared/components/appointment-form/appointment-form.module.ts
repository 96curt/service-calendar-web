import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentFormComponent } from './appointment-form.component';
import { DxPopupModule } from 'devextreme-angular';



@NgModule({
  declarations: [
    AppointmentFormComponent
  ],
  exports: [AppointmentFormComponent],
  imports: [
    CommonModule,
    DxPopupModule,
    
  ]
})
export class AppointmentFormModule { }

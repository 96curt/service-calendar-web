import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulerTooltipComponent } from './scheduler-tooltip.component';
import { DxPopoverModule, DxScrollViewModule } from 'devextreme-angular';



@NgModule({
  declarations: [
    SchedulerTooltipComponent,
  ],
  exports: [
    SchedulerTooltipComponent
  ],
  imports: [
    CommonModule,
    DxPopoverModule,
    DxScrollViewModule,
  ]
})
export class SchedulerTooltipModule { }

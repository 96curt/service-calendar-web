import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { DxButtonModule, DxPopupModule, DxScrollViewModule, DxSelectBoxModule, DxTagBoxModule } from 'devextreme-angular';



@NgModule({
  declarations: [FilterComponent],
  exports:[
    FilterComponent
  ],
  imports: [
    CommonModule,
    DxSelectBoxModule,
    DxPopupModule,
    DxButtonModule,
    DxTagBoxModule,
    DxScrollViewModule
  ]
})
export class FilterModule { }

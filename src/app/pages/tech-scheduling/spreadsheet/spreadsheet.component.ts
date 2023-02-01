import { Component, Input, OnInit } from '@angular/core';
import { LoadOptions } from 'devextreme/data';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { Schedule, ServiceSchedulesListRequestParams, ServiceService, ServiceTechsListRequestParams } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent{
  @Input() scheduleResource: CustomStore | null = null;
  @Input() technicianResource: CustomStore | null = null;
  @Input() centerResource: CustomStore | null = null;
  @Input() addendumResource: CustomStore | null = null;

  constructor(private serviceService: ServiceService) {
  }

  /*** Helper Methods ***/
  getfullName(item:any){
    if (item)
      return item.firstName + ' ' + item.lastName;
    return null
  }

  getOnSiteTime(item:Schedule) {
    if (!item)
      return
    let startTime = new Date(item.startDateTime);
    let endTime = new Date(item.endDateTime);
    return ((endTime.getMinutes() - startTime.getMinutes()) / 60 ).toFixed(2);
  }
  
}

import { Component, OnInit } from '@angular/core';
import { LoadOptions } from 'devextreme/data';
import DataSource from 'devextreme/data/data_source';
import { Schedule, ServiceSchedulesListRequestParams, ServiceService, ServiceTechsListRequestParams } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent{
  appointmentsDataSource: DataSource;
  technicianDataSource: DataSource;

  constructor(private serviceService: ServiceService) {
    this.appointmentsDataSource = new DataSource({
      key: 'id',
      loadMode:'processed',
      load: () => {
        let requestPrams = {
          //serviceCenterRegionIdIn:this.filterValues.regions,
          // serviceCenterRegionManagersIdIn:this.filterValues.managers,
          // serviceCenterIdIn:this.filterValues.centers,
          // serviceCenterRegionCitiesIdIn:this.filterValues.cities,
          // serviceCenterRegionZipCodesCodeIn:this.filterValues.zipCodes
        } as ServiceSchedulesListRequestParams
        return lastValueFrom(this.serviceService.serviceSchedulesList(requestPrams));
      },
      byKey: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleRetrieve({id:key}));
      }
    });
    this.technicianDataSource = new DataSource({
      key: 'id',
      loadMode: 'processed',
      load: () => {
        const prams = {
          // centersRegionIdIn:this.filterValues.regions,
          // centersRegionManagersIdIn:this.filterValues.managers,
          // centersIdIn:this.filterValues.centers,
          // centersRegionCitiesIdIn:this.filterValues.cities,
          // centersRegionZipCodesCodeIn:this.filterValues.zipCodes,
          // idIn:this.filterValues.techs
        } as ServiceTechsListRequestParams;
        return lastValueFrom(this.serviceService.serviceTechsList(prams));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceTechRetrieve({id:key}));
      }
    });
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

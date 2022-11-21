import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ServiceService } from 'openapi';
import { filter, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  customDataSource: CustomStore;
  constructor(private serviceService: ServiceService) {
    //const isNotEmpty = (value) => value !== undefined && value !== null && value !== '';
    
    this.customDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceSchedulesList())
        .then(response => {
          return {
            data:response,
            
          }
        })
        .catch(() => { throw 'Data loading error' });
      }
      
    });
  }
  ngOnInit(): void {
  }

}

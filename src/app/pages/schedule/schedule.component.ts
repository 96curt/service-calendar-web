import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ServiceService } from 'openapi';
import { filter, lastValueFrom } from 'rxjs';
import { Value } from 'sass-embedded';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  scheduleDataSource: CustomStore;
  techDataSource: CustomStore;
  constructor(private serviceService: ServiceService) {
    this.scheduleDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceSchedulesList())
        .then(response => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Data loading error' });
      },
      insert: (values) => {
        console.log(values);
        return lastValueFrom(this.serviceService.serviceSchedulesCreate(values));
      },
      update: (key, values) => {console.log(values);
        return lastValueFrom(this.serviceService.serviceScheduleUpdate(key,values));
      }

    });
    this.techDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceTechsList())
        .then(response => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Data loading error' });
      },
      
    });
  }
  ngOnInit(): void {
  }

}

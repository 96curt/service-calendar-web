import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { Schedule, ServiceService } from 'openapi';
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
        .catch(() => { throw 'Error Loading Appointment' });
      },
      insert: (values) => {
        console.log(values);
        const schedule = {
          description:values.description,
          endDateTime:values.endDateTime,
          startDateTime:values.startDateTime,
          technicians:values.technicians,
          
        } as Schedule;
        return lastValueFrom(this.serviceService.serviceSchedulesCreate(values))
        .catch(() => { throw 'Error Creating Appointment' });
      },
      update: (key, values) => {console.log(values);
        return lastValueFrom(this.serviceService.serviceScheduleUpdate(key,values))
        .catch(() => { throw 'Error Updating Appointment' });
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

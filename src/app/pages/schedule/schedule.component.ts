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
  centerDataSource: CustomStore;
  addendumDataSource: CustomeStore;
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
        const schedule = {
          description:values.description,
          endDateTime:values.endDateTime,
          startDateTime:values.startDateTime,
          technicians:values.technicians,
          serviceCenter:1,
          travelHours:'8.00'
        } as Schedule;
        return lastValueFrom(this.serviceService.serviceSchedulesCreate(schedule))
        .catch(() => { throw 'Error Creating Appointment' });
      },
      update: (key, values) => {
        const schedule = {
          description: values.description,
          endDateTime: values.endDateTime,
          startDateTime: values.startDateTime,
          technicians: values.technicians,
          serviceCenter: 1,
          travelHours: '8.00'
        } as Schedule;
        return lastValueFrom(this.serviceService.serviceScheduleUpdate(key, schedule))
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
        .catch(() => { throw 'Error loading technician' });
      },
      
    });
    this.centerDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceCentersList())
        .then(response => {
          return {
            data:response
          }
        }).catch(() => { throw 'Error loading Service Centers' });
      }
    });
    this.addendumDataSource = new CustomStore({
      key 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceAdd)
      }
    })
  }

  ngOnInit(): void {
  }

  onAppointmentFormOpening(e:any) {
    e.popup.option('showTitle', true);
    e.popup.option('title', e.appointmentData.text ? 
        e.appointmentData.text : 
        'Create a new appointment');

    const form = e.form;
    let mainGroupItems = form.itemOption('mainGroup').items; 
    if (!mainGroupItems.find(function(i:any) { return i.dataField === "addendum" })) {
        mainGroupItems.push({
            colSpan: 2, 
            label: { text: "Service Order" },
            editorType: "dxDropDownBox",
            dataField: "addendum"
        });
        form.itemOption('mainGroup', 'items', mainGroupItems);
    }

    let formItems = form.option("items"); 
    if (!formItems.find(function(i:any) { return i.dataField === "travelHours" })) {
        formItems.push({
            colSpan: 2,
            label: { text: "Travel Hours" },
            editorType: "dxNumberBox",
            dataField: "travelHours"
        });
        form.option("items", formItems);
    }
}

}

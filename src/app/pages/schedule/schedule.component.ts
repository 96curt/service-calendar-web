import { Component, OnInit } from '@angular/core';
import { DxSchedulerComponent } from 'devextreme-angular';
import { LoadOptions } from 'devextreme/data';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { Schedule, ServiceService } from 'openapi';
import { filter, lastValueFrom } from 'rxjs';
import { Value } from 'sass-embedded';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  scheduleDataSource: DataSource | CustomStore;
  techDataSource: DataSource | CustomStore;
  centerDataSource: DataSource | CustomStore;
  sequenceDataSource: DataSource | CustomStore;
  addendumDataSource: DataSource | CustomStore;

  constructor(private serviceService: ServiceService) {
    this.scheduleDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions:LoadOptions<Schedule>) => {
        
        return lastValueFrom(this.serviceService.serviceSchedulesList())
        .then(response => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Error Loading Appointments' });
      },
      insert: (values:Schedule) => {
        return lastValueFrom(this.serviceService.serviceSchedulesCreate(values))
        .catch(() => { throw 'Error Creating Appointment: ' + values.description });
      },
      update: (key:number, values:Schedule) => {
        return lastValueFrom(this.serviceService.serviceScheduleUpdate(key, values))
        .catch(() => { throw 'Error Updating Appointment: ' + key });
      },
      remove: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleDestroy(key))
        .catch(() => { throw 'Error Removing Appointment: ' + key})
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
        .catch(() => { throw 'Error loading technicians' });
      }
    });

    this.centerDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceCentersList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Centers' });
      }
    });

    this.addendumDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Addendums' });
      }
    });

    this.sequenceDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceOrdersSequencesList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Sequences' });
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
    if (!mainGroupItems.find(function(i:any) { return i.dataField === "travelHours" })) {
        mainGroupItems.push({
            colSpan: 2, 
            label: { text: "Travel Hours" },
            editorType: "dxTextBox",
            dataField: "travelHours"
        });
        form.itemOption('mainGroup', 'items', mainGroupItems);
    }

    if (!mainGroupItems.find(function(i:any) { return i.dataField === "confirm" })) {
      mainGroupItems.push({
          colSpan: 1, 
          label: { text: "Confirm Appointment" },
          editorType: "dxCheckBox",
          dataField: "confirm"
      });
      form.itemOption('mainGroup', 'items', mainGroupItems);
    }

    // let formItems = form.option("items"); 
    // if (!formItems.find(function(i:any) { return i.dataField === "travelHours" })) {
    //     formItems.push({
    //         colSpan: 2,
    //         label: { text: "Travel Hours" },
    //         editorType: "dxNumberBox",
    //         dataField: "travelHours"
    //     });
    //     form.option("items", formItems);
    // }
}

}

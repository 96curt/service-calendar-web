// https://github.com/DevExpress-Examples/scheduler-how-to-create-custom-editing-form/
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Appointment, EditAppointment } from 'app/shared/services/appointment.service';
import { AppointmentTypeService } from 'app/shared/services/appointmentType.service';
import DataSource from 'devextreme/data/data_source';
import { formatDate } from 'devextreme/localization';
import { dxDateBoxOptions } from 'devextreme/ui/date_box';
import { environment } from 'environments/environment';
import { ServiceService } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnChanges {
  @Input() visible = false; // DxPopup Visibility
  @Output() visibleChange = new EventEmitter<boolean>;
  @Input() editAppointmentData = new EditAppointment(); // Data for appointment form
  @Output() editAppointmentDataChange = new EventEmitter<EditAppointment>;
  typeDataSource
  techniciansDataSource
  centerDataSource: DataSource
  addendumDataSource: DataSource
  title = 'Create a new appointment' // DxPopup title
  dateEditorOptions;
  submitButtonOptions;
  cancelButtonOptions;

  constructor(
    private serviceService: ServiceService,
    private typeService: AppointmentTypeService
  ) {
    this.submitButtonOptions = {
      text: 'Confirm',
      onClick: () => {
        
      }
    }

    this.cancelButtonOptions = {
      text: 'Close',
      onClick: () => {
        this.visibleChange.emit(false);
      }
    };
    this.dateEditorOptions = {
      type:'datetime'
    } as dxDateBoxOptions;
    this.typeDataSource = this.typeService.getAppointmentTypes();
    this.techniciansDataSource = new DataSource({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceTechsList({}));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceTechRetrieve({id:key}));
      }
    });
    this.centerDataSource = new DataSource({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceCentersList({}));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceCenterRetrieve({id:key}));
      }
    });
    this.addendumDataSource = new DataSource({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList({}));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumRetrieve({id:key}));
      }
    });
   }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible']) {
      if(changes['visible'].currentValue)
        this.unserializeDates();
      else
        this.serializeDates();
    } 
  }

  /**
   * DxPopup onHiding event handler
   * @param e Hiding event data
   */
  onHiding(e:any) {
    this.visibleChange.emit(this.visible);
    this.editAppointmentDataChange.emit(new EditAppointment());
  }

  unserializeDates() {
    let start = new Date(this.editAppointmentData.startDateTime);
    let end = new Date(this.editAppointmentData.endDateTime);
    this.editAppointmentData.startDate = start;
    this.editAppointmentData.endDate = end;
  }

  serializeDates() {
    let start = formatDate(this.editAppointmentData.startDate, environment.dateTimeFormat);
    let end = formatDate(this.editAppointmentData.endDate, environment.dateTimeFormat);
    this.editAppointmentData.startDateTime = start;
    this.editAppointmentData.endDateTime = end;
  }

  getfullName(item:any){
    if (item)
      return item.firstName + ' ' + item.lastName;
    return null
  }

  submit(item:any) {
    item
    this.editAppointmentData
  }

  updateFormData(formData:any) {
    this.semaphore.take();

    this.form.option('formData', formData);

    const dataExprs = this.scheduler.getDataAccessors().expr;

    const allDay = formData[dataExprs.allDayExpr];

    const startDate = new Date(formData[dataExprs.startDateExpr]);
    const endDate = new Date(formData[dataExprs.endDateExpr]);

    this.setTimeZoneEditorDataSource(startDate, dataExprs.startDateTimeZoneExpr);
    this.setTimeZoneEditorDataSource(endDate, dataExprs.endDateTimeZoneExpr);

    this.updateRecurrenceEditorStartDate(startDate, dataExprs.recurrenceRuleExpr);

    this.setEditorsType(allDay);

    this.semaphore.release();
  }
}

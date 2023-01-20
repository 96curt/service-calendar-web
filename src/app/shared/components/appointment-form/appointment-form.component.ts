// https://github.com/DevExpress-Examples/scheduler-how-to-create-custom-editing-form/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Appointment } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>;
  @Input() editAppointmentData = {} as Appointment;
  @Output() editAppointmentDataChange = new EventEmitter<Appointment>;
  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit } from '@angular/core';
import { RegionEnum } from 'openapi';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  regionEnum: RegionEnum
  constructor() { }

  ngOnInit(): void {
  }

}

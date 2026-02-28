import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { HistoryData } from '../../models/history.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit{

  historyText!: HistoryData;

  constructor(private historyService: HistoryService){}

  ngOnInit(){
    this.historyService.data$.subscribe(data=>{
      if(data) this.historyText = data;
    });
  }
}
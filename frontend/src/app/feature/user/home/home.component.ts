import { Component, OnInit } from '@angular/core';
import { ContactService } from "../../../core/services/contact.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  statsModel: any = {
    totalContacts: '-'
  };
  constructor(private contactService: ContactService) { }

  ngOnInit(): void {
    this.contactService.countAll()
      .subscribe((data) => {
        this.statsModel.totalContacts = data;
      },
        (error) => { });
  }

}

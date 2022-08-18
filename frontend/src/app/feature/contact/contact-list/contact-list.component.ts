import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { SortType, SelectionType } from "@swimlane/ngx-datatable";
import { ContactService } from "../contact.service";
import { Router } from "@angular/router";
@Component({
  selector: "app-contact-list",
  templateUrl: "./contact-list.component.html",
  styleUrls: ["./contact-list.component.scss"]
})
export class ContactListComponent implements OnInit {
  SortType = SortType;
  contacts: any;
  selected = [];
  SelectionType = SelectionType;

  @ViewChild('txtFilterList') txtFilterList!: ElementRef;

  columns = [
    { prop: "firstName", name: "First Name",  width: 250 },
    { prop: "lastName",  width: 250  },
    { prop: "email",  width: 250  },
    { prop: "mobile" },
    { prop: "city" },
    { prop: "postalCode" }
  ];
  constructor(private contactService: ContactService, private router: Router) {}
  getAll(): void {
    this.contactService.getAll().subscribe(
      (data) => {
        this.contacts = data;
      },
      (error) => {}
    );
  }
  getByFilter(filter): void {
    this.contactService.getByFilter(filter).subscribe(
      (data) => {
        this.contacts = data;
      },
      (error) => {}
    );
  }
  onSelect(selected: any): void {
    this.router.navigate(["/contacts/details/" + this.selected[0]._id]);
  }
  ngOnInit(): void {
    this.getAll();
  }

  filterList(): void{
    const query = this.txtFilterList.nativeElement.value;
    this.getByFilter(query);
  }

  resetFilter(): void { 
    this.txtFilterList.nativeElement.value = '';
    this.getAll();
  }
}

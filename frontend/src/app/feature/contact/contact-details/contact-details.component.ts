import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ContactService } from "../contact.service";

@Component({
  selector: "app-contact-details",
  templateUrl: "./contact-details.component.html",
  styleUrls: ["./contact-details.component.scss"]
})
export class ContactDetailsComponent implements OnInit {
  contact: any;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private contactService: ContactService, private toastrService: ToastrService) {}

  edit(): void {
    this.router.navigate(["/contacts/edit/" + this.contact._id]);
  }

  delete():void{
    this.contactService.delete(this.contact._id).subscribe(
      (data) => {
        this.toastrService.success("Contact delete successfully", "Success");
        this.router.navigate(["/contacts"]);
      },

      (error) => {}
    );
  }

  ngOnInit(): void {
    this.contact = this.activatedRoute.snapshot.data.contactDetails;
  }
}

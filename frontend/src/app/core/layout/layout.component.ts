import { Component, OnInit } from "@angular/core";
import { io } from "socket.io-client";
import { environment } from "../../../environments/environment";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
  collapedSideBar: boolean;
  private static socket;

  constructor(private toastrService:ToastrService){}
  
  ngOnInit(){
    if(!LayoutComponent.socket){
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if(currentUser){
        console.log("init notifications user "+currentUser._id);
        LayoutComponent.socket = io(environment.notificationUrl);

        LayoutComponent.socket.removeAllListeners();

        LayoutComponent.socket.on("contact_create_"+currentUser._id, (payload) => {
          this.toastrService.success(`L'utente ${payload.user.fullname} ti ha aggiunto alla sua rubrica.`);
        });
        LayoutComponent.socket.on("contact_view_"+currentUser._id, (payload) => {
          this.toastrService.success(`L'utente ${payload.user.fullname} ha aperto la tua scheda.`);
        });
      } else{
        console.log("not init notifications");
      }
  }
  }

  receiveCollapsed($event) {
    this.collapedSideBar = $event;
  }
}

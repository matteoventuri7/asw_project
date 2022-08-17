import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { map } from "rxjs/operators";

import { environment } from "../../../../environments/environment";
import { Router } from "@angular/router";

@Injectable()
export class LoginService {
  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    return this.http
      .post<any>(environment.apiEndpoint + "/user/authenticate", {
        username: username,
        password: password
      })
      .pipe(
        map((user) => {
          // login successful if there"s a jwt token in the response
          if (user && user.data && user.data.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            if (typeof window !== "undefined") {
              const userData = { ...user.data };
              userData.password = null;
              localStorage.setItem("currentUser", JSON.stringify(userData));
            }
          }

          return user.data;
        })
      );
  }

  logout(): void {
    console.log("loggin out");
    // remove user from local storage to log user out
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      console.log("logged out");
      this.router.navigate(["login"]);
    }
  }
}

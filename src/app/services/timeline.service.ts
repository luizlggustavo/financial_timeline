import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Ano } from '../interfaces/ano-interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  constructor(private http: HttpClient,
  ) { }

  getTimeline(): Observable<Ano[]> {
    return this.http.get<Ano[]>('https://run.mocky.io/v3/d268a6b9-cddd-4e2b-b5f7-7a47bedb5a49');
  }

}

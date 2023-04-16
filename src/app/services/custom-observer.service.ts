import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { OriginalObserverService } from './original-observer.service';

@Injectable({
  providedIn: 'root',
})
export class CustomObserverService {
  constructor(private originalObserverSrv: OriginalObserverService) { }

  public observable2(error = false): Observable<boolean> {
    return from(this.originalObserverSrv.observable2(error)).pipe(
      map(() => true)
    );
  }
}

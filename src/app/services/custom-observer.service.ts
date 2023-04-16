import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { OriginalObserverService } from './original-observer.service';

@Injectable({
  providedIn: 'root',
})
export class CustomObserverService {
  constructor(private originalObserverSrv: OriginalObserverService) { }

  /**
   * ### Transforma la función original *Promise\<void\>* en *Observable\<boolean\>*
   * #### Retorna y mapea el ***resolve void*** de la promesa en un ***true***.
   * @param error  Para forzar que la promesa retorne un error.
   * @returns ***true*** si finaliza correctamente o un error si falla.
   */
  public observable2(error = false): Observable<boolean> {
    return from(this.originalObserverSrv.observable2(error)).pipe(
      map(() => true)
    );
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OriginalObserverService {
  public observable2(error = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!error) {
        resolve();
      }

      if (error) {
        reject(
          new Error('No se ha podido completar')
        );
      }
    });
  }
}

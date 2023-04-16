import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OriginalObserverService {
  /**
   * ### Promesa que retorna un ***resolve void*** al finalizar con éxito.
   * @param error Para forzar que la promesa retorne un error.
   * @returns ***void*** si finaliza correctamente o error si falla.
   */
  public observable2(error = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!error) {
        resolve();
      }

      if (error) {
        reject(
          new Error('No se ha podido completar con éxito.')
        );
      }
    });
  }
}

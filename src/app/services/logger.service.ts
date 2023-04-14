import { Injectable } from '@angular/core';

/**
 *
 *
 * @export
 * @class LoggerService
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private colors = {
    info: '#29B6F6',
    success: '#00E676',
    warning: '#FF9100',
    error: '#F44336',
  };
  private fontSize = '.8rem';
  private fontFamily = 'Segoe ui';
  private fontWeight = 'light';

  constructor() {}

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public info(message: string, param?: any): void {
    console.log(
      `%c${message}`,
      `color:${this.colors.info}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      param ? param : ''
    );
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public success(message: string, param?: any): void {
    console.log(
      `%c${message}`,
      `color:${this.colors.success}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      param ? param : ''
    );
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public warning(message: string, param?: any): void {
    console.log(
      `%c${message}`,
      `color:${this.colors.warning}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      param ? param : ''
    );
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public error(message: string, param?: any): void {
    console.log(
      `%c${message}`,
      `color:${this.colors.error}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      param ? param : ''
    );
  }
}

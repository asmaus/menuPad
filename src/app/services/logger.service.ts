import { Injectable, isDevMode } from '@angular/core';

declare type LoggerType = 'info' | 'success' | 'warning' | 'error';

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

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public info(message: string, param?: any): void {
    this.logWithStyle(message, 'info', param);
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public success(message: string, param?: any): void {
    this.logWithStyle(message, 'success', param);
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public warning(message: string, param?: any): void {
    this.logWithStyle(message, 'warning', param);
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} [param]
   * @memberof LoggerService
   */
  public error(message: string, param?: any): void {
    this.logWithStyle(message, 'error', param);
  }

  private logWithStyle(message: string, type: LoggerType, param?: any): void {
    if (!isDevMode) {
      return;
    }

    const color = this.colors[type];

    console.log(
      `%c${message}`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      param ?? ''
    );
  }
}

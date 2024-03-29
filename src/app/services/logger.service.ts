import { Injectable } from '@angular/core';

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
  private icons = {
    info: '\u24D8',
    success: '\u2714',
    warning: '\u26A0',
    error: '\u2716',
  }
  private fontSize = '.8rem';
  private fontFamily = 'Segoe ui';
  private fontWeight = 'light';
  private iconGroup = '\u2795';

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

  /**
   *
   * @param message
   * @param color
   * @param param
   */
  private logWithStyle(message: string, type: LoggerType, param?: any): void {
    const color = this.colors[type];
    const icon = this.icons[type];

    const iconStyle = type !== 'info' ? `color:${color}; font-size:${this.fontSize}; font-weight:${this.fontWeight}; background-color:#404040; border-radius:5px; padding:2px 8.5px; width:3rem;` :
      `color:${color}; font-size:${this.fontSize}; font-weight:${this.fontWeight}; background-color:#404040; border-radius:5px; padding:2px 6px; width:3rem;`;

    console.log(
      `%c${icon}%c ${message}`,
      `${iconStyle}`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      param ?? ''
    );
  }
}

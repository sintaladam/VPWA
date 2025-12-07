import { Notify } from 'quasar';
import type { NotificationType, StatusType, Position } from '../components/models';

export function notify(message: string, type: NotificationType, position: Position = 'bottom'): void {
    Notify.create({
        type,
        message,
        position,
    });
}

export function isStatusType(value: string): value is StatusType {
  return ['online', 'offline', 'DND'].includes(value);
}

export function print(value: string, output: string[]): void {
    output.push(value);
  }
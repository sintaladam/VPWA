import { Notify } from 'quasar';
import type { NotificationType, StatusType } from '../components/models';

export function notify(message: string, type: NotificationType): void {
    Notify.create({
        type,
        message,
    });
}

export function isStatusType(value: string): value is StatusType {
  return ['online', 'offline', 'dnd'].includes(value);
}

export function print(value: string, output: string[]): void {
    output.push(value);
  }
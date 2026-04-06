import { AppSetting } from './app-settings';
import { Module } from './modules';

export interface Permission {
  id: number;
  title: string;
  code: string;
  module_id: number;
  status?: number;
  module?: Module;
}
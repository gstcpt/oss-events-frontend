import { AppSetting } from './app-settings';
import { Module } from './modules';
import { Subscription } from './subscriptions';

export interface Pack {
  id: number;
  title: string;
  price: number;
  description: string;
  duration: number;
  status: number;
  subscriptions?: Subscription[];
  pack_lines?: PackLine[];
}

export interface PackLine {
  id: number;
  pack_id?: number;
  module_id: number;
  price_ht: number;
  tva_value: number;
  price_ttc: number;
  discount: number;
  modules?: Module;
}
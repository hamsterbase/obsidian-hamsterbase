import { Plugin } from 'obsidian';

export interface IObsidianHamsterBasePlugin extends Plugin {
  readonly settings: IObsidianHamsterBaseSettings;
  saveSettings(): Promise<void>;

  updateSetting(key: keyof IObsidianHamsterBaseSettings, value: string): void;
}

export interface IObsidianHamsterBaseSettings {
  endpoint?: string;
  token?: string;
  folder: string;
}

import { IObsidianHamsterBasePlugin } from './plugin';
import { App, PluginSettingTab, Setting } from 'obsidian';

export class ObsidianHamsterSettingsTab extends PluginSettingTab {
  plugin: IObsidianHamsterBasePlugin;

  constructor(app: App, plugin: IObsidianHamsterBasePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('HamsterBase Endpoint')
      .setDesc('Endpoint of HamsterBase')
      .addText((text) => {
        if (this.plugin.settings.endpoint) {
          text.setValue(this.plugin.settings.endpoint);
        }
        text.onChange(async (value) => {
          this.plugin.updateSetting('endpoint', value);
        });
      });

    new Setting(containerEl)
      .setName('HamsterBase Token')
      .setDesc('HamsterBase API Token')
      .addText((text) => {
        if (this.plugin.settings.token) {
          text.setValue(this.plugin.settings.token);
        }
        text.onChange(async (value) => {
          this.plugin.updateSetting('token', value);
        });
      });

    new Setting(containerEl)
      .setName('Folder')
      .setDesc('Folder to save HamsterBase highlights')
      .addText((text) => {
        text.setValue(this.plugin.settings.folder);
        text.onChange(async (value) => {
          this.plugin.updateSetting('folder', value);
        });
      });
  }
}

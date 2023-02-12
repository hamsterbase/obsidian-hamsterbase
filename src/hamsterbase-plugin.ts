import { Webpage } from '@hamsterbase/sdk';
import { HighlightsSyncService } from './highlightsService';
import { ObsidianHamsterSettingsTab } from './setting';
import { Plugin } from 'obsidian';
import {
  IObsidianHamsterBasePlugin,
  IObsidianHamsterBaseSettings,
} from './plugin';
import ejs from 'ejs';

export class ObsidianHamsterBasePlugin
  extends Plugin
  implements IObsidianHamsterBasePlugin
{
  settings: IObsidianHamsterBaseSettings = {
    endpoint: 'http://192.168.50.11:3001',
    token: 'EHX7FG8-KWP4X3J-PVEMGYW-P1KCC9Z',
    folder: 'hamsterbase/highlights',
  };

  private highlightsSyncService = new HighlightsSyncService();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new ObsidianHamsterSettingsTab(this.app, this));
    this.initPlugin();
  }

  private initPlugin() {
    this.highlightsSyncService.init(
      this.settings.endpoint ?? null,
      this.settings.token ?? null
    );
    this.addCommand({
      id: 'hamsterbase-sync-highlights',
      name: 'Sync highlights to ' + this.settings.folder,
      callback: () => {
        this.syncHighlights();
      },
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, this.settings, await super.loadData());
  }

  async saveSettings(): Promise<void> {
    await super.saveData(this.settings);
  }

  async updateSetting(key: keyof IObsidianHamsterBaseSettings, value: string) {
    this.settings[key] = value;
    await this.saveSettings();

    this.initPlugin();
  }

  async syncHighlights() {
    const webpages = await this.highlightsSyncService.getWebpages();
    await this.app.vault.adapter.mkdir(this.settings.folder);

    for (const webpage of webpages) {
      const pageName =
        this.settings.folder +
        '/' +
        webpage.title.replace(/\//g, '\\').replace(/|/g, '') +
        '.md';
      const content = render(webpage).markdown;

      try {
        const originalContent = await this.app.vault.adapter.read(pageName);
        if (originalContent === content) {
          continue;
        }
      } catch (error) {}
      await this.app.vault.adapter.write(pageName, content);
    }
  }

  private;
}

export default ObsidianHamsterBasePlugin;

function render(webpage: Webpage) {
  const template = `## metadata

title: <%= title %>     
<% if (link) { %>
link: <%= link %>
<% } %> 

## Highlights

<% for (const highlight of highlights) { %>
-  > <%= highlight.text %> ^<%= highlight.highlightId %>
<% if (highlight.note) { %>
    <%= highlight.note %>
<% } %> 
<% } %>`;

  const markdown = ejs.compile(template)({
    ...webpage,
    highlights: webpage.highlights.map((p) => ({
      ...p,
      highlightId: p.highlightId.replace('_', '-'),
    })),
  });

  return {
    markdown,
  };
}

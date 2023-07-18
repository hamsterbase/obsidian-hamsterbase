import { Webpage } from '@hamsterbase/sdk';
import ejs from 'ejs';
import { Notice, Plugin, TFile } from 'obsidian';
import { HighlightsSyncService } from './highlightsService';
import {
  IObsidianHamsterBasePlugin,
  IObsidianHamsterBaseSettings,
} from './plugin';
import { ObsidianHamsterSettingsTab } from './setting';

export class ObsidianHamsterBasePlugin
  extends Plugin
  implements IObsidianHamsterBasePlugin
{
  settings: IObsidianHamsterBaseSettings = {
    folder: 'hamsterbase/highlights',
  };

  private highlightsSyncService = new HighlightsSyncService();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new ObsidianHamsterSettingsTab(this.app, this));
    this.addCommand({
      id: 'sync',
      name: 'Sync highlights to ' + this.settings.folder,
      callback: () => {
        this.syncHighlights();
      },
    });
    this.initPlugin();
  }

  private initPlugin() {
    this.highlightsSyncService.init(
      this.settings.endpoint ?? null,
      this.settings.token ?? null
    );
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
    let webpages: Webpage[] = [];
    try {
      webpages = await this.highlightsSyncService.getWebpages();
    } catch (error) {
      new Notice((error as Error).message, 3000);
    }

    const folderName = this.settings.folder.trim();
    const folder = this.app.vault.getAbstractFileByPath(folderName);
    if (folder === null) {
      try {
        await this.app.vault.createFolder(folderName);
      } catch (error) {
        console.log('failed to create folder', folderName, error.message);
      }
    }
    for (const webpage of webpages) {
      try {
        await this.doSync(folderName, webpage);
      } catch (error) {
        console.log('failed to sync', error.message);
      }
    }
  }

  private async doSync(folderName: string, webpage: Webpage) {
    const pageName =
      folderName +
      '/' +
      webpage.title
        .replace(/\"/g, '')
        .replace(/\</g, '')
        .replace(/\>/g, '')
        .replace(/\*/g, '')
        .replace(/\//g, '')
        .replace(/\|/g, '')
        .replace(/\｜/g, '')
        .replace(/\\/g, '')
        .replace(/\:/g, '') +
      '.md';

    const content = render(webpage).markdown;
    const file = this.app.vault.getAbstractFileByPath(pageName);
    if (file instanceof TFile) {
      const originalContent = await this.app.vault.read(file);
      if (originalContent === content) {
        return;
      } else {
        await this.app.vault.modify(file, content);
      }
    } else if (file === null) {
      await this.app.vault.create(pageName, content);
    }
  }
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

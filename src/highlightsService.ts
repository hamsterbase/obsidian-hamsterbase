import { HamsterBase, Webpage } from '@hamsterbase/sdk';

export class HighlightsSyncService {
  private endpoint: string | null = null;
  private token: string | null = null;

  constructor() {}

  init(endpoint: string | null, token: string | null) {
    this.endpoint = endpoint;
    this.token = token;
  }

  async getWebpages(): Promise<Webpage[]> {
    if (!this.endpoint || !this.token) {
      throw new Error('no endpoint or token');
    }
    const hamsterbase = new HamsterBase({
      endpoint: this.endpoint,
      token: this.token,
      requestLib: fetch,
    });
    const result = await hamsterbase.webpages.list({
      annotated: true,
      per_page: 10000,
    });
    const webpages = await Promise.all(
      result.webpages.map((p) => {
        return hamsterbase.webpages.get(p.id);
      })
    );
    return webpages;
  }
}

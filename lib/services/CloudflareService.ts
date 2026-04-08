import logger from '../logger';

export interface CloudflareDeployResult {
  url: string;
  projectId: string;
  deploymentId: string;
}

export class CloudflareService {
  private accountId: string;
  private apiToken: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
  }

  get isConfigured() {
    return !!(this.accountId && this.apiToken);
  }

  async checkSubdomainAvailable(projectName: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/pages/projects/${projectName}`,
        { headers: { Authorization: `Bearer ${this.apiToken}` } }
      );
      
      const data = await res.json();
      return !data.success; // 404 means it's available
    } catch (e) {
      logger.error('Error checking CF subdomain', { error: String(e) });
      return false;
    }
  }

  async createProject(projectName: string): Promise<any> {
    if (!this.isConfigured) throw new Error('Cloudflare not configured');

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/pages/projects`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          production_branch: 'main',
        }),
      }
    );

    const data = await res.json();
    if (!data.success) {
      // If it fails because it already exists, that's fine, we might just use it.
      if (data.errors?.[0]?.code === 8000007) {
        return;
      }
      throw new Error(data.errors?.[0]?.message || 'Failed to create Pages project');
    }
    return data.result;
  }

  async deployHtml(projectName: string, htmlContent: string): Promise<CloudflareDeployResult> {
    if (!this.isConfigured) throw new Error('Cloudflare not configured');

    await this.createProject(projectName);

    const form = new FormData();
    
    // Convert htmlContent to blob or file format 
    // In Node.js / Next.js, we can pass a Blob
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    
    const manifest = {
      '/index.html': 'content-hash-ignored-for-api'
    };

    form.append('manifest', JSON.stringify(manifest));
    form.append('content-hash-ignored-for-api', htmlBlob, 'index.html');

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/pages/projects/${projectName}/deployments`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiToken}` },
        body: form,
      }
    );

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Failed to deploy to Cloudflare Pages');
    }

    return {
      deploymentId: data.result.id,
      projectId: data.result.project_id,
      url: data.result.url,
    };
  }
}

export const cloudflareService = new CloudflareService();

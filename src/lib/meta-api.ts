import axios, { AxiosInstance, AxiosError } from 'axios';

interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  fbtrace_id?: string;
}

interface MetaAPIResponse<T> {
  data?: T;
  error?: MetaAPIError;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export class MetaAPIClient {
  private client: AxiosInstance;
  private accessToken: string;
  private baseURL = 'https://graph.instagram.com/v21.0';
  private retryCount = 0;
  private maxRetries = 5;
  private retryDelays = [1000, 2000, 4000, 8000, 16000]; // exponential backoff

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Add retry interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          // Rate limited
          if (this.retryCount < this.maxRetries) {
            const delay = this.retryDelays[this.retryCount];
            this.retryCount++;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.client(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get campaigns for an ad account
   */
  async getCampaigns(accountId: string, params?: Record<string, any>) {
    try {
      const response = await this.client.get<MetaAPIResponse<any[]>>(
        `/act_${accountId}/campaigns`,
        {
          params: {
            fields:
              'id,name,status,objective,daily_budget,budget_remaining,created_time,updated_time',
            ...params,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get ad sets for a campaign
   */
  async getAdSets(campaignId: string, params?: Record<string, any>) {
    try {
      const response = await this.client.get<MetaAPIResponse<any[]>>(
        `/${campaignId}/adsets`,
        {
          params: {
            fields:
              'id,name,status,budget,daily_budget,created_time,updated_time,targeting',
            ...params,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get ads for an ad set
   */
  async getAds(adSetId: string, params?: Record<string, any>) {
    try {
      const response = await this.client.get<MetaAPIResponse<any[]>>(
        `/${adSetId}/ads`,
        {
          params: {
            fields: 'id,name,status,creative,adlabels,created_time,updated_time',
            ...params,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get insights (metrics) for a campaign
   */
  async getCampaignInsights(campaignId: string, params?: Record<string, any>) {
    try {
      const response = await this.client.get<MetaAPIResponse<any[]>>(
        `/${campaignId}/insights`,
        {
          params: {
            fields:
              'impressions,clicks,spend,ctr,cpc,cpp,cpm,actions,action_values,reach,frequency,conversion_rate_ranking,engagement_rate_ranking',
            date_preset: 'last_7d',
            ...params,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId: string) {
    return this.updateEntity(campaignId, { status: 'PAUSED' });
  }

  /**
   * Resume a campaign
   */
  async resumeCampaign(campaignId: string) {
    return this.updateEntity(campaignId, { status: 'ACTIVE' });
  }

  /**
   * Update campaign budget
   */
  async updateCampaignBudget(campaignId: string, dailyBudget: number) {
    return this.updateEntity(campaignId, { daily_budget: Math.round(dailyBudget * 100) }); // in cents
  }

  /**
   * Generic update method
   */
  private async updateEntity(entityId: string, params: Record<string, any>) {
    try {
      const response = await this.client.post(`/${entityId}`, params);

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Check if token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.client.get('/me', {
        params: {
          fields: 'id,name',
        },
      });
      return !response.data.error;
    } catch {
      return false;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`Meta API Error [${axiosError.response?.status}]:`, {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
      });

      if (axiosError.response?.status === 401) {
        throw new Error('Unauthorized: Check your access token');
      }

      if (axiosError.response?.status === 429) {
        throw new Error('Rate limited: Too many requests');
      }

      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data as MetaAPIError;
        throw new Error(`Bad request: ${errorData.message}`);
      }
    }

    console.error('Meta API Error:', error);
  }
}

/**
 * Factory function to create a Meta API client
 */
export function createMetaAPIClient(accessToken: string) {
  return new MetaAPIClient(accessToken);
}

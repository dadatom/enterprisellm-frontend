import {API_ENDPOINTS} from "@/services/_url";
import {DifyApp} from "@/types/dify";

export interface DifyServiceBaseData {
  conversation_id: string;
  userId: string;
}

export interface DifyServicePayload<T> {
  app: DifyApp;
  data?: DifyServiceBaseData & T;
}

export interface DifyServiceRenamePayload {
  name: string;
}

export interface DifyServiceMessageFeedbackPayload {
  messageId: string,
  rating: 'like' | 'dislike'
}

export interface DifyServiceGetFilePayload {
  document_id: string
}


export interface DifyServiceResp {
  body: any;
  succ: 0 | 1;
}

class DifyService {
  fetchData<T>(url: string, payload: DifyServicePayload<T>) {
    const {
      app,
      data,
    } = payload;

    return fetch(url, {
      body: JSON.stringify({
        app,
        ...data,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(async (resp) => {
      if ((resp.url as string).includes('getFile')) {
        return resp
      }

      const data = (await resp.json()) as DifyServiceResp;
      if (data?.succ === 1) {
        return data.body;
      }
      return null;
    });
  }

  getData(url: string, params = {}) {
    let fetchUrl = url;
    const keys = Object.keys(params);

    if (keys.length > 0) {
      const paramsStr = keys.map((key) => `${key}=${(params as any)[key]}`).join('&');
      fetchUrl = `${url}?${paramsStr}`;
    }

    return fetch(fetchUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
    }).then(async (resp) => {
      const data = (await resp.json()) as DifyServiceResp;
      console.log('datafetchUrl', data);

      if (data?.succ === 1) {
        return data.body;
      }
      return null;
    });
  }

  renameConversation (data: DifyServicePayload<DifyServiceRenamePayload>) {
    return this.fetchData<DifyServiceRenamePayload>(API_ENDPOINTS.difyRename, data);
  }

  getDatasets (payload: DifyServicePayload<never>) {
    return this.fetchData<DifyServicePayload<never>>(API_ENDPOINTS.difyDatasets, payload);
  }

  getApps() {
    return this.getData(API_ENDPOINTS.difyApps);
  }

  getConversationName (payload: DifyServicePayload<void>) {
    return this.fetchData<void>(API_ENDPOINTS.difyGetName, payload);
  }

  messageFeedback(payload: DifyServicePayload<DifyServiceMessageFeedbackPayload>) {
    return this.fetchData<DifyServiceMessageFeedbackPayload>(API_ENDPOINTS.difyMessageFeedback, payload)
  }

  getFile(payload: DifyServicePayload<DifyServiceGetFilePayload>) {
    return this.fetchData<DifyServiceGetFilePayload>(API_ENDPOINTS.difyGetFile, payload)
  }
}

export const difyService = new DifyService();



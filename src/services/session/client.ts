import { DeepPartial } from 'utility-types';

import { INBOX_SESSION_ID } from '@/const/session';
import { SessionModel } from '@/database/client/models/session';
import { SessionGroupModel } from '@/database/client/models/sessionGroup';
import { UserModel } from '@/database/client/models/user';
import { useUserStore } from '@/store/user';
import { LobeAgentConfig } from '@/types/agent';
import {
  ChatSessionList,
  LobeAgentSession,
  LobeSessionType,
  LobeSessions,
  SessionGroupItem,
  SessionGroups,
} from '@/types/session';

import { ISessionService } from './type';

export class ClientService implements ISessionService {
  async createSession(
    type: LobeSessionType,
    defaultValue: Partial<LobeAgentSession>,
  ): Promise<string> {
    const item = await SessionModel.create(type, defaultValue);
    if (!item) {
      throw new Error('session create Error');
    }
    return item.id;
  }

  async batchCreateSessions(importSessions: LobeSessions) {
    return SessionModel.batchCreate(importSessions);
  }

  async cloneSession(id: string, newTitle: string): Promise<string | undefined> {
    const res = await SessionModel.duplicate(id, newTitle);

    if (res) return res?.id;
  }

  async getGroupedSessions(userId: string, appId: string): Promise<ChatSessionList> {
    return SessionModel.queryWithGroups(userId, appId);
  }

  async getSessionConfig(id: string): Promise<LobeAgentConfig> {
    if (!id || id === INBOX_SESSION_ID) {
      return UserModel.getAgentConfig();
    }

    const res = await SessionModel.findById(id);

    if (!res) throw new Error('Session not found');

    return res.config as LobeAgentConfig;
  }

  async getSessionsByType(type: 'agent' | 'group' | 'all' = 'all'): Promise<LobeSessions> {
    switch (type) {
      // TODO: add a filter to get only agents or agents
      case 'group': {
        return SessionModel.query();
      }
      case 'agent': {
        return SessionModel.query();
      }

      case 'all': {
        return SessionModel.query();
      }
    }
  }

  async getAllAgents(): Promise<LobeSessions> {
    // TODO: add a filter to get only agents
    return await SessionModel.query();
  }

  async countSessions() {
    return SessionModel.count();
  }
  async hasSessions() {
    return (await this.countSessions()) === 0;
  }

  async searchSessions(keyword: string) {
    return SessionModel.queryByKeyword(keyword);
  }

  async updateSession(
    id: string,
    data: Partial<Pick<LobeAgentSession, 'files' | 'group' | 'meta' | 'pinned' | 'conversation_id' | 'datasets'>>,
  ) {
    const pinned = typeof data.pinned === 'boolean' ? (data.pinned ? 1 : 0) : undefined;
    return SessionModel.update(id, { ...data, pinned });
  }

  async updateSessionConfig(activeId: string, config: DeepPartial<LobeAgentConfig>) {
    if (activeId === INBOX_SESSION_ID) {
      return useUserStore.getState().updateDefaultAgent({ config });
    }

    return SessionModel.updateConfig(activeId, config);
  }

  async removeSession(id: string) {
    return SessionModel.delete(id);
  }

  async removeAllSessions() {
    return SessionModel.clearTable();
  }

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  async createSessionGroup(name: string, sort?: number) {
    const item = await SessionGroupModel.create(name, sort);
    if (!item) {
      throw new Error('session group create Error');
    }

    return item.id;
  }

  async batchCreateSessionGroups(groups: SessionGroups) {
    return SessionGroupModel.batchCreate(groups);
  }

  async removeSessionGroup(id: string, removeChildren?: boolean) {
    return await SessionGroupModel.delete(id, removeChildren);
  }

  async updateSessionGroup(id: string, data: Partial<SessionGroupItem>) {
    return SessionGroupModel.update(id, data);
  }

  async updateSessionGroupOrder(sortMap: { id: string; sort: number }[]) {
    return SessionGroupModel.updateOrder(sortMap);
  }

  async getSessionGroups(): Promise<SessionGroupItem[]> {
    return SessionGroupModel.query();
  }

  async removeSessionGroups() {
    return SessionGroupModel.clear();
  }
}

import { getXataClient } from "./xata";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters";

let client = getXataClient();

export function XataAdapter(): Adapter {
  return {
    async createUser(user) {
      const newUser = await client.db.users.create(user);
      return newUser as AdapterUser;
    },
    async getUser(id) {
      const user = await client.db.users.filter({ id }).getFirst();
      return (user as AdapterUser) ?? null;
    },
    async getUserByEmail(email) {
      const user = await client.db.users.filter({ email }).getFirst();
      return (user as AdapterUser) ?? null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const result = await client.db.users_accounts
        .select(["user.*"])
        .filter({
          "account.providerAccountId": providerAccountId,
          "account.provider": provider,
        })
        .getFirst();
      const user = result?.user;
      return (user as AdapterUser) ?? null;
    },
    async updateUser(user) {
      const result = await client.db.users.update(user.id!, user);
      return (result ?? {
        ...user,
        id: user.id!,
        emailVerified: user.emailVerified ?? null,
      }) as AdapterUser;
    },
    async deleteUser(id) {
      let deleted = await client.db.users.delete(id);
      return deleted ? (deleted as AdapterUser) : null;
    },
    async linkAccount(initialAccount) {
      const { userId, ...account } = initialAccount;
      const newXataAccount = await client.db.accounts.create({
        ...account,
        user: { id: userId },
      });
      await client.db.users_accounts.create({
        user: { id: userId },
        account: { id: newXataAccount.id },
      });
    },
    async unlinkAccount({ providerAccountId, provider }) {
      /**
       * @todo refactor this when we support DELETE WHERE.
       */
      const connectedAccount = await client.db.users_accounts
        .filter({
          "account.providerAccountId": providerAccountId,
          "account.provider": provider,
        })
        .getFirst();

      if (!connectedAccount) {
        return;
      }
      let deleted = await client.db.users_accounts.delete(
        connectedAccount.id
      );
      return deleted ? (deleted as unknown as AdapterAccount) : undefined;
    },
    async createSession(initialSession) {
      const { userId, ...session } = initialSession;
      const newXataSession = await client.db.sessions.create({
        ...session,
        user: { id: userId },
      });
      await client.db.users_sessions.create({
        user: { id: userId },
        session: { id: newXataSession.id },
      });
      return { ...session, ...newXataSession, userId } as AdapterSession;
    },
    async getSessionAndUser(sessionToken) {
      const result = await client.db.users_sessions
        .select(["user.*", "session.*"])
        .filter({ "session.sessionToken": sessionToken })
        .getFirst();
      if (!result?.session || !result?.user) {
        return null;
      }

      return {
        session: {
          ...result.session,
          sessionToken: result.session.sessionToken!,
          expires: result.session.expires!,
          userId: result.user.id,
        } as AdapterSession,
        user: {
          ...result.user,
          emailVerified: result.user.emailVerified ?? null,
        } as AdapterUser,
      };
    },
    async updateSession({ sessionToken, ...data }) {
      const session = await client.db.sessions
        .filter({ sessionToken })
        .getFirst();
      if (!session) {
        return null;
      }

      await client.db.sessions.update({ ...session, ...data });
      return {
        ...session,
        sessionToken,
        userId: data.userId!,
        expires: data.expires!,
      };
    },

    async deleteSession(sessionToken) {
      /**
       * @todo refactor this when we support DELETE WHERE.
       */
      const session = await client.db.sessions
        .filter({ sessionToken })
        .getFirst();
      if (!session) {
        return;
      }
      const connectedSession = await client.db.users_sessions
        .filter({ "session.sessionToken": sessionToken })
        .getFirst();
      if (!connectedSession) {
        return;
      }
      await client.db.sessions.delete(session.id);
      await client.db.users_sessions.delete(connectedSession.id);
    },
    async createVerificationToken(token) {
      await client.db.verificationTokens.create({
        expires: token.expires,
        identifier: token.identifier,
        token: token.token,
      });
      return token;
    },
    async useVerificationToken(token) {
      /**
       * @todo refactor this when we support DELETE WHERE.
       */
      const xataToken = await client.db.verificationTokens
        .filter({ identifier: token.identifier, token: token.token })
        .getFirst();
      if (!xataToken) {
        return null;
      }
      await client.db.verificationTokens.delete(xataToken.id);
      return { ...token, expires: new Date() };
    },
  };
}


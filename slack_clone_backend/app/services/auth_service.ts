import User from "#models/user";
import { Secret } from "@adonisjs/core/helpers";

class AuthService {
  async verifyToken(token: string) {
    const secret = new Secret(token);
    const accessToken = await User.accessTokens.verify(secret);

    if (!accessToken || accessToken.isExpired()) {
      return null;
    }

    const user = await User.find(accessToken.tokenableId);
    if (!user) return null;

    return user
  }
}

export default new AuthService();
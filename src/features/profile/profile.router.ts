import { createRouter } from "../../config/create-app";
import { ProfileSchema } from "./profile.schema";
import { ProfileService } from "./profile.service";

export class ProfileRouter {
  private service = new ProfileService();
  private schema = new ProfileSchema();

  public readonly routes = createRouter()
    .openapi(this.schema.getProfile, this.service.getProfile)
    .openapi(this.schema.updateProfile, this.service.updateProfile)
    .openapi(this.schema.changePassword, this.service.changePassword)
    .openapi(this.schema.getSessions, this.service.getSessions)
    .openapi(this.schema.revokeSession, this.service.revokeSession)
    .openapi(this.schema.revokeAllSessions, this.service.revokeAllSessions);
}

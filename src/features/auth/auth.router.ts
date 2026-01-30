import { createRouter } from "../../config/create-app";
import { AuthSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

export class AuthRoutes {
  private service = new AuthService();
  private schema = new AuthSchema();

  public readonly routes = createRouter()
    .openapi(this.schema.signUp, this.service.signUp)
    .openapi(this.schema.signIn, this.service.signIn)
    .openapi(this.schema.refreshToken, this.service.refreshToken)
    .openapi(this.schema.login2FA, this.service.login2FA)
    .openapi(this.schema.sendEmailVerification, this.service.sendEmailVerification)
    .openapi(this.schema.matchOptVerification, this.service.matchOptVerification)
    .openapi(this.schema.logout, this.service.logout)
    // .openapi(this.schema.forgotPassword, this.service.forgotPassword)
    .openapi(this.schema.resetPassword, this.service.resetPassword);
}

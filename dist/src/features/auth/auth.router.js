import { createRouter } from "@/config/create-app";
import { AuthSchema } from "./auth.schema";
import { AuthService } from "./auth.service";
export class AuthRoutes {
    service = new AuthService();
    schema = new AuthSchema();
    routes = createRouter()
        .openapi(this.schema.signUp, this.service.signUp)
        .openapi(this.schema.signIn, this.service.signIn)
        .openapi(this.schema.refreshToken, this.service.refreshToken)
        .openapi(this.schema.logout, this.service.logout)
        .openapi(this.schema.forgotPassword, this.service.forgotPassword)
        .openapi(this.schema.resetPassword, this.service.resetPassword);
}

import { createRouter } from "@/config/create-app";
import { administrationSchema } from "./administration.schema";
import { administrationService } from "./administration.service";

export class administrationRouter {
  private service = new administrationService();
  private schema = new administrationSchema();

  public readonly routes = createRouter()
    .openapi(this.schema.getPermission, this.service.getPermission)
    .openapi(this.schema.createRole, this.service.createRole)
    .openapi(this.schema.getRoleDetails, this.service.getRoleDetails)
    .openapi(this.schema.getRoles, this.service.getRoles)
    .openapi(this.schema.updateRole, this.service.updateRole)

    .openapi(this.schema.createUser, this.service.createUser)
    .openapi(this.schema.getUsers, this.service.getUsers)
    .openapi(this.schema.updateUser, this.service.updateUser)
    .openapi(this.schema.deleteUser, this.service.deleteUser);
}

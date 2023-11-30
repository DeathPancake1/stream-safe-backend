import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class ApiKeyAuthGruard extends AuthGuard('api-key'){}
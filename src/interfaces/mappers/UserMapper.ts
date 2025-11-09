import type { User } from "../../domain/entities/User";

export class UserMapper {
  static toHttp(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive, 
      status: user.isActive ? "ACTIVE" : "INACTIVE", 
      createdAt: user.createdAt
      // no se incluye password ni campos internos
    };
  }
}

import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { Upgrade } from "../upgrade/upgrade.entity";
import { UserUpgrade } from "../UserUpgrade/userUpgrade.entity";
import { Skin } from "../skin/skin.entity";

export function getTypeOrmModuleOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const host = configService.get<string>("DATABASE_HOST", "localhost");
  const port = parseInt(configService.get<string>("DATABASE_PORT", "3306"), 10);
  const username = configService.get<string>("DATABASE_USER");
  const password = configService.get<string>("DATABASE_PASSWORD");
  const database = configService.get<string>("DATABASE_NAME");

  return {
    type: "mysql",
    host,
    port,
    username,
    password,
    database,
    entities: [User, Upgrade, UserUpgrade, Skin],
    synchronize: true,
  };
}

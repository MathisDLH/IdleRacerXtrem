import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Upgrade } from '../upgrade/upgrade.entity';
import { UserUpgrade } from '../UserUpgrade/userUpgrade.entity';
import { Skin } from '../skin/skin.entity';

const host = process.env.DATABASE_HOST || 'localhost';
const port = parseInt(process.env.DATABASE_PORT ?? '3306', 10);
const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

export const AppDataSource = new DataSource({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  entities: [User, Upgrade, UserUpgrade, Skin],
  synchronize: true,
});

export default AppDataSource;



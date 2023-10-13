import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule,
  ],
  providers: [UsersService, AuthService, JwtAuthGuard],
})
export class AppModule {}

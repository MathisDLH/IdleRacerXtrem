import {Module} from '@nestjs/common';
import {RedisService} from './redis.service';
import {redisProvider} from "./redis.provider";
import {RedisController} from "./redis.controller";

@Module({
    controllers: [RedisController],
    providers: [redisProvider, RedisService],
    exports: [RedisService],
})
export class RedisModule {}
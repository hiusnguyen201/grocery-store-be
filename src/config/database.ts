import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { softDeletePlugin } from 'src/database/plugins/softDelete.plugin';

export const databaseConfig = MongooseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    uri: configService.get('mongoUri'),
    connectionFactory: (connection: Connection) => {
      // connection.plugin(softDeletePlugin);
      return connection;
    },
  }),

  inject: [ConfigService],
});

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryController } from './controllers/entry.controller';
import { EntryService } from './services/entry.service';
import { EntryRepository } from './repositories/entry.repository';
import { Entry } from './entities/entry.entity';
import { CustomField } from './entities/custom-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entry, CustomField])],
  controllers: [EntryController],
  providers: [
    EntryService,
    {
      provide: 'IEntryRepository',
      useClass: EntryRepository,
    },
  ],
})
export class EntriesModule {}

import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';
import { CreateEntryDto } from '../dto/create-entry.dto';

export interface IEntryService {
  create(createEntryDto: CreateEntryDto): Promise<Entry>;
  findAll(): Promise<Entry[]>;
  getCustomFieldsByEntryId(entryId: string): Promise<CustomField[]>;
}

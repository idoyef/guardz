import { Entry } from '../entities/entry.entity';
import { CustomField } from '../entities/custom-field.entity';
import { CreateEntryDto } from '../dto/create-entry.dto';

export interface IEntryRepository {
  create(createEntryDto: CreateEntryDto): Promise<Entry>;
  findAll(): Promise<Entry[]>;
  findById(id: string): Promise<Entry | null>;
  findByEmail(email: string): Promise<Entry | null>;
  getCustomFieldsByEntryId(entryId: string): Promise<CustomField[]>;
}
